# Webview Component Catalog

Catalog of all React components used in the webview editors. For the utility-side UI input components, see [06-api-reference.md](06-api-reference.md) §6.

---

## 1. Shared Components

All shared components are in [webview/src/components/](../webview/src/components/).

### `DraggableTag`

**File:** [DraggableTag.tsx](../webview/src/components/DraggableTag.tsx)

A draggable tag element used in list editors for reordering items.

**Props:**
```typescript
interface DraggableTagProps {
  id: string;                          // Unique drag ID
  index: number;                       // Position in list
  label: string;                       // Display text
  onMove: (from: number, to: number) => void;  // Reorder callback
  onRemove?: (index: number) => void;  // Remove callback (shows X button)
  onEdit?: (index: number) => void;    // Click to edit callback
  className?: string;
}
```

**Behavior:**
- Uses `@dnd-kit/core` for drag-and-drop
- Renders a tag/chip with the element name, kind icon, and optional action buttons
- Emits `onMove` when the user drops the tag at a new position
- Emits `onRemove` when the X button is clicked (if provided)

### `DraggableList`

**File:** [DraggableList.tsx](../webview/src/components/DraggableList.tsx)

A sortable list built on `@dnd-kit` that renders `DraggableTag` items.

**Props:**
```typescript
interface DraggableListProps {
  items: Array<{ id: string; label: string }>;
  onReorder: (from: number, to: number) => void;
  onRemove?: (index: number) => void;
  onEdit?: (index: number) => void;
  renderExtra?: (item: unknown, index: number) => ReactNode;  // Extra content per item
}
```

**Behavior:**
- Wraps `@dnd-kit`'s `DndContext` and `SortableContext`
- Renders each item as a `DraggableTag`
- Handles drag start, drag over, and drag end events
- Smooth animation during reorder

### `ResizableDrawer`

**File:** [ResizableDrawer.tsx](../webview/src/components/ResizableDrawer.tsx)

A drawer panel with a draggable resize handle.

**Props:**
```typescript
interface ResizableDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  defaultWidth?: number;               // Initial width in pixels
  minWidth?: number;
  maxWidth?: number;
}
```

**Behavior:**
- Slide-in panel from the right side
- Draggable left edge for resizing
- Width persisted in local state
- Close button in header

### `ResizableSider`

**File:** [ResizableSider.tsx](../webview/src/components/ResizableSider.tsx)

A side panel with a draggable resize handle. Used extensively in the package editor.

**Props:**
```typescript
interface ResizableSiderProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}
```

**Behavior:**
- Fixed side panel (left side in package editor)
- Draggable right edge for resizing
- Collapse/expand toggle button
- Width persisted in local state

### `YamlErrorPage`

**File:** [YamlErrorPage.tsx](../webview/src/components/YamlErrorPage.tsx)

Error display page shown when YAML parsing fails.

**Props:**
```typescript
interface YamlErrorPageProps {
  error: Error | string;               // Error object or message
  yamlContent?: string;                // The raw YAML that failed to parse
}
```

**Behavior:**
- Displays a red error banner with the error message
- Shows line/column information if available
- Suggests fixing the YAML in the text editor
- Rendered as a full-page overlay

---

## 2. Conversation Editor Components

All conversation editor components are in [webview/src/conversationEditor/](../webview/src/conversationEditor/).

### `ConversationEditor`

**File:** [components/ConversationEditor.tsx](../webview/src/conversationEditor/components/ConversationEditor.tsx)

The main ReactFlow wrapper component for the conversation flowchart.

**State:**
- `nodes: Node[]` — ReactFlow nodes (one per NPC/player option)
- `edges: Edge[]` — ReactFlow edges (pointers between options)
- `selectedNode: string | null` — Currently selected node ID

**Key behaviors:**
- Converts YAML conversation -> ReactFlow graph via `conversationToFlow()`
- Auto-layouts nodes via `autoLayout()`
- Handles node selection, edge creation/deletion
- Right-click context menu for editing node properties

### `NPCNode`

**File:** [components/NPCNode.tsx](../webview/src/conversationEditor/components/NPCNode.tsx)

Custom ReactFlow node rendering for NPC dialogue options.

**Visual:**
- Rounded rectangle with NPC icon
- Shows: option ID, first line of text, condition count, event count
- Color-coded by option state (has conditions = blue, no conditions = green)
- Selected state: highlighted border

### `PlayerNode`

**File:** [components/PlayerNode.tsx](../webview/src/conversationEditor/components/PlayerNode.tsx)

Custom ReactFlow node rendering for player response options.

**Visual:**
- Rounded rectangle with player icon (different shape from NPC nodes)
- Shows: option ID, first line of text
- Lighter color than NPC nodes

### `StartNode`

**File:** [components/StartNode.tsx](../webview/src/conversationEditor/components/StartNode.tsx)

Special ReactFlow node representing conversation entry points.

**Visual:**
- Small circle or pill shape
- "Start" label
- Edge connects to first NPC options

### `ConnectionLine`

**File:** [components/ConnectionLine.tsx](../webview/src/conversationEditor/components/ConnectionLine.tsx)

