# Architecture Deep Dive

## 1. Extension Host (`extension/`)

### 1.1 Entry Points

The extension has two entry points bundled by webpack:

- **`extension.node.ts`** -> `extension/dist/extension.js` (desktop)
  - Creates `LanguageClient` with IPC transport (`server/dist/server.node.js`)
  - Calls shared `_activate()` from `extension.common.ts`

- **`extension.web.ts`** -> `extension/dist/web/extension.js` (browser)
  - Creates `LanguageClient` with `Worker` transport (`server/dist/server.web.js`)
  - Calls shared `_activate()` from `extension.common.ts`

### 1.2 Core Activation (`extension.common.ts`)

The `_activate(context)` function:
1. Starts the LSP client and waits for it to be ready
2. Registers custom LSP request handlers for file system access:
   - `custom/file/tree` -> `fileTreeHandler` -- browse workspace files (used by webviews for package discovery)
   - `custom/file` -> `fileHandler` -- read a single file
   - `custom/files` -> `filesHandler` -- batch read multiple files
3. Configures editor settings (disables word-based suggestions, enables quick suggestions in strings)
4. Sets up context key evaluation for toolbar button visibility
5. Registers 5 commands (`betonquest.open*Editor`) and 5 custom editor providers

### 1.3 Custom Editor Provider Pattern

All 5 providers implement `vscode.CustomTextEditorProvider` and follow an identical pattern:

```
resolveCustomTextEditor(doc, webviewPanel, token):
  1. Set webview options (enableScripts, retainContextWhenHidden)
  2. Generate HTML with script tags for webpack chunks
  3. On webview 'edit' message -> create WorkspaceEdit, apply to document
  4. On document change -> postMessage('update', yamlContent) to webview
  5. Handle cursor position sync ('cursor-yaml-path', 'cursor-position')
  6. Handle translation selection changes (conversation + package editors only)
  7. Handle package entries requests (package editor only)
```

**Provider file listing:**

| Provider | File | viewType | Webpack Chunks |
|---|---|---|---|
| `ConversationEditorProvider` | [conversationEditorProvider.ts](../extension/src/conversationEditorProvider.ts) | `betonquest.conversationEditor` | react, vendor, betonquest, i18n, ui_style, yaml, view/components, view/conversationEditor |
| `EventsEditorProvider` | [eventsEditorProvider.ts](../extension/src/eventsEditorProvider.ts) | `betonquest.eventsEditor` | react, vendor, betonquest, betonquest_v1, bukkit, i18n, ui_input, ui_style, yaml, view/legacyListEditor |
| `ConditionsEditorProvider` | [conditionsEditorProvider.ts](../extension/src/conditionsEditorProvider.ts) | `betonquest.conditionsEditor` | (same chunks as events) |
| `ObjectivesEditorProvider` | [objectivesEditorProvider.ts](../extension/src/objectivesEditorProvider.ts) | `betonquest.objectivesEditor` | (same chunks as events) |
| `PackageEditorProvider` | [packageEditorProvider.ts](../extension/src/packageEditorProvider.ts) | `betonquest.packageEditor` | react, vendor, betonquest, betonquest_v2, bukkit, i18n, ui_input, ui_style, yaml, view/components, view/packageEditor |

### 1.4 File System Handlers (`lsp/file.ts`)

Since the LSP server cannot access the file system directly in web context, the extension host acts as a file system proxy:

- **`fileTreeHandler(pattern)`** -- walks workspace directories, returns file tree filtered by glob pattern
- **`fileHandler(uri)`** -- reads a single file's text content
- **`filesHandler(uris[])`** -- batch-reads multiple files in parallel

### 1.5 LSP Client Options (`lsp/options.ts`)

- Document selector: `{ language: 'yaml' }`
- Synchronization: full document sync
- File watchers: `**/*.yml`, `**/*.yaml`

### 1.6 Activation Flow Diagram

