# Coding Paradigm & Conventions

## Contributing Process

### Branching Strategy

- **Main branch:** `main` — always deployable
- **Feature branches:** `feature/<description>` — new features
- **Fix branches:** `fix/<description>` — bug fixes
- **No direct commits to `main`** — all changes go through pull requests

### Commit Message Convention

Follow conventional commits:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `refactor`, `style`, `perf`, `test`, `chore`, `ci`, `build`

**Scopes:** `extension`, `server`, `webview`, `utils`, `scripts`, `docs`

**Examples:**
```
feat(server): add diagnostic for invalid variable references
fix(webview): prevent crash when conversation has no NPC options
docs(wiki): expand architecture documentation
```

### Pull Request Process

1. Create a feature/fix branch from `main`
2. Make changes following the conventions in this document
3. Run `npm run compile` to verify the build succeeds
4. If applicable, test manually via F5 (see [04-build-and-test.md](04-build-and-test.md))
5. Create a PR against `main` with a description following the template in SPEC-TEMPLATE.md
6. Request review from a maintainer

### Code Review Checklist

- [ ] Follows file naming conventions
- [ ] Uses `_` prefix for private AST methods
- [ ] No default exports
- [ ] No direct `utils/` imports in extension host
- [ ] No Node.js APIs in webview code
- [ ] No file system access in server code
- [ ] Shared types in `utils/src/lsp/` for new cross-component contracts
- [ ] Build passes (`npm run compile`)
- [ ] Code follows existing patterns in the modified subsystem

---

## Monorepo Organization

The project is a TypeScript monorepo managed with **project references** (`tsconfig.json` `"references"`) and **webpack** for final bundling:

```
Root (package.json — no runtime deps)
  +-- extension/   (tsconfig.json, "composite": true)
  +-- server/      (tsconfig.json, "composite": true)
  +-- webview/     (tsconfig.json, "composite": true)
  +-- utils/       (tsconfig.json, "composite": true)
```

Each sub-project has its own `node_modules` (installed via `npm-run-all install:*`). Path aliases map `betonquest-utils/*` -> `../utils/src/*` in webpack configs.

## TypeScript Configuration

| Setting | All Projects |
|---|---|
| `strict: true` | Yes |
| `composite: true` | Yes |
| `declaration: true` | Yes |
| `jsx: react-jsx` | Yes (webview, utils) |
| `target` | ES2020 (extension/server), ES5 (webview/utils) |
| `module` | ES6 (all) |
| `moduleResolution` | node (all) |

## File Naming Conventions

| Convention | Example | Notes |
|---|---|---|
| PascalCase for classes/components | `ConversationEditorProvider.ts` | Matches default export class name |
| camelCase for utilities/helpers | `findYamlNodeByOffset.ts` | Matches primary export function name |
| kebab-case for JSON data | `entity-type-list.json` | Generated data files |
| `.node.ts` suffix | `extension.node.ts`, `server.node.ts` | Node.js-specific entry point |
| `.web.ts` suffix | `extension.web.ts`, `server.web.ts` | Browser-specific entry point |
| `.common.ts` suffix | `extension.common.ts`, `server.common.ts` | Shared logic used by both `.node.ts` and `.web.ts` |

## Class Patterns

### AST Node Pattern (LSP Server)

Every AST node follows this inheritance and pattern:

```typescript
// Base class — all AST nodes
abstract class AbstractNode<T, N> {
  parent?: N;
  children: AbstractNode<unknown, N>[] = [];
  offsetStart?: number;
  offsetEnd?: number;

  // Each node type must implement these for LSP features:
  _init(data: T): void;                          // Parse children from YAML data
  _getSemanticTokens(): SemanticToken[];
  _getHoverInfo(offset: number): HoverInfo[];
  _getDefinitions(offset: number): LocationLinkOffset[];
  _getReferences(offset: number): LocationLinkOffset[];
  _getCompletions(offset: number): CompletionItem[];
  _getCodeActions(offset: number): CodeAction[];
}
```

Key conventions:
- **Recursive delegation**: Parent nodes call children, aggregate results
- **Offset-based ranges**: All positions stored as character offsets, not line/column (conversion happens at the edge)
- **`_` prefix** for internal methods that are called by the public API with offset filtering

