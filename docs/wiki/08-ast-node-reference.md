# AST Node Reference

Complete catalog of all AST node types in the LSP server. The AST parses BetonQuest YAML files into a typed tree that supports recursive traversal for all LSP features (hover, completions, definitions, references, diagnostics, semantic tokens, code actions).

---

## 1. Node Hierarchy

### Base Classes

```
AbstractNode<T extends NodeType, N extends NodeV1 | NodeV2>
  Source: server/src/ast/node.ts
  Purpose: Root of all AST nodes. Provides tree structure, diagnostics,
           semantic tokens, hover, definitions, references, completions.

  Properties:
    - parent?: N                         Parent node (undefined for root)
    - children: AbstractNode<unknown, N>[]   Child nodes
    - offsetStart?: number               Start character offset in document
    - offsetEnd?: number                 End character offset in document
    - diagnostics: Diagnostic[]          Diagnostic messages for this node

  Methods:
    - getChildren(): AbstractNode[]
    - getDiagnostics(): Diagnostic[]     Recursive — aggregates from children
    - getSemanticTokens(): SemanticToken[]
    - getHoverInfos(offset): HoverInfo[]
    - getDefinitions(offset): LocationLinkOffset[]
    - getReferences(offset): LocationLinkOffset[]
    - getCompletions(offset): CompletionItem[]
    - getCodeActions(offset): CodeAction[]
    - _init(data: T): void              Abstract — parse children from YAML data

  Abstract (internal) methods (prefixed with _):
    - _getSemanticTokens(): SemanticToken[]
    - _getHoverInfo(offset): HoverInfo[]
    - _getDefinitions(offset): LocationLinkOffset[]
    - _getReferences(offset): LocationLinkOffset[]
    - _getCompletions(offset): CompletionItem[]
    - _getCodeActions(offset): CodeAction[]
```

### Version-Specific Base Classes

```
AbstractNodeV1<T>
  Source: server/src/ast/v1.ts
  Extends: AbstractNode<T, NodeV1>
  Purpose: Base for all V1 AST nodes.
  Helpers:
    - getPackages(): PackageV1[]
    - getConditionEntries(): ConditionEntry[]
    - getEventEntries(): EventEntry[]
    - getObjectiveEntries(): ObjectiveEntry[]
    - getConversationOptions(): (NpcOption | PlayerOption)[]
    - getConversationOptionPointers(): Pointer[]

AbstractNodeV2<T>
  Source: server/src/ast/v2.ts
  Extends: AbstractNode<T, NodeV2>
  Purpose: Base for all V2 AST nodes.
  Same helper methods as V1, adapted for V2's SectionCollection structure.

Document<T>
  Source: server/src/ast/v1/document.ts (V1), server/src/ast/v2/document.ts (V2)
  Extends: AbstractNodeV1<T> | AbstractNodeV2<T>
  Purpose: Base for nodes representing a YAML document section.
  Properties:
    - document: TextDocument          VS Code text document
    - yamlDocument: yaml.Document     Parsed YAML AST
  Methods:
    - getOffsetRange(offset): Range   Convert offset to line/column

SectionCollection<T>  (V2 only)
  Source: server/src/ast/v2/document.ts
  Extends: AbstractNodeV2<T>
  Purpose: Aggregates multiple Document sections across YAML files.
           Used for V2 element lists that span multiple files.

AbstractString<T>
  Source: server/src/ast/v1/Conversation/AbstractString.ts (V1)
          server/src/ast/v2/Conversation/AbstractString.ts (V2)
  Purpose: Base for nodes wrapping a YAML scalar string value.
  Properties:
    - value: string

AbstractID<T, PT, ET>
  Source: server/src/ast/v1/Conversation/AbstractId.ts (V1)
          server/src/ast/v2/Conversation/AbstractId.ts (V2)
  Purpose: Base for ID reference nodes (points to another element).
           Handles cross-package (!), cross-conversation, and cross-file references.
  Properties:
    - value: string                   The raw ID string
    - resolved?: ET                   Resolved target element
  Methods:
    - getDefinitions(offset): resolves to the referenced element's location
    - getReferences(offset): finds all places referencing this element

AbstractTagName<T>  (V2 only)
  Source: server/src/ast/v2/Argument/AbstractTagName.ts
  Extends: AbstractID<T>
  Purpose: Base for tag/global-tag name references.
           Provides go-to-definition and completions from all elements
           with tagName-type arguments.
```