Custom ReactFlow edge/connection line rendering.

**Visual:**
- Smooth step path (not straight lines)
- Arrow at target end
- Color matches VS Code theme

### `ContextMenu`

**File:** [components/ContextMenu.tsx](../webview/src/conversationEditor/components/ContextMenu.tsx)

Right-click context menu for conversation nodes.

**Menu items:**
- Edit text
- Add/remove conditions
- Add/remove events
- Add pointer
- Delete option
- Add new NPC option
- Add new player option

### `TranslationSelector`

**File:** [components/TranslationSelector.tsx](../webview/src/conversationEditor/components/TranslationSelector.tsx)

Dropdown selector for switching the display language of conversation text.

**Props:**
```typescript
interface TranslationSelectorProps {
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
  availableLocales: string[];
}
```

**Behavior:**
- Displays current language flag/label
- Dropdown with available locales
- On change, posts message to extension to update `betonquest.setting.translationSelection`

### `autoLayout`

**File:** [utils/autoLayout.tsx](../webview/src/conversationEditor/utils/autoLayout.tsx)

Dagre-based auto-layout algorithm for conversation flowcharts.

```typescript
function autoLayout(nodes: Node[], edges: Edge[]): { nodes: Node[]; edges: Edge[] };
```

**Algorithm:**
1. Builds a directed graph from nodes and edges
2. Uses dagre to compute hierarchical layout (top-to-bottom)
3. Assigns x, y positions to each node
4. Returns updated nodes with positions

### `conversationToFlow`

**File:** [utils/conversationToFlow.tsx](../webview/src/conversationEditor/utils/conversationToFlow.tsx)

Converts a BetonQuest `Conversation` model to ReactFlow nodes and edges.

```typescript
function conversationToFlow(conversation: Conversation): {
  nodes: Node[];
  edges: Edge[];
};
```

**Conversion:**
- Each option -> ReactFlow node (NPC= `NPCNode`, player= `PlayerNode`)
- Start entries -> `StartNode` + edges to first options
- Pointers -> edges between option nodes
- Preserves option metadata for editing

### `commonUtils`

**File:** [utils/commonUtils.tsx](../webview/src/conversationEditor/utils/commonUtils.tsx)

Shared utility functions for conversation editing:
- YAML <-> Conversation model conversion
- Option CRUD operations
- Edge validation

---

## 3. Package Editor Components

All package editor components are in [webview/src/packageEditor/](../webview/src/packageEditor/).

### `App`

**File:** [app.tsx](../webview/src/packageEditor/app.tsx)

Top-level React component for the package editor. Renders `<Main>` with VS Code API integration.

### `Main`

**File:** [components/Main.tsx](../webview/src/packageEditor/components/Main.tsx)