### Custom Editor Provider Pattern (Extension)

All 5 providers follow this identical structure:

```typescript
class XxxEditorProvider implements vscode.CustomTextEditorProvider {
  public static viewType = 'betonquest.xxxEditor';
  public static register(context: vscode.ExtensionContext): vscode.Disposable { ... }

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    token: vscode.CancellationToken
  ): Promise<void> {
    // 1. Configure webview (scripts, retainContextWhenHidden)
    // 2. Set HTML with webpack chunk script tags
    // 3. Listen for webview messages -> WorkspaceEdit
    // 4. Listen for document changes -> post update to webview
    // 5. Handle cursor sync
    // 6. Handle translation/config changes (selected editors)
  }
}
```

### Data Model Pattern (Utils)

The BetonQuest data model classes follow a consistent pattern:

```typescript
class ListElement {
  key: string;        // YAML key (element name)
  kind?: string;      // Element type (e.g., "message", "give")
  args: Arguments;    // Key-value arguments
}

class Event extends ListElement { /* event-specific logic */ }
class Condition extends ListElement { /* condition-specific logic */ }
```

### Generic Component Pattern (Webview)

The legacy list editors use TypeScript generics for reuse:

```typescript
// One component, three editors
function App<T extends ListElement>() {
  const list = new List<T>(yamlContent);
  // ... render UI, handle edits
}

// Usage:
<App<Event> />     // events editor
<App<Condition> /> // conditions editor
<App<Objective> /> // objectives editor
```

### Design Patterns in Use

**Visitor Pattern (AST):** The `_init()` method recursively constructs the tree. Each parent node creates its children, which in turn create their children, forming a depth-first traversal of the YAML structure.

**Factory Pattern (AST):** The `buildV1Ast()` / `buildV2Ast()` functions act as factories. They inspect the YAML structure and instantiate the appropriate node classes based on the content (e.g., a YAML map with a `kind` key creates an EventEntry node).

**Strategy Pattern (V1/V2):** The `AbstractNodeV1` and `AbstractNodeV2` base classes implement different strategies for package traversal. The rest of the code operates on the abstract `AbstractNode` interface, making it version-agnostic.

**Observer Pattern (Document Sync):** The `ASTs` manager observes document changes via `textDocument/didChange` notifications. On each change, it updates the AST and notifies downstream consumers (diagnostics, semantic tokens).

## Dependency Direction

```
webview <- utils (data models, i18n, yaml helpers)
   |
server  <- utils (LSP contract types, yaml helpers)
   |
extension (no dependency on utils; communicates via LSP protocol)
```

The extension host never directly imports `utils`. It communicates with the server through LSP and with webviews through `postMessage`. This keeps the extension host thin and ensures web compatibility.

## Messaging Patterns

### Extension <-> Webview: PostMessage

```typescript
// Extension -> Webview
webviewPanel.webview.postMessage({
  type: 'update',
  text: yamlContent
});

// Webview -> Extension
vscode.postMessage({
  type: 'edit',
  text: newYamlContent
});
```

### Extension <-> LSP Server: Custom Requests

```typescript
// Extension -> Server
const result = await client.sendRequest('custom/file/tree', { pattern: '**/*.yml' });

// Server handles and responds
connection.onRequest('custom/file/tree', async (params) => { ... });
```

## Error Handling Conventions

### Extension Host

Use try/catch with `vscode.window.showErrorMessage` for user-facing errors. Log to console for debugging.

```typescript
try {
  await doSomething();
} catch (e) {
  console.error('Operation failed:', e);
  vscode.window.showErrorMessage(`BetonQuest: ${e.message}`);
}
```

### LSP Server

**Never throw exceptions to the client.** All validation issues are reported as diagnostics on the document. The server should handle all parse errors gracefully and produce diagnostics rather than crashing.

### Webview

Use React error boundaries to catch render errors. The `YamlErrorPage` component displays YAML parse errors with line/column information.

### Utils

Validation functions return error messages rather than throwing. This allows callers to collect multiple validation errors:

```typescript
function validate(element: ListElement): string[] {
  const errors: string[] = [];
  if (!element.key) errors.push("Element key is required");
  if (!element.kind) errors.push("Element kind is required");
  return errors;
}
```