---

## 2. V1 Nodes

### 2.1 Package Root

**PackageV1**
- **File:** [server/src/ast/v1/Package.ts](../server/src/ast/v1/Package.ts)
- **Extends:** `AbstractNodeV1<"PackageV1">`
- **YAML:** A V1 BetonQuest package folder containing `main.yml`, `events.yml`, `conditions.yml`, `objectives.yml`, and `conversations/*.yml`
- **Children:** ConditionList, EventList, ObjectiveList, Conversation[]

### 2.2 Conditions

| Node | File | Extends | YAML Structure |
|---|---|---|---|
| **ConditionList** | `Condition/ConditionList.ts` | `Document<"ConditionList">` | The `conditions.yml` file — YAML map of ID to instruction |
| **ConditionEntry** | `Condition/ConditionEntry.ts` | `AbstractNodeV1<"ConditionEntry">` | Single entry: `<id>: <kind> <args>` |
| **ConditionKey** | `Condition/ConditionKey.ts` | `AbstractNodeV1<"ConditionKey">` | The condition's ID (YAML key) |
| **ConditionKind** | `Condition/ConditionKind.ts` | `AbstractNodeV1<"ConditionKind">` | The instruction kind word |
| **ConditionArguments** | `Condition/ConditionArguments.ts` | `AbstractNodeV1<"ConditionArguments">` | Full argument string after kind |
| **ConditionArgumentMandatory** | `Condition/ConditionArgumentMandatory.ts` | `AbstractNodeV1<"ConditionArgumentMandatory">` | Single mandatory argument (positional) |
| **ConditionArgumentOptional** | `Condition/ConditionArgumentOptional.ts` | `AbstractNodeV1<"ConditionArgumentOptional">` | Single optional argument (`key:value`) |

### 2.3 Events

| Node | File | Extends | YAML Structure |
|---|---|---|---|
| **EventList** | `Event/EventList.ts` | `Document<"EventList">` | The `events.yml` file |
| **EventEntry** | `Event/EventEntry.ts` | `AbstractNodeV1<"EventEntry">` | Single entry: `<id>: <kind> <args>` |
| **EventKey** | `Event/EventKey.ts` | `AbstractNodeV1<"EventKey">` | The event's ID |
| **EventKind** | `Event/EventKind.ts` | `AbstractNodeV1<"EventKind">` | The instruction kind word |
| **EventArguments** | `Event/EventArguments.ts` | `AbstractNodeV1<"EventArguments">` | Full argument string |
| **EventArgumentMandatory** | `Event/EventArgumentMandatory.ts` | `AbstractNodeV1<"EventArgumentMandatory">` | Single mandatory argument |
| **EventArgumentOptional** | `Event/EventArgumentOptional.ts` | `AbstractNodeV1<"EventArgumentOptional">` | Single optional argument |

### 2.4 Objectives

| Node | File | Extends | YAML Structure |
|---|---|---|---|
| **ObjectiveList** | `Objective/ObjectiveList.ts` | `Document<"ObjectiveList">` | The `objectives.yml` file |
| **ObjectiveEntry** | `Objective/ObjectiveEntry.ts` | `AbstractNodeV1<"ObjectiveEntry">` | Single entry: `<id>: <kind> <args>` |
| **ObjectiveKey** | `Objective/ObjectiveKey.ts` | `AbstractNodeV1<"ObjectiveKey">` | The objective's ID |
| **ObjectiveKind** | `Objective/ObjectiveKind.ts` | `AbstractNodeV1<"ObjectiveKind">` | The instruction kind word |
| **ObjectiveArguments** | `Objective/ObjectiveArguments.ts` | `AbstractNodeV1<"ObjectiveArguments">` | Full argument string |
| **ObjectiveArgumentMandatory** | `Objective/ObjectiveArgumentMandatory.ts` | `AbstractNodeV1<"ObjectiveArgumentMandatory">` | Single mandatory argument |
| **ObjectiveArgumentOptional** | `Objective/ObjectiveArgumentOptional.ts` | `AbstractNodeV1<"ObjectiveArgumentOptional">` | Single optional argument |