```
VS Code starts
  -> onStartupFinished fires
    -> extension.node.ts / extension.web.ts loaded
      -> _activate(context) called
        -> LanguageClient.start()
        -> Wait for server ready
        -> Register custom file handlers (file/tree, file, files)
        -> Configure editor settings
        -> Set up context key evaluator
           -> Check each open document: is it in a BetonQuest package?
              -> Set canActivate*Editor context keys
        -> Register 5 commands
        -> Register 5 CustomTextEditorProvider

User opens a .yml file
  -> Context key evaluator re-runs
    -> Sets appropriate canActivate*Editor key
  -> Toolbar button appears (if when-clause matches)
  -> User clicks button
    -> Command fires -> vscode.commands.executeCommand('vscode.openWith', doc.uri, viewType)
      -> resolveCustomTextEditor(doc, webviewPanel, token)
        -> Webview created and loaded
```

### 1.7 Context Key State Machine

| Context Key | Set Condition | Cleared Condition |
|---|---|---|
| `canActivateConversationEditor` | Active YAML file's path matches `**/conversations/*.yml` and parent dir contains `main.yml` | File closed or doesn't match pattern |
| `canActivateEventsEditor` | Active YAML file is named `events.yml`/`events.yaml` and parent dir contains `main.yml` | File closed or doesn't match |
| `canActivateConditionsEditor` | Active YAML file is named `conditions.yml`/`conditions.yaml` and parent dir contains `main.yml` | File closed or doesn't match |
| `canActivateObjectivesEditor` | Active YAML file is named `objectives.yml`/`objectives.yaml` and parent dir contains `main.yml` | File closed or doesn't match |
| `canActivatePackageEditor` | Active YAML file's parent path contains `QuestPackages/` and `package.yml` exists | File closed or not in QuestPackages |

### 1.8 Editor Lifecycle

```
Create:  User clicks toolbar button or uses "Open With" context menu
  -> vscode.commands.executeCommand('vscode.openWith', uri, viewType)
    -> resolveCustomTextEditor(document, webviewPanel, token)

Resolve: Extension creates webview HTML with script tags
  -> Webview loads React app
  -> Extension sends initial 'update' message with YAML content
  -> Webview renders UI

Update: User edits in text editor
  -> onDidChangeTextDocument fires
    -> Provider posts 'update' message to webview
    -> Webview re-renders with new YAML

Update: User edits in webview
  -> Webview posts 'edit' message
    -> Provider creates WorkspaceEdit
    -> Applies to document

Dispose: User closes the custom editor tab
  -> webviewPanel.onDidDispose fires
    -> Provider cleans up listeners
```

### 1.9 Error Handling Strategy

- **Extension Host**: Catches errors in LSP request handlers and custom editor providers; logs to console; shows `vscode.window.showErrorMessage` for user-facing errors
- **LSP Server**: Never throws exceptions to the client -- all issues are reported as diagnostics on the document
- **Webview**: React error boundaries catch render errors; `YamlErrorPage` component displays parse errors with line/column information
- **Utils**: Validation functions return error messages rather than throwing

---

## 2. LSP Server (`server/`)

### 2.1 Entry Points

- **`server.node.ts`** -- Creates Node.js IPC connection via `vscode-languageserver/node`
- **`server.web.ts`** -- Creates browser connection via `BrowserMessageReader/Writer`
- Both delegate to `server(connection)` in `server.common.ts`

### 2.2 Server Capabilities (`server.common.ts`)

| Capability | Implementation |
|---|---|
| `textDocumentSync` | Incremental |
| `codeActionProvider` | Full -- diagnostic-based quick fixes |
| `hoverProvider` | Full -- markdown content from AST nodes |
| `semanticTokensProvider` | Full -- 22 token types, 10 modifiers |
| `definitionProvider` | Full -- YAML path -> document location |
| `referencesProvider` | Full -- find all references to an element |
| `completionProvider` | Trigger chars: ` `, `,`, `:`, `.`, `"`, `'`, `\n`, `%` |