## Performance Conventions

### Debouncing

The LSP server does not add artificial debouncing for document changes — it relies on VS Code's built-in change batching in incremental sync mode.

### React Optimization

- Use `React.memo` on list items and conversation nodes that don't need to re-render on every parent update
- Use `useMemo` for expensive computations (YAML parsing, auto-layout)
- The ReactFlow library handles virtual rendering of off-screen nodes

### Webpack Code Splitting

Aggressive code splitting ensures each editor type only loads the chunks it needs. See [04-build-and-test.md](04-build-and-test.md) for the full chunk group listing.

### AST Caching

ASTs are built once on document open and incrementally updated on changes. No TTL-based eviction — they persist for the server session.

## Testing Conventions

### Test File Placement

```
<package>/src/test/
+-- runTest.ts          # Test runner configuration
+-- suite/
    +-- index.ts         # Test suite entry
    +-- *.test.ts        # Individual test files
```

### Mocking Strategy

- **VS Code API:** Use `@vscode/test-electron` for integration tests; mock `vscode` namespace for unit tests
- **LSP Connection:** Mock `vscode-languageserver` connection for server unit tests
- **File System:** Use in-memory file system or temp directories
- **Webview:** Use React Testing Library with mocked `vscode.postMessage`

### Snapshot Testing (AST)

AST node output is well-suited for snapshot testing:
1. Parse a known YAML input
2. Verify the AST structure (node types, hierarchy, offsets)
3. Compare against a stored snapshot

### Integration Testing (Webviews)

For webview integration tests:
1. Render the React component with mock data
2. Simulate user interactions
3. Assert on `postMessage` calls to verify correct edit messages

## Code Quality & Linting

ESLint configuration (`.eslintrc.json`):
- `@typescript-eslint/naming-convention`: PascalCase for types, camelCase for variables
- `semi: "error"` — semicolons required
- `curly: "error"` — braces required for all control flow
- `eqeqeq: "error"` — strict equality only

## Build Pipeline

1. `npm prune && npm install` (root + all sub-projects)
2. `ts-node scripts/generateData.ts` — generate Bukkit/Minecraft JSON data
3. `tsc -b ./extension/ ./webview/ ./server/` — TypeScript compilation (type checking only, since webpack handles bundling)
4. `webpack --config webpack.prod.js` — bundle 5 targets:
   - Extension (Node.js)
   - Extension (Web)
   - Webview (5 entry points)
   - LSP Server (Node.js)
   - LSP Server (Web)

## Webpack Code Splitting

The webview config uses `splitChunks` to separate shared code:

| Chunk Group | Contents |
|---|---|
| `react` | React + ReactDOM (externalized, loaded as UMD) |
| `vendor` | Ant Design, ReactFlow, yaml library |
| `betonquest` | Core BetonQuest data models |
| `betonquest_v1` | V1-specific element kinds |
| `betonquest_v2` | V2-specific element kinds |
| `bukkit` | Bukkit/Minecraft data types |
| `i18n` | Translation system + locale data |
| `ui_input` | Ant Design form components |
| `ui_style` | CSS overrides |
| `yaml` | YAML parsing utilities |
| `view/components` | Shared React components |
| `view/legacyListEditor` | Legacy list editor app |
| `view/conversationEditor` | Conversation flowchart editor |
| `view/packageEditor` | Package editor app |
| `lib/vendor` | Other library code |

## Key Conventions Summary

1. **No default exports** (use named exports)
2. **`_` prefix for private/internal methods** on AST nodes
3. **Static `viewType` and `register()`** on editor providers
4. **Generic constraints** for reusable editor components (`<App<T extends ListElement>>`)
5. **Offset-based position tracking** (not line/column) throughout the AST
6. **Recursive tree traversal** for all LSP features (hover, completion, etc.)
7. **Shared TypeScript types** in `utils/src/lsp/` for cross-component contracts

---

## See Also

- [01-project-overview.md](01-project-overview.md) — project overview and structure
- [02-architecture.md](02-architecture.md) — system architecture
- [04-build-and-test.md](04-build-and-test.md) — build pipeline details
- [05-development-guide.md](05-development-guide.md) — practical task guides

---

*Last updated: 2026-05-26*