### 2.5 Conversations

| Node | File | Extends | YAML Structure |
|---|---|---|---|
| **Conversation** | `Conversation/Conversation.ts` | `Document<"Conversation">` | A `conversations/<name>.yml` file |
| **ConversationQuester** | `Conversation/ConversationQuester.ts` | `AbstractNodeV1<"ConversationQuester">` | The `quester:` value |
| **ConversationQuesterTranslations** | `Conversation/ConversationQuesterTranslations.ts` | `AbstractNodeV1<"ConversationQuesterTranslations">` | Locale map under `quester:` |
| **First** | `Conversation/First.ts` | `AbstractNodeV1<"ConversationFirst">` | The `first:` comma-separated pointer list |
| **FirstPointer** | `Conversation/FirstPointer.ts` | `AbstractNodeV1<"ConversationFirstPointer">` | Single pointer ID in `first:` |
| **ConversationStop** | `Conversation/ConversationStop.ts` | `AbstractNodeV1<"ConversationStop">` | The `stop:` boolean |
| **ConversationFinalEvents** | `Conversation/ConversationFinalEvents.ts` | `AbstractNodeV1<"ConversationFinalEvents">` | The `final_events:` event list |
| **ConversationFinalEvent** | `Conversation/ConversationFinalEvent.ts` | `AbstractID<"ConversationEvent", ...>` | Single event ID in `final_events:` |
| **ConversationInterceptor** | `Conversation/ConversationInterceptor.ts` | `AbstractNodeV1<"ConversationInterceptor">` | The `interceptor:` value |

**NPC Options** (`Conversation/Option/Npc/`):

| Node | File | Extends | YAML Structure |
|---|---|---|---|
| **NpcOption** | `NpcOption.ts` | `AbstractNodeV1<"ConversationNpcOption">` | Entry under `NPC_options:` |
| **Text** | `Npc/Text.ts` | `AbstractNodeV1<"ConversationText">` | The `text:` value |
| **TextTranslations** | `Npc/TextTranslations.ts` | `AbstractNodeV1<"ConversationTextTranslations">` | Locale map under `text:` |
| **Conditions** | `Npc/Conditions.ts` | `AbstractNodeV1<"ConversationConditions">` | The `conditions:` list |
| **Condition** | `Npc/Condition.ts` | `AbstractID<"ConversationCondition", ...>` | Single condition ID reference |
| **Events** | `Npc/Events.ts` | `AbstractNodeV1<"ConversationEvents">` | The `events:` list |
| **Event** | `Npc/Event.ts` | `AbstractID<"ConversationEvent", ...>` | Single event ID reference |
| **Pointers** | `Npc/Pointers.ts` | `AbstractNodeV1<"ConversationPointers">` | The `pointers:` list |
| **Pointer** | `Npc/Pointer.ts` | `AbstractNodeV1<"ConversationNpcPointer">` | Single player option pointer |

**Player Options** (`Conversation/Option/Player/`):

