# Development Guide

## 1. Getting Started

### 1.1 Prerequisites

- Node.js 18+ (development uses `@types/node@20.11.19`)
- npm 9+
- VS Code 1.80+

### 1.2 Setup

```bash
git clone https://github.com/EverMCServer/vscode-BetonQuest.git
cd vscode-BetonQuest
npm install        # installs root + all sub-project dependencies
npm run compile    # full build (generate data -> tsc -> webpack)
```

### 1.3 Development Workflow

```bash
npm run watch      # start watch mode (tsc + webpack in parallel)
```

Then press **F5** in VS Code to launch the Extension Development Host with the extension loaded.

---

## 2. Common Development Tasks

### 2.1 Adding a New LSP Feature

1. **Define the feature on `AbstractNode`** (in [server/src/ast/node.ts](../server/src/ast/node.ts)) if it applies to all nodes, or on specific node subclasses.

2. **Implement `_get<Feature>()`** on each relevant AST node type. The convention is:
   - Check if the offset falls within this node's range
   - If yes, return this node's contribution + recurse into children
   - If no, return empty

3. **Wire it up in `server.common.ts`**:
   ```typescript
   connection.on<Feature>(requestType, (params) => {
     // Extract offset, find relevant AST, call node.get<Feature>()
   });
   ```

4. **Update `InitializeResult.capabilities`** in `server.common.ts` to advertise the new capability.

### 2.2 Adding a New Custom Editor

1. **Create the provider** in `extension/src/<name>EditorProvider.ts`:
   - Copy an existing provider (e.g., [eventsEditorProvider.ts](../extension/src/eventsEditorProvider.ts))
   - Change the `viewType` static
   - Point to the correct webview entry/webpack chunks

2. **Register in `extension.common.ts`**:
   ```typescript
   context.subscriptions.push(
     XxxEditorProvider.register(context)
   );
   ```

3. **Add command** in `package.json` under `contributes.commands`

4. **Add custom editor** in `package.json` under `contributes.customEditors` with appropriate `selector` filename patterns

5. **Add toolbar button** in `package.json` under `contributes.menus["editor/title"]` with appropriate `when` clause

6. **Create the webview React app** in `webview/src/<name>Editor/`

7. **Add webpack entry** in `webpack.common.js` under `webviewConfig.entry`

### 2.3 Adding a New Bukkit Data Type

1. **Add parsing logic** in [scripts/generateData.ts](../scripts/generateData.ts) to extract the enum from Spigot's Java source or minecraft-data
2. **Create the TypeScript class** in `utils/src/bukkit/DataType/` following the pattern of existing types
3. **Regenerate data**: `npm run generate-list`

### 2.4 Adding a New Translation

1. **Create locale file** in `utils/src/i18n/data/<locale>.json` following the structure of `en.json`
2. **Register the locale** in `utils/src/i18n/i18n.ts` in the `allLanguages` array
3. **Add package.nls** file at root level for VS Code UI strings (`package.nls.<locale>.json`)

### 2.5 Modifying the AST Parser