**Custom request handlers:**
- `custom/locations` -- resolves abstract YAML paths to document offsets
- `custom/packageConditions` -- returns condition names within a package
- `custom/packageEvents` -- returns event names within a package

### 2.3 AST Architecture

The AST is the heart of the LSP server. It parses YAML files into a tree of `AbstractNode` subclasses that support recursive traversal for all LSP features.

#### Class Hierarchy

```
AbstractNode<T, N> (node.ts)
  +-- Properties: parent, children, range (offsets), diagnostics
  +-- Methods: getChildren(), getDiagnostics(), getSemanticTokens(),
  |            getHoverInfos(), getDefinitions(), getReferences(), getCompletions()
  |
  +-- AbstractNodeV1<T> (v1.ts)
  |   +-- Helper methods: getPackages(), getConditionEntries(), getEventEntries(),
  |   |   getObjectiveEntries(), getConversationOptions(), getConversationOptionPointers()
  |   |
  |   +-- PackageV1                  -- Root: contains all documents in a V1 package
  |   +-- ConditionList              -- The `conditions.yml` file
  |   +-- ConditionEntry             -- A single named condition entry
  |   +-- ConditionKey, ConditionKind, ConditionArguments
  |   +-- EventList                  -- The `events.yml` file
  |   +-- EventEntry, EventKey, EventKind, EventArguments
  |   +-- ObjectiveList, ObjectiveEntry, ObjectiveKey, ObjectiveKind, ObjectiveArguments
  |   +-- Conversation               -- One `conversations/<name>.yml`
  |   +-- NpcOption, PlayerOption    -- Conversation option types
  |   +-- ConversationPointers, ConversationConditions, ConversationEvents
  |   +-- Argument* classes          -- Type-safe argument nodes
  |
  +-- AbstractNodeV2<T> (v2.ts)
      +-- Same structure as V1 but for v2 format
      +-- Additional: ConversationSection, ConditionListSection, etc.
      +-- Additional argument types: ArgumentVariable, ArgumentFloat, ArgumentTagName, etc.
```

#### ASTs Manager (`ast.ts`)

The `ASTs` class manages all AST instances across workspace folders:

- **`refreshEntries(workspaceRoot)`** -- Scans for V1 (`main.yml`) and V2 (`QuestPackages/*/package.yml`) packages
- **`handleContentChange(doc, changes)`** -- On document change, merges Incremental content to cached file, re-parses affected AST
- **`buildV1Ast(content, doc)` / `buildV2Ast(content, doc)`** -- Parses YAML via `parseDocument()`, then constructs the typed AST tree

#### AST Node Lifecycle

Every node type follows this pattern:
1. **Constructor** receives parsed YAML data and parent node
2. **`_init()`** -- Parses child nodes, sets offsets
3. **`getSemanticTokens()`** -- Returns token array (recursive from children)
4. **`getHoverInfos(offset)`** -- Returns markdown documentation for a position
5. **`getDefinitions(offset)`** -- Returns definition locations for references
6. **`getReferences(offset)`** -- Returns all references to an element
7. **`getCompletions(offset)`** -- Returns completion items for a position
8. **`getCodeActions(offset)`** -- Returns quick fixes for diagnostics

For full details on every AST node type, see [08-ast-node-reference.md](08-ast-node-reference.md).

### 2.4 Diagnostics System (`utils/diagnostics.ts`)

~50 diagnostic codes categorized as:

| Range | Category |
|---|---|
| `BQ-0001` – `BQ-0099` | General/structural errors |
| `BQ-0100` – `BQ-0199` | Value validation |
| `BQ-1001` – `BQ-1999` | Element validation |
| `BQ-2001` – `BQ-2999` | Argument validation |
| `BQ-3001` – `BQ-3999` | Conversation validation |
| `BQ-4001` – `BQ-4002` | Cross-package/cross-conversation pointer validation |