| Node | File | Extends | YAML Structure |
|---|---|---|---|
| **PlayerOption** | `PlayerOption.ts` | `AbstractNodeV1<"ConversationPlayerOption">` | Entry under `player_options:` |
| **Text** | `Player/Text.ts` | `AbstractNodeV1<"ConversationText">` | The `text:` value |
| **TextTranslations** | `Player/TextTranslations.ts` | `AbstractNodeV1<"ConversationTextTranslations">` | Locale map under `text:` |
| **Conditions** | `Player/Conditions.ts` | `AbstractNodeV1<"ConversationConditions">` | The `conditions:` list |
| **Condition** | `Player/Condition.ts` | `AbstractID<"ConversationCondition", ...>` | Single condition ID reference |
| **Events** | `Player/Events.ts` | `AbstractNodeV1<"ConversationEvents">` | The `events:` list |
| **Event** | `Player/Event.ts` | `AbstractID<"ConversationEvent", ...>` | Single event ID reference |
| **Pointers** | `Player/Pointers.ts` | `AbstractNodeV1<"ConversationPointers">` | The `pointers:` list |
| **Pointer** | `Player/Pointer.ts` | `AbstractNodeV1<"ConversationPlayerPointer">` | Single NPC option pointer |

### 2.6 Arguments (V1)

| Node | File | Extends | Purpose |
|---|---|---|---|
| **ArgumentKey** | `Argument/ArgumentKey.ts` | `AbstractNodeV1<"ArgumentKey">` | Key portion of `key:value` |
| **ArgumentValue** | `Argument/ArgumentValue.ts` | `AbstractNodeV1<"ArgumentValue">` | Value portion; dispatches to typed sub-nodes |
| **ArgumentConditionID** | `Argument/ArgumentConditionID.ts` | `AbstractNodeV1<"ArgumentConditionID">` | Condition ID reference in arg value |
| **ArgumentEventID** | `Argument/ArgumentEventID.ts` | `AbstractNodeV1<"ArgumentEventID">` | Event ID reference in arg value |
| **ArgumentObjectiveID** | `Argument/ArgumentObjectiveID.ts` | `AbstractNodeV1<"ArgumentObjectiveID">` | Objective ID reference in arg value |
| **ArgumentBlockSelector** | `Argument/ArgumentBlockSelector.ts` | `AbstractNodeV1<"ArgumentBlockSelector">` | Block selector (`namespace:material[state]`) |
| **ArgumentEntity** | `Argument/ArgumentEntity.ts` | `AbstractNodeV1<"ArgumentEntity">` | Entity type selector |
| **ArgumentInterger** | `Argument/ArgumentInterger.ts` | `AbstractNodeV1<"ArgumentInterger">` | Integer value |

---

## 3. V2 Nodes

### 3.1 Package Root

**PackageV2**
- **File:** [server/src/ast/v2/Package.ts](../server/src/ast/v2/Package.ts)
- **Extends:** `AbstractNodeV2<"PackageV2">`
- **YAML:** A V2 BetonQuest package folder (`QuestPackages/<name>/`)
- **Children:** ConditionList, EventList, ObjectiveList, Conversation (all as SectionCollections)

### 3.2 Conditions (V2)

| Node | File | Extends | YAML Structure |
|---|---|---|---|
| **ConditionList** | `Condition/ConditionList.ts` | `SectionCollection<"ConditionList">` | All `conditions:` sections across files |
| **ConditionListSection** | `Condition/ConditionList.ts` | `Document<"ConditionListSection">` | One `conditions:` block in a file |
| **ConditionEntry** | `Condition/ConditionEntry.ts` | `AbstractNodeV2<"ConditionEntry">` | Single named entry |
| **ConditionKey** | `Condition/ConditionKey.ts` | `AbstractNodeV2<"ConditionKey">` | The condition's ID |
| **ConditionKind** | `Condition/ConditionKind.ts` | `AbstractNodeV2<"ConditionKind">` | The instruction kind |
| **ConditionArguments** | `Condition/ConditionArguments.ts` | `AbstractNodeV2<"ConditionArguments">` | Argument string |
| **ConditionArgumentMandatory** | `Condition/ConditionArgumentMandatory.ts` | `AbstractNodeV2<"ConditionArgumentMandatory">` | Mandatory argument |
| **ConditionArgumentOptional** | `Condition/ConditionArgumentOptional.ts` | `AbstractNodeV2<"ConditionArgumentOptional">` | Optional argument |

### 3.3 Events (V2)

Same structure as V2 conditions. Files under `Event/`.

### 3.4 Objectives (V2)

