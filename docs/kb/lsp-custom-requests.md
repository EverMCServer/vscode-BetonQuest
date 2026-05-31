# Knowledge Base: LSP Custom Requests

**Type:** reference
**Related:** [[ast-system]], [[webview-messaging]]

## Overview

Beyond standard LSP features (hover, completion, definition, references, semantic tokens), the extension defines custom LSP request/response protocols for BetonQuest-specific functionality. These are implemented as custom `vscode-languageserver` request types and handled bidirectionally between the extension host and LSP server.

## Why Custom Requests?

1. **File system access in web context** — The LSP server runs in a web worker on vscode.dev and has no `fs` access. The extension host proxies file I/O.

2. **BetonQuest-specific queries** — Standard LSP doesn't have concepts like "list all conditions in this package" or "list all event names". These are needed for cross-reference validation and editor UI.

## Request Catalog

### File System Proxy Requests

These are sent from the **LSP server → Extension host**.

#### `custom/file/tree`

Browse the workspace file tree. Used by the server to discover BetonQuest packages.

```
Request: { pattern: string }   // Glob pattern, e.g., "**/main.yml"
Response: { tree: FileTreeNode[] }

FileTreeNode = {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
}
```

**Handler:** `fileTreeHandler()` in `extension/src/lsp/file.ts`

#### `custom/file`

Read a single file's content.

```
Request: { uri: string }
Response: { content: string }
```

**Handler:** `fileHandler()` in `extension/src/lsp/file.ts`

#### `custom/files`

Read multiple files in batch (performance optimization to avoid N round-trips).

```
Request: { uris: string[] }
Response: { files: { uri: string, content: string }[] }
```

**Handler:** `filesHandler()` in `extension/src/lsp/file.ts`

### BetonQuest-Specific Requests

These are sent from the **Extension host → LSP server**.

#### `custom/locations`

Resolves an abstract YAML path to document locations. Used for go-to-definition functionality.

```
Request: {
  uri: string;
  yamlPath: (string | number)[];
}
Response: {
  locations: {
    uri: string;
    offsetStart: number;
    offsetEnd: number;
  }[];
}
```

**Handler:** `locationsHandler()` in `server/src/service/locations.ts`

The server traverses the AST to find the node at the given YAML path, then returns its document offsets. The extension converts offsets to `vscode.Location` objects.

#### `custom/packageConditions`

Returns all condition names defined in a package. Used by the package editor for cross-reference completion and validation.

```
Request: { uri: string }       // URI of a file within the package
Response: {
  conditions: {
    name: string;
    kind: string;
    yamlPath: (string | number)[];
    documentUri: string;
  }[];
}
```

**Handler:** `packageConditionsHandler()` in `server/src/service/packageConditions.ts`

#### `custom/packageEvents`

Same as `packageConditions` but for events.

```
Request: { uri: string }
Response: {
  events: {
    name: string;
    kind: string;
    yamlPath: (string | number)[];
    documentUri: string;
  }[];
}
```

**Handler:** `packageEventsHandler()` in `server/src/service/packageEvents.ts`

## Request Flow Examples

### Example 1: Opening a Package Editor

```
1. User opens package.yml
2. Extension activates PackageEditorProvider
3. Webview loads, sends 'request-package-conditions'
4. Provider calls:
     client.sendRequest('custom/packageConditions', { uri: doc.uri })
5. Server's packageConditionsHandler runs:
     - Finds the AST for this workspace folder
     - Walks condition nodes
     - Returns { name, kind, yamlPath, documentUri } for each
6. Provider sends result to webview
7. Webview renders condition list in sider
```

### Example 2: Cross-File Reference Validation

```
1. User types "conditions: hasItem wood" in conversations/blacksmith.yml
2. Server's AST builder creates ArgumentConditionID node for "wood"
3. During _getDiagnostics(), ArgumentConditionID calls:
     this.getPackage().getConditionEntries()
4. If no condition named "wood" exists, diagnostic BQ-04xx is generated:
     "Condition 'wood' not found in package"
```

### Example 3: File Tree for Package Discovery

```
1. Server initializes (onInitialized)
2. Server sends: connection.sendRequest('custom/file/tree', { pattern: '**/main.yml' })
3. Extension's fileTreeHandler walks workspace directories
4. Returns tree of all main.yml files
5. Server creates PackageV1 instances for each discovered package
6. Server then requests individual files via 'custom/file' and 'custom/files'
7. Server builds ASTs for all packages
```

## Type Definitions

All shared request/response types are defined in `utils/src/lsp/file.ts`:

```typescript
// File tree
interface FileTreeParams { pattern: string; }
interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileTreeNode[];
}
interface FileTreeResponse { tree: FileTreeNode[]; }

// Single file
interface FileParams { uri: string; }
interface FileResponse { content: string; }

// Multiple files
interface FilesParams { uris: string[]; }
interface FilesResponse { files: { uri: string; content: string; }[]; }

// Locations
interface LocationsParams {
  uri: string;
  yamlPath: (string | number)[];
}
interface LocationsResponse {
  locations: {
    uri: string;
    offsetStart: number;
    offsetEnd: number;
  }[];
}

// Package entries
interface PackageEntriesParams { uri: string; }
interface PackageEntriesResponse {
  entries: {
    name: string;
    kind: string;
    yamlPath: (string | number)[];
    documentUri: string;
  }[];
}
```

## Adding a New Custom Request

1. **Define types** in `utils/src/lsp/file.ts` (or create a new file)
2. **Implement server handler** in `server/src/service/<name>.ts`
3. **Register handler** in `server.common.ts`:
   ```typescript
   connection.onRequest('custom/<name>', async (params) => { ... });
   ```
4. **Call from extension** in the relevant provider:
   ```typescript
   const result = await client.sendRequest('custom/<name>', params);
   ```