The AST parser is in `server/src/ast/`. Key files:
- **[ast.ts](../server/src/ast/ast.ts)** — `ASTs` class manages all AST instances. Modify `buildV1Ast()` / `buildV2Ast()` to change how YAML is parsed into AST nodes.
- **[v1.ts](../server/src/ast/v1.ts) / [v2.ts](../server/src/ast/v2.ts)** — Version-specific `AbstractNodeV1`/`V2` base classes. Add shared helper methods here.
- **[v1/*.ts](../server/src/ast/v1/) / [v2/*.ts](../server/src/ast/v2/)** — Individual node types. Each file usually contains one node class.

When adding a new node type:
1. Create the file in `v1/` or `v2/` (or both)
2. Extend `AbstractNodeV1<T>` or `AbstractNodeV2<T>`
3. Implement `_init()` to parse children from YAML data
4. Implement LSP feature methods (`_getSemanticTokens()`, `_getHoverInfo()`, etc.)
5. Register the node in the parent's `_init()` method

### 2.6 Adding a New Diagnostic Code

1. **Define the enum value** in [server/src/utils/diagnostics.ts](../server/src/utils/diagnostics.ts):
   ```typescript
   export enum DiagnosticCode {
     MyNewDiag = "BQ-XXXX",  // Choose next available number in appropriate range
   }
   ```

2. **Add the diagnostic** in the appropriate AST node's `_init()` or dedicated validation method:
   ```typescript
   this.diagnostics.push({
     code: DiagnosticCode.MyNewDiag,
     range: { start: this.offsetStart, end: this.offsetEnd },
     severity: DiagnosticSeverity.Error,
     message: "Description of what's wrong",
   });
   ```

3. **Optionally add a code action** in `_getCodeActions()` to provide an automatic fix.

4. **Update [07-diagnostics-reference.md](07-diagnostics-reference.md)** with the new code.

### 2.7 Adding a New Semantic Token Type

1. **Add the enum value** in [server/src/service/semanticTokens.ts](../server/src/service/semanticTokens.ts)
2. **Add a legend entry** for the token type (or modifier)
3. **Return the token** from `_getSemanticTokens()` in the relevant AST nodes
4. **Update the legend** in `server.common.ts` capabilities

### 2.8 Adding a New UI Input Component

1. **Create the component** in `utils/src/ui/Input/<Name>.tsx` following the `InputProps<T>` pattern:
   ```typescript
   interface MyInputProps extends InputProps<MyType> {
     extraOption?: boolean;
   }
   export function MyInput(props: MyInputProps): JSX.Element { ... }
   ```

2. **Register in `Input.tsx`** — add the component to the input registry/dispatch map

3. **Add argument specification** in `utils/src/betonquest/v2/Element.ts` (and/or V1) for element kinds that use this argument type

### 2.9 Adding a New Conversation Node Type (ReactFlow)

1. **Create the node component** in `webview/src/conversationEditor/components/<Name>Node.tsx` following the pattern of existing nodes
2. **Add node type to `conversationToFlow.tsx`** — map the YAML structure to this node type
3. **Handle in `ConversationEditor.tsx`** — register the node type with ReactFlow
4. **Add styles** in the appropriate CSS file

### 2.10 Modifying the YAML Parser

The YAML parsing layer uses the `yaml` npm package. Key entry points:
- **[ast.ts](../server/src/ast/ast.ts)** — `parseDocument(content)` returns a `yaml.Document`
- **[v1/document.ts](../server/src/ast/v1/document.ts) / [v2/document.ts](../server/src/ast/v2/document.ts)** — `Document` class wraps the parsed YAML and provides offset-to-range conversion

When changing parsing behavior:
1. Modify `buildV1Ast()` or `buildV2Ast()` in `ast.ts`
2. Update affected node types' `_init()` methods
3. Test with both valid and invalid YAML inputs

---

## 3. Debugging

### 3.1 Desktop Extension

1. Press **F5** to launch Extension Development Host
2. Set breakpoints in `extension/src/` files
3. For LSP server debugging: attach to the server process (it runs as a separate Node.js process)

### 3.2 Web Extension

```bash
npm run open-in-browser
```

Opens the extension in a Chromium-based browser with DevTools on port 9221.

### 3.3 Webview Debugging

1. While the extension is running, open the Command Palette (`Ctrl+Shift+P`)
2. Run **"Developer: Open Webview Developer Tools"**
3. This opens Chrome DevTools for the webview's embedded browser context

### 3.4 Debugging AST Issues

Inspect the AST tree at runtime:
1. Set a breakpoint in the `ASTs` manager after `buildV1Ast()` or `buildV2Ast()`
2. Inspect the returned node tree: check parent/child relationships, offsets, diagnostics
3. Use the VS Code debug console to evaluate `node.getDiagnostics()` or `node.getSemanticTokens()`

### 3.5 Debugging Webview State

1. Open Webview Developer Tools (see §3.3)
2. Use the React DevTools (if available) or console.log component state
3. Check the message log: `window.addEventListener('message', console.log)` to see all extension->webview messages

### 3.6 Debugging LSP Communication

To log all LSP messages between extension and server:
1. Set a breakpoint in `server.common.ts` at the connection handler
2. Inspect `params` to see what data the server receives
3. Log custom request/response payloads with `console.log` in the handler

### 3.7 Performance Profiling

- **Extension host:** VS Code's built-in "Running Extensions" view shows activation time
- **LSP server:** Node.js profiler or manual timing with `console.time`/`console.timeEnd`
- **Webview:** Chrome DevTools Performance tab in webview developer tools

---

## 4. Common Issues

| Issue | Likely Cause | Fix |
|---|---|---|
| Webview shows blank page | Webpack chunks not loaded | Check webpack output for errors; verify chunk paths in provider HTML |
| LSP features not working | Server not started or AST not built | Check `server.common.ts` initialization; verify `onDidChangeContent` handler |
| Custom editor button not showing | Context key not set | Verify `canActivate*Editor` logic in `extension.common.ts` |
| Bukkit data types missing | Data not generated | Run `npm run generate-list` |

---

## 5. Common Pitfalls

### Offset vs Line/Column Confusion

All AST positions use **character offsets** (0-based index into the document string), not line/column positions. Conversion to line/column happens at the service layer via `document.positionAt(offset)`. When adding new AST nodes, use offsets for internal computation and only convert at the LSP response boundary.

### Webview postMessage Async Nature

`postMessage` is asynchronous. The extension cannot assume the webview has processed a message immediately after sending it. Use message acknowledgment patterns for critical operations.

### VS Code API Availability (Desktop vs Web)

Not all `vscode.*` APIs are available in web extensions. Specifically:
- `fs` module is not available (use custom LSP file requests)
- `child_process` is not available (no `exec`/`spawn`)
- Some `vscode.workspace.fs` methods may be limited

Always test on both targets when adding features that touch the file system or system APIs.

### YAML Parsing Edge Cases

The `yaml` npm package has quirks:
- Bare strings without quotes can be misinterpreted (e.g., `true`, `false`, `null`, numbers)
- Multi-line strings with `|` or `>` have different parsing behavior
- Comments (`#`) are stripped during parsing and offsets shift

When working with YAML offsets, always account for comments and formatting.

### ReactFlow Controlled vs Uncontrolled

ReactFlow nodes and edges can be managed as controlled (you manage state) or uncontrolled (ReactFlow manages state internally). The conversation editor uses a hybrid approach: positions are uncontrolled (ReactFlow manages layout), but the node/edge data is controlled (synced from YAML).

---

## 6. FAQ

### Why two AST versions instead of one unified parser?

V1 and V2 have fundamentally different YAML structures. V1 uses positional space-delimited arguments; V2 uses named key-value arguments. V1 files are standalone; V2 sections can span multiple files. Unifying them would create a complex lowest-common-denominator abstraction. Separate parallel trees let each version evolve cleanly.

### Why not use Redux (or other state management) for webview state?

The webview state is relatively simple: a single YAML document and derived UI state. React's built-in `useState` and `useContext` are sufficient. Adding Redux would increase bundle size and complexity without proportional benefit.

### Why webpack instead of esbuild or Vite?

The project started before Vite was mature for VS Code extensions. Webpack's code splitting (15 chunk groups) is essential for keeping webview load times low when switching between editors. Migrating to Vite would require re-engineering the code splitting strategy.

### Why a custom i18n system instead of vscode-nls?

`vscode-nls` works for extension host strings but not for webview content or LSP hover data. The custom system in `utils/src/i18n/` provides a unified `L()` function that works across all three contexts (extension host via `package.nls.json`, webview via the utils i18n, server hover via the utils i18n).

### How do I test my changes?

Currently, manual testing via F5 is the primary method. See [04-build-and-test.md](04-build-and-test.md) §4 for the test infrastructure status and plans. For AST changes, test by opening various BetonQuest YAML files and verifying diagnostics/semantic tokens/hover/completions work correctly.

### How do I add support for a new Minecraft version?

1. Update `minecraft-data` dependency in root `package.json`
2. Run `npm run generate-list`
3. Test completions to verify new materials/entities appear
4. Check for removed/renamed items that may break existing code

---

## 7. Architecture Rules

When contributing, follow these constraints:

1. **Extension host must never directly import from `utils/`** — communication goes through LSP or postMessage
2. **AST nodes must be tree-structured** — every node has a parent and children; offsets must be strictly nested
3. **No file system access in server code** — all file I/O goes through custom LSP requests to the extension host (required for web compatibility)
4. **Webview code must work in a browser** — no Node.js APIs, no `require()`, no `fs`
5. **Shared types go in `utils/src/lsp/`** — this is the contract layer between extension and server
6. **Path aliases**: use `betonquest-utils/*` in imports (resolved by webpack and tsconfig paths)

---

## 8. Project-Specific Terminology

### BetonQuest Domain Terms

| Term | Meaning |
|---|---|
| **Package** | A BetonQuest quest package — either a V1 folder with `main.yml` or a V2 folder inside `QuestPackages/` with `package.yml` |
| **Conversation** | An NPC dialogue tree with options, conditions, events, and pointers |
| **Option** | A single node in a conversation (either NPC dialogue or player response) |
| **Pointer** | A link from one conversation option to another |
| **Condition** | A check that must be true (e.g., "has item", "has permission") |
| **Event** | An action that fires (e.g., "give item", "teleport", "message") |
| **Objective** | A quest objective the player must complete |
| **Item** | A named item definition with material, amount, enchantments (V2 only) |
| **Element Kind** | The specific type of an element (e.g., event kind "message", condition kind "hasItem") |
| **Arguments** | Key-value parameters for an element (mandatory or optional) |
| **Instruction** | The full kind + arguments string (V1) or object (V2) |
| **Variable** | A `%variable.kind.instructions%` reference in V2 arguments |

### LSP Terms

| Term | Meaning |
|---|---|
| **AST** | Abstract Syntax Tree — the parsed representation of a YAML document |
| **Document** | A VS Code text document (file) being edited |
| **Offset** | Character position in a document (0-based) |
| **Diagnostic** | An error, warning, or info message on a document range |
| **Semantic Token** | A syntax-highlighted span with a token type and modifiers |
| **Completion Item** | A suggestion in the code completion dropdown |
| **Hover** | A tooltip shown on hover over a position |
| **Code Action** | A quick-fix offered for a diagnostic |

### VS Code Extension Terms

| Term | Meaning |
|---|---|
| **Extension Host** | The Node.js process where VS Code extensions run |
| **Language Client** | The extension-side half of the LSP protocol |
| **Custom Editor** | A webview-based editor that replaces the default text editor |
| **Webview** | An embedded browser view inside VS Code |
| **Context Key** | A boolean key used in `when` clauses to control UI visibility |
| **Activation Event** | An event that triggers extension activation (e.g., `onStartupFinished`) |

### Webpack Terms

| Term | Meaning |
|---|---|
| **Chunk** | A bundled JS file output by webpack |
| **SplitChunks** | Webpack optimization that extracts shared code into separate chunks |
| **Entry Point** | The starting file webpack uses to build a dependency graph |
| **Target** | The runtime environment: `node`, `web`, `webworker` |

### AST Terms

| Term | Meaning |
|---|---|
| **Container Node** | A node that exists to group children (e.g., EventList) |
| **Entry Node** | A node representing a single named element (e.g., EventEntry) |
| **Key Node** | A node for an element's ID/name |
| **Kind Node** | A node for an element's type/kind |
| **Argument Node** | A node for an argument key-value pair |
| **Abstract ID** | A node that references another element by ID (resolves definitions/references) |

---

## See Also

- [01-project-overview.md](01-project-overview.md) — BetonQuest domain concepts
- [02-architecture.md](02-architecture.md) — system architecture
- [03-coding-paradigm.md](03-coding-paradigm.md) — coding conventions and patterns
- [04-build-and-test.md](04-build-and-test.md) — build, test, and packaging
- [06-api-reference.md](06-api-reference.md) — utils API reference
- [07-diagnostics-reference.md](07-diagnostics-reference.md) — diagnostic code catalog
- [08-ast-node-reference.md](08-ast-node-reference.md) — AST node catalog
- [09-webview-component-catalog.md](09-webview-component-catalog.md) — React component catalog
- [10-troubleshooting-and-faq.md](10-troubleshooting-and-faq.md) — troubleshooting reference

---

*Last updated: 2026-05-26*