Same structure as V2 conditions. Files under `Objective/`.

### 3.5 Conversations (V2)

Conversation node structure is identical to V1 (same option types), but organized under `SectionCollection<"Conversation">` -> `ConversationSection` (Document) instead of standalone Conversation documents.

### 3.6 Arguments (V2)

All V1 argument types plus V2 additions:

| Node | File | Extends | Purpose |
|---|---|---|---|
| **ArgumentFloat** | `Argument/ArgumentFloat.ts` | `AbstractNodeV2<"ArgumentFloat">` | Floating-point number |
| **ArgumentGlobalPointCategory** | `Argument/ArgumentGlobalPointCategory.ts` | `AbstractID<"ArgumentGlobalPointCategory">` | Global point category reference |
| **ArgumentTagName** | `Argument/ArgumentTagName.ts` | `AbstractTagName<"ArgumentTagName">` | Tag name reference |
| **ArgumentBlockSelector** | `Argument/ArgumentBlockSelector.ts` | `AbstractNodeV2<...>` | Block selector with namespace/material/state children |
| **ArgumentBlockSelectorNamespace** | same file | `AbstractNodeV2<...>` | Namespace portion |
| **ArgumentBlockSelectorMaterial** | same file | `AbstractNodeV2<...>` | Material portion |
| **ArgumentBlockSelectorState** | same file | `AbstractNodeV2<...>` | State key=value inside `[...]` |

### 3.7 Variable Nodes (V2 only)

All variable nodes are under `Argument/Variable/`.

| Node | File | Purpose |
|---|---|---|
| **ArgumentVariable** | `Argument/ArgumentVariable.ts` | `%variable.kind.instructions%` — dispatches to sub-nodes |
| **ArgumentVariableKind** | `Argument/ArgumentVariableKind.ts` | The variable kind word (e.g., `objective`, `condition`) |
| **ArgumentVariableCondition** | `Variable/ArgumentVariableCondition.ts` | `%condition.id%` variable |
| **ArgumentVariableConditionID** | same file | Condition ID inside `%condition.xxx%` |
| **ArgumentVariablePoint** | `Variable/ArgumentVariablePoint.ts` | `%point.category.amount%` |
| **ArgumentVariableGlobalPoint** | `Variable/ArgumentVariableGlobalPoint.ts` | `%globalpoint.category.amount%` |
| **ArgumentVariableTag** | `Variable/ArgumentVariableTag.ts` | `%tag.name%` |
| **ArgumentVariableTagName** | same file | Tag name inside `%tag.xxx%` |
| **ArgumentVariableGlobalTag** | `Variable/ArgumentVariableGlobalTag.ts` | `%globaltag.name%` |
| **ArgumentVariableGlobalTagName** | same file | Global tag name inside `%globaltag.xxx%` |
| **ArgumentVariableObjectiveProperty** | `Variable/ArgumentVariableObjectiveProperty.ts` | `%objective.id.property%` |
| **ArgumentVariableObjectivePropertyObjectiveID** | same file | Objective ID |
| **ArgumentVariableObjectivePropertyVariableName** | same file | Property name |
| **ArgumentVariableSectionPapi** | `Variable/Section/ArgumentVariableSectionPapi.ts` | `.papiMode` suffix on condition/tag/globaltag variables |

---

## 4. Node Lifecycle Methods

Every AST node follows this lifecycle. Understanding it is essential for adding new node types.

### Constructor

```typescript
constructor(data: T, parent?: N)
```

- Receives the parsed YAML data for this node's portion of the document
- Stores the parent reference
- Calls `_init(data)` to parse children
- Sets `offsetStart` and `offsetEnd` based on YAML node positions

### `_init(data: T): void`

Called by the constructor. Each node type implements this to:
1. Parse child YAML structures
2. Create child AST nodes
3. Set offset ranges for each child

### LSP Feature Methods

Each of these follows the same recursive delegation pattern:

```
public get<Feature>(offset: number): Result[] {
  // 1. Check if offset is within this node's range
  if (offset < offsetStart || offset > offsetEnd) return [];

  // 2. Get this node's own results
  const results = this._get<Feature>(offset);

  // 3. Recurse into children
  for (const child of children) {
    results.push(...child.get<Feature>(offset));
  }

  return results;
}
```

| Method | Returns | Purpose |
|---|---|---|
| `getSemanticTokens()` | `SemanticToken[]` | Highlighting: token type, modifiers, range |
| `getHoverInfos(offset)` | `HoverInfo[]` | Hover tooltips: markdown content, range |
| `getDefinitions(offset)` | `LocationLinkOffset[]` | Go-to-definition: target URI + range |
| `getReferences(offset)` | `LocationLinkOffset[]` | Find references: all locations referencing this |
| `getCompletions(offset)` | `CompletionItem[]` | Code completions: label, insert text, kind |
| `getCodeActions(offset)` | `CodeAction[]` | Quick fixes: title, edit to apply |

### `getDiagnostics(): Diagnostic[]`

Returns all diagnostics for this subtree. Unlike other methods, diagnostics are computed eagerly during `_init()` and stored in `this.diagnostics`. The public method aggregates from the node and all children.

---

## 5. Semantic Token Types

From [semanticTokens.ts](../server/src/service/semanticTokens.ts) (full table):

| Enum Value | LSP Token Type | Applies To |
|---|---|---|
| `String` | `string` | Quester name, NPC text, instruction arguments |
| `Boolean` | `macro` | `stop: true`, boolean argument values |
| `Operator` | `operator` | `,` `:` `!` separators |
| `Bracket` | `struct` | `[` `]` in block selectors |
| `SectionKeyword` | `enumMember` | V2 top-level keys: `conditions:`, `events:`, etc. |
| `ConditionID` | `class` | Condition IDs (keys and references) |
| `EventID` | `function` | Event IDs (keys and references) |
| `ObjectiveID` | `event` | Objective IDs (keys and references) |
| `InstructionKind` | `macro` | Kind words: `kill`, `teleport`, `give`, etc. |
| `InstructionArguments` | `string` | Argument portion of instructions |
| `ConversationKeyword` | `keyword` | `quester`, `first`, `NPC_options`, etc. |
| `ConversationOptionKeyword` | `macro` | `text`, `conditions`, `events`, `pointers` |
| `ConversationOptionNpcID` | `number` | NPC option IDs and pointers |
| `ConversationOptionPlayerID` | `class` | Player option IDs |
| `TagName` | `keyword` | Tag names resolving to existing definitions |
| `GlobalTagName` | `keyword` | Global tag names |
| `GlobalPointCategory` | `keyword` | Global point categories |
| `PointCategory` | `keyword` | Point categories |

---

## 6. V1 vs V2 Structural Differences

| Aspect | V1 | V2 |
|---|---|---|
| **Package root** | `PackageV1` — flat list of documents | `PackageV2` — SectionCollections aggregating across files |
| **Document model** | `Document<T>` represents entire YAML file | `SectionCollection<T>` -> `Document<T>` (section within file) |
| **File organization** | One file per type (`events.yml`, `conditions.yml`, separate conversation files) | Sections can be in any YAML file under the package |
| **Variables** | Not supported | Full `ArgumentVariable` subtree with 12+ variable kinds |
| **Argument types** | 7 types (Key, Value, ConditionID, EventID, ObjectiveID, BlockSelector, Entity, Integer) | All V1 types + Float, GlobalPointCategory, TagName, BlockSelector sub-nodes |
| **Total node classes** | ~40 concrete + 4 abstract | ~60 concrete + 6 abstract |

---

## See Also

- [02-architecture.md](02-architecture.md) §2 — LSP server architecture and AST overview
- [07-diagnostics-reference.md](07-diagnostics-reference.md) — all diagnostic codes emitted by AST nodes
- [05-development-guide.md](05-development-guide.md) §1.5 — adding/modifying AST nodes
- [../kb/ast-system.md](../kb/ast-system.md) — AST system deep dive with design rationale

---

*Last updated: 2026-05-26*