For the complete diagnostic code reference, see [07-diagnostics-reference.md](07-diagnostics-reference.md).

### 2.5 Semantic Tokens (`service/semanticTokens.ts`)

Maps AST node types to VS Code semantic token types and modifiers:

| AST Concept | Token Type | Modifiers |
|---|---|---|
| Condition names | `class` | — |
| Event names | `function` | — |
| Objective names | `event` | — |
| Keywords | `enumMember` | — |
| Booleans | `macro` | — |
| References/IDs | `typeParameter` | — |
| Deprecated elements | — | `deprecated` |

### 2.6 Request Handling Pipeline

```
Client sends request (e.g., textDocument/hover)
  -> server.common.ts connection.onHover handler
    -> Extract document URI and offset from params
    -> ASTs.get(uri) -> locate AST instance
    -> AST.findNodeAtOffset(offset) -> walk tree to find containing node
    -> node.getHoverInfos(offset)
      -> Node checks if offset is within its range
        -> If yes: return its hover info
        -> Recursively call children[i].getHoverInfos(offset)
      -> Collect and merge results
    -> Format results as LSP Hover response
    -> Return to client
```

This recursive delegation pattern is identical across all LSP features (hover, completions, definitions, references, semantic tokens, code actions).

### 2.7 Document Sync Details