The top-level layout component.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│  Tab: conv1 | Tab: conv2 | Tab: conv3 | [+Tab]   │
├──────────────────────────────────────────────────┤
│                                          │        │
│  Conversation Flowchart (ReactFlow)      │ Sider  │
│                                          │        │
│  - NPC nodes, player nodes, edges        │ Events │
│  - Auto-layout                           │ Conds  │
│  - Context menu                          │ Objs   │
│                                          │ Items  │
├──────────────────────────────────────────────────┤
│  Status bar / error display                      │
└──────────────────────────────────────────────────┘
```

**State:**
- `activeTab: string` — currently active conversation tab
- `tabs: string[]` — list of open conversation names
- `yamlContent: string` — current YAML content
- `packageConditions: PackageConditionEntry[]` — from LSP
- `packageEvents: PackageEventEntry[]` — from LSP

### `Sider`

**File:** [components/Sider.tsx](../webview/src/packageEditor/components/Sider.tsx)

The resizable side panel containing element lists.

**Contains:**
- EventsList
- ConditionsList
- ObjectivesList
- ItemsList

Each list is collapsible (accordion-style). The sider width is adjustable via drag handle.

### `ConversationEditor` (Package)

**File:** [components/Main/ConversationEditor.tsx](../webview/src/packageEditor/components/Main/ConversationEditor.tsx)

Same as the standalone ConversationEditor, adapted for tabbed use within the package editor. Shares utilities from `conversationEditor/utils/`.

### `ConversationTabLabel`

**File:** [components/Main/ConversationTabLabel.tsx](../webview/src/packageEditor/components/Main/ConversationTabLabel.tsx)

Custom tab label rendering for conversation tabs.

**Visual:**
- Conversation name (NPC quester name if available)
- Close button (X)
- Modified indicator (dot) if unsaved changes

### `CommonList`

**File:** [components/Sider/CommonList.tsx](../webview/src/packageEditor/components/Sider/CommonList.tsx)

Generic collapsible list component used by all sider lists.

**Props:**
```typescript
interface CommonListProps<T extends ListElement> {
  title: string;                         // Panel header (e.g., "Events")
  elements: T[];
  onAdd: () => void;
  onRemove: (key: string) => void;
  onEdit: (element: T) => void;
  renderEditor: (element: T) => ReactNode;
}
```

### `CommonEditor`

**File:** [components/Sider/CommonEditor.tsx](../webview/src/packageEditor/components/Sider/CommonEditor.tsx)

Generic element editor form used when an element is selected for editing.

### `ConditionsList` / `EventsList` / `ObjectivesList` / `ItemsList`

**Files:**
- [components/Sider/ConditionsList.tsx](../webview/src/packageEditor/components/Sider/ConditionsList.tsx)
- [components/Sider/EventsList.tsx](../webview/src/packageEditor/components/Sider/EventsList.tsx)
- [components/Sider/ObjectivesList.tsx](../webview/src/packageEditor/components/Sider/ObjectivesList.tsx)
- [components/Sider/ItemsList.tsx](../webview/src/packageEditor/components/Sider/ItemsList.tsx)

Each wraps `CommonList` with type-specific configuration. Each has an associated editor component:
- `ConditionsList/ConditionsEditor.tsx` + `ConditionsEditor/Default.tsx`
- `EventsList/EventsEditor.tsx` + `EventsEditor/Default.tsx`, `Give.tsx`, `KillMob.tsx`
- `ObjectivesList/ObjectivesEditor.tsx` + `ObjectivesEditor/Default.tsx`
- ItemsList — render-only (V2 items are not directly editable in the sider)

---

## 4. Legacy List Editor Components

All legacy list editor components are in [webview/src/legacyListEditor/](../webview/src/legacyListEditor/).

### `App<T extends ListElement>`

**File:** [app.tsx](../webview/src/legacyListEditor/app.tsx)

Generic list editor component shared by events, conditions, and objectives editors.

```typescript
function App<T extends ListElement>(): JSX.Element;
```

**State:**
- `list: List<T>` — parsed from YAML
- `editingElement: T | null` — currently selected element for editing
- `yamlContent: string` — raw YAML string

**Behavior:**
1. Receives YAML content via `update` message from extension
2. Parses into `List<T>` using type-specific element constructors
3. Renders elements as a list with inline editing capabilities
4. On user edit, posts `edit` message back to extension with serialized YAML
5. Syncs cursor position via `cursor-yaml-path` messages

### `CommonList` (Legacy)

**File:** [components/CommonList.tsx](../webview/src/legacyListEditor/components/CommonList.tsx)

Simplified list component for legacy editors. Similar to the package editor's CommonList but without sider-specific features.

### `CommonEditor` (Legacy)

**File:** [components/CommonEditor.tsx](../webview/src/legacyListEditor/components/CommonEditor.tsx)

Element editor form for legacy editors. Renders form fields based on the element's kind and arguments.

---

## 5. Entry Points

Each webview has an `index.tsx` entry point that mounts the React app.

| Entry Point | File | Component | Description |
|---|---|---|---|
| Conversation Editor | [conversationEditor/index.tsx](../webview/src/conversationEditor/index.tsx) | `ConversationEditor` | Standalone conversation flowchart |
| Events Editor | [eventsEditor/index.tsx](../webview/src/eventsEditor/index.tsx) | `<App<Event>>` | Legacy list editor for events |
| Conditions Editor | [conditionsEditor/index.tsx](../webview/src/conditionsEditor/index.tsx) | `<App<Condition>>` | Legacy list editor for conditions |
| Objectives Editor | [objectivesEditor/index.tsx](../webview/src/objectivesEditor/index.tsx) | `<App<Objective>>` | Legacy list editor for objectives |
| Package Editor | [packageEditor/index.tsx](../webview/src/packageEditor/index.tsx) | `Main` | Full V2 package editor |

### VS Code API Integration

Each webview includes a `vscode.ts` file that provides:
- `vscode` API access (postMessage, getState, setState)
- Message listener setup
- Theme detection

---

## 6. Style System

### Component CSS Files

All CSS uses CSS Modules with VS Code theme variable integration.

**Shared styles:**
- [DraggableList.css](../webview/src/components/DraggableList.css)
- [ResizableDrawer.css](../webview/src/components/ResizableDrawer.css)
- [ResizableSider.css](../webview/src/components/ResizableSider.css)

**Conversation editor styles:**
- [styles.css](../webview/src/conversationEditor/components/styles.css) — Node styles, edge styles
- [ConversationEditor.css](../webview/src/conversationEditor/components/ConversationEditor.css) — ReactFlow overrides

**Package editor styles:**
- [animations.css](../webview/src/packageEditor/components/Main/animations.css) — Tab transitions
- [styles.css](../webview/src/packageEditor/components/Main/styles.css) — Tab bar, content area
- [ConversationEditor.css](../webview/src/packageEditor/components/Main/ConversationEditor.css) — ReactFlow overrides
- Various sider component CSS files

**UI overrides (in utils/):**
See [06-api-reference.md](06-api-reference.md) §7 for the full list of Ant Design CSS overrides and VS Code variable mappings.

---

## See Also

- [02-architecture.md](02-architecture.md) §3 — webview architecture overview
- [06-api-reference.md](06-api-reference.md) §6-7 — UI input components and style system
- [../kb/webview-messaging.md](../kb/webview-messaging.md) — webview messaging protocol deep dive

---

*Last updated: 2026-05-26*
