# Knowledge Base: AST System

**Type:** reference
**Related:** [[webview-messaging]], [[lsp-custom-requests]]

## Overview

The LSP server builds an Abstract Syntax Tree (AST) from YAML files to provide all IntelliSense features. The AST is a hand-written recursive tree parser — it does NOT use a parser generator. It supports two BetonQuest versions (V1 and V2) with parallel but separate node hierarchies.

## Why Two AST Versions?

BetonQuest v1 and v2 have fundamentally different YAML structures:

- **V1**: Separate files per concern (`events.yml`, `conditions.yml`, `objectives.yml`, `conversations/*.yml`), discovered via `main.yml`
- **V2**: Monolithic `package.yml` inside `QuestPackages/<name>/`, with named sections for each concern

The two formats share concepts (events, conditions, objectives, conversations) but differ in YAML structure, argument syntax, and feature scope (v2 adds variables, floats, global points, etc.). A unified AST would require excessive conditional logic; separate trees keep each version clean.

## ASTs Manager (`ast.ts`)

The `ASTs` class is the top-level manager. It holds a `Map<workspaceRoot, AST>`:

```
ASTs
  └── AST (per workspace folder)
        ├── packagesV1: PackageV1[]
        └── packagesV2: PackageV2[]
```

### Package Discovery

**V1 Discovery:** Walk workspace for any `**/main.yml`. Each `main.yml` defines a package root. Look for sibling files:
- `events.yml`
- `conditions.yml`
- `objectives.yml`
- `conversations/*.yml`

**V2 Discovery:** Walk workspace for `**/QuestPackages/*/package.yml`. Each `package.yml` is a self-contained package.

### Document Change Handling

When a document changes:
1. The server receives `Incremental` text changes from VS Code
2. `ASTs.handleContentChange(doc, changes)` merges changes into a cached copy of the file content
3. The affected AST node is rebuilt from the updated YAML
4. New diagnostics, semantic tokens, etc. are computed

The incremental approach means only the changed document's AST subtree is rebuilt, not the entire workspace.

## AbstractNode Base Class (`node.ts`)

Every node in the AST extends `AbstractNode<T, N>`:

```typescript
abstract class AbstractNode<T, N> {
  parent?: N;
  children: AbstractNode<unknown, N>[];
  offsetStart?: number;  // Character offset in document
  offsetEnd?: number;

  abstract _init(data: T): void;
  abstract _getSemanticTokens(): SemanticToken[];
  abstract _getHoverInfo(offset: number): HoverInfo[];
  abstract _getDefinitions(offset: number): LocationLinkOffset[];
  abstract _getReferences(offset: number): LocationLinkOffset[];
  abstract _getCompletions(offset: number): CompletionItem[];
  abstract _getCodeActions(offset: number): CodeAction[];
  abstract _getDiagnostics(doc: TextDocument): Diagnostic[];
}
```

### The Offset System

All positions use **character offsets** from the start of the document (0-indexed). This is different from VS Code's `Position` (line + character). Conversion happens at the edges:

- **When building AST:** YAML library gives ranges as `{start: number, end: number}` which are offsets
- **When sending results to VS Code:** Offsets are converted to `Position` via `document.positionAt(offset)`
- **When receiving queries:** VS Code `Position` is converted to offset via `document.offsetAt(position)`

This design choice means AST nodes don't need to track lines — they only know their offset range.

### Recursive Traversal Pattern

All LSP features use the same recursive pattern:

```typescript
// In AbstractNode:
getHoverInfos(offset: number): HoverInfo[] {
  const infos: HoverInfo[] = [];
  if (this.offsetStart <= offset && offset <= this.offsetEnd) {
    infos.push(...this._getHoverInfo(offset));        // This node's contribution
    for (const child of this.children) {
      infos.push(...child.getHoverInfos(offset));      // Children's contributions
    }
  }
  return infos;
}
```

This means:
- Each node only cares about queries within its own offset range
- Parent nodes aggregate results from children
- The deepest matching node provides the most specific result

## Version-Specific Base Classes

### V1 (`v1.ts`)

`AbstractNodeV1<T>` adds helper methods for V1's file structure:

```typescript
getPackages(): Package[];
getPackagePath(): string;
getConditionEntries(): ConditionEntry[];
getEventEntries(): EventEntry[];
getObjectiveEntries(): ObjectiveEntry[];
getConversationOptions(): (NpcOption | PlayerOption)[];
getConversationOptionPointers(): FirstPointer[];
```

These are used by LSP features to resolve cross-references. For example, when hovering over a condition ID in a conversation, the system calls `getConditionEntries()` on the package to find the referenced condition's definition.

### V2 (`v2.ts`)

`AbstractNodeV2<T>` adds similar helpers but adapted for V2's section-based structure:

```typescript
getPackages(): PackageV2[];
getConditionEntries(): ConditionEntry[];
// ... etc.
```

V2 adds variable resolution support:
```typescript
getVariableKinds(): ArgumentVariableKind[];
```

## Node Categories

### Container Nodes (Structural)

These nodes represent YAML structure — they contain other nodes but don't themselves represent BetonQuest concepts:

- `PackageV1` / `PackageV2` — root
- `ConditionList`, `EventList`, `ObjectiveList` — file/section roots
- `Conversation` — the whole conversation file
- `ConversationSection` (V2) — a named section within a conversation

### Entity Nodes (Domain)

These nodes represent actual BetonQuest elements:

- `ConditionEntry`, `EventEntry`, `ObjectiveEntry` — named elements with kinds and arguments
- `NpcOption`, `PlayerOption` — conversation dialogue nodes

### Key/Value Nodes (Detail)

These represent specific YAML keys or values within an entity:

- `ConditionKey` — the element name (YAML key)
- `ConditionKind` — the element type (e.g., `message`)
- `ConditionArguments` / `EventArguments` — the arguments block

### Argument Nodes (Leaf)

Each argument type has its own node class. This allows type-specific validation and completion:

- `ArgumentConditionID` — validates that the value references an existing condition
- `ArgumentEventID` — validates that the value references an existing event
- `ArgumentInteger` — validates numeric values
- `ArgumentBlockSelector` — provides completions from Bukkit Material list
- `ArgumentEntity` — provides completions from Bukkit EntityType list
- `ArgumentVariable` (V2) — resolves `%variable%` references

## Adding a New AST Node

When adding support for a new YAML structure:

1. **Create node class** in `server/src/ast/v<N>/<Name>.ts`
2. **Extend** `AbstractNodeV1<T>` or `AbstractNodeV2<T>`
3. **Implement `_init(data)`** — parse YAML data into child nodes, set offsets
4. **Implement LSP methods** — at minimum `_getSemanticTokens()` and `_getHoverInfo()`
5. **Register in parent** — call `new ChildNode(data, this)` in parent's `_init()`

## Diagnostic Generation

Diagnostics are generated during AST building (not on-demand). Each node's `_getDiagnostics()` runs once after `_init()` and results are cached:

```typescript
// In AST build flow:
const pkg = new PackageV1(yamlData, undefined);
const diagnostics = pkg.getDiagnostics(document);
connection.sendDiagnostics({ uri: document.uri, diagnostics });
```

Diagnostic codes are defined in `server/src/utils/diagnostics.ts` with ranges:
- `BQ-00xx`: General errors
- `BQ-01xx`: Event errors
- `BQ-02xx`: Condition errors
- `BQ-03xx`: Objective errors
- `BQ-04xx`: Conversation errors
- `BQ-40xx`: Argument errors