- **Sync mode**: `TextDocumentSyncKind.Incremental`
- **Content cache**: The server maintains a `Map<uri, string>` of document contents
- **Change handling**: On `textDocument/didChange`, the server merges `TextDocumentContentChangeEvent` patches into the cached content, then re-parses only the affected AST subtree
- **Debouncing**: Changes are processed per-event (no artificial debouncing -- the server relies on VS Code's built-in change batching)

### 2.8 AST Cache Strategy

- **Granularity**: One AST per workspace folder (`Map<workspaceRoot, AST>`)
- **Build triggers**: Document open, document change, workspace file watcher events
- **Invalidation**: When a YAML file changes, the containing AST is rebuilt from cached document contents
- **Lifetime**: ASTs persist for the duration of the server session; no TTL eviction

### 2.9 Cross-File Resolution

- **V1 cross-file**: Events, conditions, and objectives are defined in separate files (`events.yml`, `conditions.yml`, `objectives.yml`) and referenced from conversations via IDs. The AST resolves references by searching across all documents in the package.
- **V2 cross-file**: Most references are within a single `package.yml`, but sections like `events:`, `conditions:`, `objectives:` can be spread across multiple files. `SectionCollection` nodes aggregate all sections.
- **Cross-conversation pointers**: In V2, a pointer can reference options in another conversation using `conversationName.optionId` syntax (validated by BQ-4001/BQ-4002 diagnostics).

### 2.10 Completion Provider Details

- **Trigger characters**: ` ` (space), `,`, `:`, `.`, `"`, `'`, `\n` (newline), `%`
- **Context-aware filtering**: Completions vary by cursor position:
  - After a condition kind -> suggest condition arguments
  - Inside an event reference -> suggest known event IDs
  - After `%` -> suggest variable kinds
  - Inside `[...]` in a block selector -> suggest block states
- **Sorting**: Exact matches first, then prefix matches, then substring matches

---

## 3. Webview React Apps (`webview/`)

### 3.1 Editor Types and Components

#### Legacy List Editors (events, conditions, objectives)

All three share the **same React component**: `legacyListEditor/app.tsx` -> `<App<T>>`

```tsx
// webview/src/eventsEditor/index.tsx
ReactDOM.render(<App<Event> />, root);

// webview/src/conditionsEditor/index.tsx
ReactDOM.render(<App<Condition>>, root);

// webview/src/objectivesEditor/index.tsx
ReactDOM.render(<App<Objective>>, root);
```

The `App<T>` generic component:
1. Receives `T` as the element type (`Event`, `Condition`, or `Objective`)
2. Creates a `List<T>` YAML model from the received YAML content
3. Renders elements in a list with inline editing
4. Bidirectional sync: YAML changes -> webview update, user edits -> VS Code WorkspaceEdit

#### Conversation Editor (`conversationEditor/`)

A ReactFlow-based flowchart editor for BetonQuest conversations:
- **Nodes** represent NPC options (conditions, text, events, pointers)
- **Edges** represent conversation flow between options
- **Auto-layout** algorithm for positioning nodes
- **Context menu** for editing option properties
- **Translation selector** for switching display languages

#### Package Editor (`packageEditor/`)

The most complex editor, for BetonQuest v2 packages:
- **Main area:** Tabbed conversation flowcharts (ReactFlow)
- **Resizable sider:** Collapsible lists for Events, Conditions, Objectives, Items
- Each list has item-specific editor forms (Default, Give, KillMob, etc.)
- Full bidirectional YAML sync with cursor path tracking

### 3.2 Webview <-> Extension Messaging Protocol

Messages from **Extension -> Webview**:
```typescript
{ type: 'update', text: string }              // Send YAML content
{ type: 'set-betonquest-translationSelection', data: string }
{ type: 'cursor-yaml-path', data: YamlPath }  // Navigate cursor in YAML
```

Messages from **Webview -> Extension**:
```typescript
{ type: 'edit', text: string }                 // Request YAML edit
{ type: 'request-package-conditions' }         // Fetch package conditions from LSP
{ type: 'request-package-events' }             // Fetch package events from LSP
{ type: 'cursor-yaml-path', data: YamlPath }   // Report cursor position in YAML
```

### 3.3 Shared Components (`webview/src/components/`)

| Component | Purpose |
|---|---|
| `DraggableTag` | Drag-and-drop tag element |
| `ResizableDrawer` | Drawer panel with resize handle |
| `ResizableSider` | Side panel with resize handle (used in package editor) |
| `YamlErrorPage` | Error display for YAML parse failures (shows line/column) |

### 3.4 CSS Theming

All Ant Design components are themed via CSS overrides in `utils/src/ui/` that reference VS Code CSS variables (`--vscode-*`), ensuring the webviews match the user's VS Code theme (light/dark).

### 3.5 State Management

The webviews use **React component state only** — no Redux, MobX, or other external state management libraries.

- **Legacy list editors**: State lives in `App<T>` component via `useState` hooks. The `List<T>` model is reconstructed from YAML on each `update` message.
- **Conversation editor**: ReactFlow manages its own internal node/edge state. The app syncs ReactFlow state <-> YAML via conversion functions.
- **Package editor**: Each tab (conversation) and each sider panel manages its own state. A top-level `Main` component coordinates via props and callbacks.

### 3.6 Conversation Editor Internals

- **Node rendering pipeline**: YAML conversation -> `conversationToFlow()` -> ReactFlow nodes/edges -> custom node components (`NPCNode`, `PlayerNode`, `StartNode`)
- **Edge routing**: Custom `ConnectionLine` component with smooth step paths
- **Auto-layout**: Dagre-based algorithm in `autoLayout.tsx` positions nodes hierarchically
- **Drag-and-drop**: ReactFlow built-in node dragging; @dnd-kit used for list reordering in sider panels

### 3.7 Package Editor Internals

- **Tab management**: Each conversation section gets a tab; tabs can be added, closed, and reordered
- **Sider synchronization**: The sider (ConditionsList, EventsList, ObjectivesList, ItemsList) updates when the active tab changes
- **Cross-editor cursor sync**: Clicking an element in the sider navigates the cursor in the text editor; clicking in the text editor highlights the element in the sider
- **Translation state**: The translation selector in the conversation tab persists across tab switches

### 3.8 Webview Performance

- **React.memo**: Used on list items and conversation nodes to prevent unnecessary re-renders
- **ReactFlow optimization**: `nodesDraggable`, `nodesConnectable`, and `elementsSelectable` are conditionally enabled
- **Virtual rendering**: ReactFlow handles virtual rendering of off-screen nodes automatically
- **Webpack code splitting**: Each editor type loads only the chunks it needs (see [04-build-and-test.md](04-build-and-test.md) §Webpack Code Splitting)

### 3.9 Error Boundaries

The `YamlErrorPage` component is rendered when:
- YAML parsing fails (invalid syntax)
- The YAML structure doesn't match expected BetonQuest format
- A programming error in the webview causes a React render crash

It displays the error message, line/column information, and a suggestion to fix the YAML in the text editor.

---

## 4. Shared Utils (`utils/`)

### 4.1 BetonQuest YAML Data Models

| Class | File | Purpose |
|---|---|---|
| `List<T>` | `List.ts` | Generic ordered list wrapper for YAML arrays of named elements |
| `ListElement` | `ListElement.ts` | Base class: key-value pair with name, kind (type), and arguments |
| `Event` | `Event.ts` | Extends `ListElement` — BetonQuest event |
| `Condition` | `Condition.ts` | Extends `ListElement` — BetonQuest condition |
| `Objective` | `Objective.ts` | Extends `ListElement` — BetonQuest objective |
| `Item` | `Item.ts` | Extends `ListElement` — BetonQuest item |
| `Conversation` | `Conversation.ts` | Full conversation model with NPC/player options |
| `Option` | (in Conversation) | Single conversation option (conditions, text, events, pointers) |
| `Package` | `Package.ts` | Complete v2 package model |
| `Arguments` | `Arguments.ts` | Argument marshalling system with mandatory/optional types |

### 4.2 Bukkit Data Types (`bukkit/`)

TypeScript wrappers around Minecraft/Bukkit enumerations:

| Class | Source Data |
|---|---|
| `EntityType` | Generated from Spigot's `EntityType.java` |
| `Material` | Generated from Spigot's `Material.java` + minecraft-data block states |
| `Enchantment` | Generated from Spigot's `Enchantment.java` |
| `PotionEffectType` | Generated from Spigot's `PotionEffectType.java` |
| `DyeColor` | Generated from Spigot's `DyeColor.java` |
| `Biome` | Generated from Spigot's `Biome.java` |
| `BlockState` | Additional block state data from minecraft-data (1.21.11) |

For full API details, see [06-api-reference.md](06-api-reference.md) §2.

### 4.3 YAML Utilities (`yaml/`)

| Utility | Purpose |
|---|---|
| `yamlPathPointer.ts` | React context for synchronizing cursor positions between YAML and UI |
| `findYamlNodeByOffset.ts` | Locate a YAML AST node by character offset |
| `findOffestByYamlNode.ts` | Reverse: find character offset from a YAML path |

### 4.4 LSP Contract Types (`lsp/`)

Shared TypeScript interfaces for custom LSP requests:
- `FileTreeParams` / `FilesResponse`
- `LocationsParams` / `LocationsResponse`
- `PackageEntriesParams` / `PackageEntriesResponse`

For full contract type definitions, see [06-api-reference.md](06-api-reference.md) §4.

### 4.5 Class Hierarchy (Data Models)

```
ListElement
  +-- key: string
  +-- kind?: string
  +-- args: Arguments
  |
  +-- Event (event-specific methods)
  +-- Condition (condition-specific methods)
  +-- Objective (objective-specific methods)
  +-- Item (item-specific methods, V2 only)

List<T extends ListElement>
  +-- elements: T[]
  +-- add(element), remove(key), get(key)

Arguments
  +-- mandatory: Map<string, string>
  +-- optional: Map<string, string>
  +-- get(key), set(key, value)

Conversation
  +-- quester: string
  +-- npcOptions: Option[]
  +-- playerOptions: Option[]

Option
  +-- name: string
  +-- text: string | Translations
  +-- conditions: string[]
  +-- events: string[]
  +-- pointers: string[]

Package
  +-- conversations: Conversation[]
  +-- events: List<Event>
  +-- conditions: List<Condition>
  +-- objectives: List<Objective>
  +-- items: List<Item>
```

### 4.6 YAML Path System

The `YamlPath` type represents a position in the YAML document as an array of path segments:

```typescript
type YamlPath = (string | number)[];
// Examples:
// ["events", "reward_player"]                    -- the "reward_player" event
// ["events", "reward_player", "kind"]            -- the kind field of an event
// ["conversations", "blacksmith", "NPC_options"] -- NPC options section
```

`yamlPathPointer` is a React context that holds the current cursor YamlPath. Components can both read the current path (to highlight the active element) and write to it (to navigate the cursor).

### 4.7 Argument Resolution

- **V1**: Arguments are parsed from a space-delimited string. Mandatory arguments come first (identified by position), followed by optional arguments (identified by `key:value` syntax).
- **V2**: Arguments are explicit key-value pairs in the YAML map. The `Arguments` class maps each known argument key to its value, distinguishing mandatory from optional.

In the UI, `Input` components (in `utils/src/ui/Input/`) render form controls for each argument based on its type:
- Number arguments -> `<InputNumber>`
- Entity type arguments -> `<EntityType>` (dropdown with Bukkit entities)
- Material arguments -> `<ItemList>` (material selector with search)
- Boolean arguments -> `<Checkbox>`
- Text arguments -> `<TextArea>`

---

## 5. Data Flow Walkthroughs

### 5.1 User Edits in Webview

```
1. User types in a webview form field
   -> React state updates

2. User clicks "Save" or triggers auto-save
   -> webview posts message: { type: 'edit', text: newYamlContent }
   -> extension provider receives message in onDidReceiveMessage

3. Provider creates WorkspaceEdit
   -> Replaces entire document content
   -> vscode.workspace.applyEdit(edit)

4. Document change triggers onDidChangeTextDocument
   -> Provider posts { type: 'update', text: newContent } back to webview
   -> Webview re-renders from updated YAML

5. LSP server receives textDocument/didChange
   -> Merges incremental change into cached content
   -> Rebuilds affected AST
   -> Re-runs diagnostics
   -> Sends textDocument/publishDiagnostics

6. VS Code displays updated diagnostics in the editor
```

### 5.2 User Edits in Text Editor

```
1. User types in the YAML text editor
   -> VS Code sends textDocument/didChange to LSP server

2. Server merges change into cached content
   -> Determines which AST nodes are affected
   -> Calls handleContentChange() on ASTs manager

3. AST re-parses affected nodes
   -> Rebuilds child node tree
   -> Re-computes offsets

4. Server sends updated diagnostics, semantic tokens
   -> textDocument/publishDiagnostics
   -> textDocument/semanticTokens/full

5. If a webview editor is open for this file:
   -> onDidChangeTextDocument fires in the provider
   -> Provider posts { type: 'update', text: newContent } to webview
   -> Webview re-renders
```

### 5.3 Opening a Package Editor

```
1. User opens a .yml file inside a QuestPackages/ directory
   -> Context key canActivatePackageEditor is set
   -> "Open Package Editor" button appears in toolbar

2. User clicks button
   -> Command betonquest.openPackageEditor fires
   -> VS Code calls resolveCustomTextEditor on PackageEditorProvider

3. Provider generates HTML with webpack chunk script tags
   -> Creates webview panel
   -> Webview loads React app

4. Webview sends initial requests:
   -> { type: 'request-package-conditions' }
   -> { type: 'request-package-events' }

5. Provider forwards requests to LSP server:
   -> custom/packageConditions -> returns condition names
   -> custom/packageEvents -> returns event names

6. Provider sends initial YAML content:
   -> { type: 'update', text: fullYamlContent }

7. Webview parses YAML, builds conversation flowcharts, populates sider lists
   -> Package editor is ready for interaction
```

### 5.4 Go-to-Definition Flow

```
1. User Ctrl+Clicks an event ID in a conversation YAML
   -> VS Code sends textDocument/definition request

2. LSP server handler:
   -> Gets document URI and offset
   -> Finds AST for this workspace
   -> AST.findNodeAtOffset(offset) -> returns an AbstractID node (e.g., ConversationEvent)
   -> node.getDefinitions(offset)
     -> AbstractID looks up the referenced event ID
     -> Searches EventList for matching EventEntry
     -> Returns LocationLink with target document URI and range

3. VS Code navigates to the target location
   -> Opens events.yml if not already open
   -> Scrolls to and highlights the definition
```

### 5.5 Cross-File Reference Flow (V1 Conversation -> Event)

```
conversations/blacksmith.yml contains:
  NPC_options:
    greet:
      text: "Hello!"
      events: reward_player   <-- references event defined in events.yml

1. User hovers over "reward_player" in the conversation
   -> LSP server resolves AbstractID node
   -> Looks up "reward_player" in EventList (from events.yml)
   -> Returns hover info with event kind and arguments

2. User clicks "Find All References" on "reward_player" in events.yml
   -> Server searches all conversation files
   -> Finds Event nodes with matching ID
   -> Returns all reference locations

3. If "reward_player" is renamed in events.yml:
   -> Server updates EventEntry key
   -> Diagnostics flag all broken references in conversations
```

---

## 6. Data Generation (`scripts/`)

The `generateData.ts` script:
1. Fetches Java source files from Spigot's Bitbucket repository (Material.java, EntityType.java, etc.)
2. Parses enum constants with regex
3. Merges with minecraft-data npm package (for material block states)
4. Generates JSON data files in `utils/src/bukkit/Data/`
5. Run via `npm run generate-list` (called as part of `npm run compile`)

For details, see [04-build-and-test.md](04-build-and-test.md) §5.

---

## 7. Key Design Decisions

1. **Two AST versions (V1/V2)** — Rather than trying to unify formats, the parser maintains separate but parallel node trees. This allows each version to evolve independently.

2. **Generic `App<T>` for legacy editors** — The three list editors (events/conditions/objectives) share one React component parameterized by element type. This avoids code duplication for nearly identical UIs.

3. **Extension as file-system proxy** — Because the LSP server runs in a web worker in browser mode (no `fs` access), the extension host proxies all file I/O via custom LSP requests.

4. **Incremental document sync** — The server uses `TextDocumentSyncKind.Incremental` and maintains its own content cache, merging diffs rather than re-receiving full documents on every change.

5. **Webpack code splitting** — Webview bundles are aggressively split by domain (betonquest, betonquest_v1, betonquest_v2, bukkit, i18n, yaml, view/*) so that switching between editors reuses cached chunks.

---

## See Also

- [01-project-overview.md](01-project-overview.md) — project introduction and domain concepts
- [06-api-reference.md](06-api-reference.md) — complete API reference for utils/
- [07-diagnostics-reference.md](07-diagnostics-reference.md) — all diagnostic codes
- [08-ast-node-reference.md](08-ast-node-reference.md) — full AST node catalog
- [09-webview-component-catalog.md](09-webview-component-catalog.md) — React component catalog
- [../kb/lsp-custom-requests.md](../kb/lsp-custom-requests.md) — LSP custom request protocol details
- [../kb/webview-messaging.md](../kb/webview-messaging.md) — webview messaging protocol details
- [../kb/ast-system.md](../kb/ast-system.md) — AST system internals and rationale

---

*Last updated: 2026-05-26*
