# API Reference: `betonquest-utils`

Complete API reference for the `betonquest-utils` shared library. This library is used by the LSP server and webview React apps. It is **not** imported by the extension host (which communicates via LSP and postMessage).

**Path alias:** `betonquest-utils/*` -> `utils/src/*`

---

## 1. Data Model Classes

All data model classes are in [utils/src/betonquest/](../utils/src/betonquest/).

### `List<T extends ListElement>`

**File:** [List.ts](../utils/src/betonquest/List.ts)

Generic ordered list wrapper for YAML arrays of named elements.

```typescript
class List<T extends ListElement> {
  elements: T[];

  constructor(yaml: string);          // Parse YAML string into typed elements
  toYaml(): string;                    // Serialize back to YAML
  get(key: string): T | undefined;     // Find element by key (name)
  add(element: T): void;               // Add element to list
  remove(key: string): void;           // Remove element by key
  reorder(fromIndex: number, toIndex: number): void; // Move element
}
```

### `ListElement`

**File:** [ListElement.ts](../utils/src/betonquest/ListElement.ts)

Base class for all BetonQuest element types.

```typescript
class ListElement {
  key: string;          // YAML key — the element's unique name/ID
  kind?: string;        // Element type (e.g., "message", "give", "hasItem")
  args: Arguments;      // Key-value arguments

  constructor(key: string, kind?: string, args?: Arguments);
}
```

### `Event extends ListElement`

**File:** [Event.ts](../utils/src/betonquest/Event.ts)

Represents a BetonQuest event. Adds event-specific validation and serialization logic.

```typescript
class Event extends ListElement {
  // Inherits: key, kind, args
  // Event kinds: message, give, take, teleport, command, killmob, notify,
  //              objective, point, tag, variable, folder, setblock, spawnmob, ...
}
```

### `Condition extends ListElement`

**File:** [Condition.ts](../utils/src/betonquest/Condition.ts)

Represents a BetonQuest condition.

```typescript
class Condition extends ListElement {
  // Inherits: key, kind, args
  // Condition kinds: hasItem, hasPermission, experience, health, location,
  //                   tag, point, variable, check, time, weather, money, armor, ...
}
```

### `Objective extends ListElement`

**File:** [Objective.ts](../utils/src/betonquest/Objective.ts)

Represents a BetonQuest objective.

```typescript
class Objective extends ListElement {
  // Inherits: key, kind, args
  // Objective kinds: location, block, mobkill, action, die, craft, smelt,
  //                   fish, breed, pickup, variable, password, ...
}
```

### `Item extends ListElement`

**File:** [Item.ts](../utils/src/betonquest/Item.ts)

Represents a BetonQuest V2 item definition. Not available in V1.

```typescript
class Item extends ListElement {
  // Inherits: key, kind, args
  // Item properties: material, amount, name, lore, enchantments, ...
}
```

### `Arguments`

**File:** [Arguments.ts](../utils/src/betonquest/Arguments.ts)

Argument marshalling system. Stores mandatory and optional arguments as key-value pairs.

```typescript
class Arguments {
  mandatory: Map<string, string>;   // Required arguments (positional in V1)
  optional: Map<string, string>;    // Optional arguments (key:value in V1)

  get(key: string): string | undefined;
  set(key: string, value: string, mandatory?: boolean): void;
  has(key: string): boolean;
  toInstructionString(): string;    // Serialize to BetonQuest instruction format
  static parseInstruction(instruction: string): Arguments;  // Parse from string
}
```

### `Conversation`

**File:** [Conversation.ts](../utils/src/betonquest/Conversation.ts)

Full conversation model.

```typescript
class Conversation {
  quester: string;                          // NPC name
  npcOptions: Map<string, Option>;          // NPC dialogue options
  playerOptions: Map<string, PlayerOption>; // Player response options
  first: string[];                          // Entry point option IDs
  stop: boolean;                            // Whether conversation ends after
  finalEvents: string[];                    // Events that fire on conversation end
  interceptor: string;                      // Interceptor mode (simple/packet/none)

  constructor(yaml: string);
}
```

### `Option`

**File:** Embedded in Conversation.ts

A single conversation option (NPC or player).

```typescript
interface Option {
  name: string;                    // Option ID
  text: string | Translations;     // Display text
  conditions: string[];            // Condition IDs that must be true
  events: string[];                // Event IDs to fire
  pointers: string[];              // Option IDs this option points to
}

interface Translations {
  [locale: string]: string;        // e.g., { en: "Hello", zh_cn: "你好" }
}
```

### `Package`

**File:** [Package.ts](../utils/src/betonquest/Package.ts)

Complete V2 package model. Aggregates all elements in a QuestPackage.

```typescript
class Package {
  name: string;                              // Package name (folder name)
  conversations: Conversation[];             // All conversations
  events: List<Event>;                       // Events from events.yml sections
  conditions: List<Condition>;               // Conditions from conditions.yml sections
  objectives: List<Objective>;               // Objectives from objectives.yml sections
  items: List<Item>;                         // Item definitions

  constructor(yaml: string, name: string);
}
```

### V1/V2 Element Types

**Files:** [v1/Element.ts](../utils/src/betonquest/v1/Element.ts), [v2/Element.ts](../utils/src/betonquest/v2/Element.ts)

Type definitions for element kinds in each version, including argument specifications.

```typescript
// V1 element kind definition
interface V1ElementKind {
  kind: string;                           // Kind name (e.g., "message")
  mandatoryArgs: ArgSpec[];               // Positional mandatory arguments
  optionalArgs: ArgSpec[];                // Named optional arguments
}

// V2 element kind definition
interface V2ElementKind {
  kind: string;
  args: Record<string, ArgSpec>;          // All arguments as named properties
}
```

---

## 2. Bukkit Data Types

All Bukkit data types are in [utils/src/bukkit/DataType/](../utils/src/bukkit/DataType/). Each type follows a consistent pattern: private constructor, lazy-loaded static instance map, case-insensitive lookup.

### Common Pattern

All Bukkit data types follow this pattern:

```typescript
class DataType {
  private static _instances: Map<string, DataType>;

  private constructor(
    public readonly name: string,           // Machine name (e.g., "iron_sword")
    public readonly displayName?: string,   // Human-readable name
    public readonly properties?: Record<string, unknown>  // Type-specific data
  ) {}

  static init(): void;                      // Lazy-load from generated JSON
  static from(name: string): DataType;      // Case-insensitive lookup
  static values(): DataType[];              // All instances
  static names(): string[];                 // All names (for completions)
}
```

### `EntityType`

**File:** [EntityType.ts](../utils/src/bukkit/DataType/EntityType.ts)

Minecraft entity types (entities that can be spawned or targeted).

```typescript
class EntityType {
  static from(name: string): EntityType;    // e.g., EntityType.from("zombie")
  static values(): EntityType[];
  static names(): string[];                 // ["zombie", "skeleton", "creeper", ...]

  name: string;                             // e.g., "zombie", "skeleton"
}
```

**Source data:** Generated from Spigot's `org.bukkit.entity.EntityType` Java enum.

### `Material`

**File:** [Material.ts](../utils/src/bukkit/DataType/Material.ts)

Minecraft block and item materials.

```typescript
class Material {
  static from(name: string): Material;      // e.g., Material.from("stone")
  static values(): Material[];
  static names(): string[];                 // ["stone", "dirt", "iron_sword", ...]

  name: string;                             // e.g., "stone", "oak_log"
  blockStates?: Record<string, string[]>;   // Valid block state values
}
```

**Source data:** Generated from Spigot's `org.bukkit.Material` Java enum, merged with block state data from minecraft-data.

### `Enchantment`

**File:** [Enchantment.ts](../utils/src/bukkit/DataType/Enchantment.ts)

Minecraft item enchantments.

```typescript
class Enchantment {
  static from(name: string): Enchantment;   // e.g., Enchantment.from("sharpness")
  static values(): Enchantment[];
  static names(): string[];                 // ["sharpness", "protection", ...]

  name: string;                             // e.g., "sharpness"
  maxLevel?: number;                        // Maximum enchantment level
}
```

**Source data:** Generated from Spigot's `org.bukkit.enchantments.Enchantment` Java class.

### `PotionEffectType`

**File:** [PotionEffectType.ts](../utils/src/bukkit/DataType/PotionEffectType.ts)

Minecraft potion effect types.

```typescript
class PotionEffectType {
  static from(name: string): PotionEffectType; // e.g., from("speed")
  static values(): PotionEffectType[];
  static names(): string[];                    // ["speed", "slowness", ...]

  name: string;
}
```

### `DyeColor`

**File:** [DyeColor.ts](../utils/src/bukkit/DataType/DyeColor.ts)

Minecraft dye colors (used for colored blocks, wool, etc.).

```typescript
class DyeColor {
  static from(name: string): DyeColor;
  static values(): DyeColor[];
  static names(): string[];                 // ["white", "red", "blue", ...]

  name: string;
}
```

### `Biome`

**File:** [Biome.ts](../utils/src/bukkit/DataType/Biome.ts)

Minecraft biome types.

```typescript
class Biome {
  static from(name: string): Biome;
  static values(): Biome[];
  static names(): string[];

  name: string;                             // e.g., "plains", "desert"
}
```

### `BlockState`

**File:** [BlockState.ts](../utils/src/bukkit/DataType/BlockState.ts)

Minecraft block state property definitions. Used to validate block selector state arguments.

```typescript
class BlockState {
  // Material -> property name -> valid values
  static getStates(material: string): Record<string, string[]> | undefined;
}
```

**Source data:** Generated from minecraft-data (v1.21.11).

---

## 3. YAML Utilities

All YAML utilities are in [utils/src/yaml/](../utils/src/yaml/).

### `yamlPathPointer`

**File:** [yamlPathPointer.ts](../utils/src/yaml/yamlPathPointer.ts)

React context for synchronizing cursor positions between the YAML text editor and webview UI.

```typescript
type YamlPath = (string | number)[];

// React context value:
interface YamlPathPointerContext {
  yamlPath: YamlPath | undefined;
  setYamlPath: (path: YamlPath | undefined) => void;
}
```

### `findYamlNodeByOffset`

**File:** [findYamlNodeByOffset.ts](../utils/src/yaml/findYamlNodeByOffset.ts)

Locates a YAML AST node by character offset in the document.

```typescript
function findYamlNodeByOffset(
  document: yaml.Document,
  offset: number
): yaml.Node | undefined;
```

### `findOffestByYamlNode`

**File:** [findOffestByYamlNode.ts](../utils/src/yaml/findOffestByYamlNode.ts)

Reverse of `findYamlNodeByOffset`: finds the character offset for a given YAML path.

```typescript
function findOffestByYamlNode(
  document: yaml.Document,
  path: YamlPath
): number | undefined;
```

---

## 4. LSP Contract Types

All LSP contract types are in [utils/src/lsp/](../utils/src/lsp/). These types define the interface between the extension host and the LSP server for custom requests.

### File System Types

```typescript
// custom/file/tree
interface FileTreeParams {
  pattern: string;    // Glob pattern, e.g., "**/*.yml"
}

interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
}

type FileTreeResponse = FileTreeNode[];

// custom/file
interface FileParams {
  uri: string;
}

interface FileResponse {
  uri: string;
  content: string;
}

// custom/files
interface FilesParams {
  uris: string[];
}

interface FilesResponse {
  files: FileResponse[];
}
```

### Locations Types

```typescript
// custom/locations
type YamlPath = (string | number)[];

interface LocationsParams {
  uri: string;
  paths: YamlPath[];
}

interface LocationResponse {
  uri: string;
  range: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
}

type LocationsResponse = LocationResponse[];
```

### Package Entries Types

```typescript
// custom/packageConditions
interface PackageEntriesParams {
  uri: string;
}

interface PackageConditionEntry {
  name: string;       // Condition ID
  kind: string;       // Condition kind
}

type PackageConditionsResponse = PackageConditionEntry[];

// custom/packageEvents
interface PackageEventEntry {
  name: string;       // Event ID
  kind: string;       // Event kind
}

type PackageEventsResponse = PackageEventEntry[];
```

### Webview Message Types

```typescript
// Extension -> Webview messages
type ExtensionMessage =
  | { type: 'update'; text: string }
  | { type: 'set-betonquest-translationSelection'; data: string }
  | { type: 'cursor-yaml-path'; data: YamlPath };

// Webview -> Extension messages
type WebviewMessage =
  | { type: 'edit'; text: string }
  | { type: 'request-package-conditions' }
  | { type: 'request-package-events' }
  | { type: 'cursor-yaml-path'; data: YamlPath };
```

---

## 5. i18n API

All i18n code is in [utils/src/i18n/](../utils/src/i18n/).

### Core API

```typescript
// i18n.ts

/** Set the active locale */
function setLocale(locale: string): void;

/** Get a translated string by key */
function L(key: string, params?: Record<string, string>): string;

/** Available locales */
const allLanguages: { code: string; name: string }[];
// Example: [{ code: "en", name: "English" }, { code: "zh_cn", name: "简体中文" }, { code: "ja", name: "日本語" }]
```

### Key Format

Translation keys use dot-separated paths:

```
"event.message.description"
"condition.hasItem.argument.item"
"objective.location.argument.location"
```

### Parameterized Strings

Parameters are substituted using `{paramName}` syntax:

```typescript
L("error.invalid_value", { value: "abc", expected: "number" });
// -> "Invalid value 'abc': expected a number"
```

### Locale Files

| File | Language | Keys |
|---|---|---|
| [en.json](../utils/src/i18n/data/en.json) | English (canonical) | All keys; serves as fallback |
| [zh_cn.json](../utils/src/i18n/data/zh_cn.json) | Simplified Chinese | Subset |
| [ja.json](../utils/src/i18n/data/ja.json) | Japanese | Subset |

---

## 6. UI Input Components

All UI input components are in [utils/src/ui/Input/](../utils/src/ui/Input/). These are React components used by both the legacy list editors and the package editor for rendering argument form fields.

### Base Components

#### `Input<T>`

**File:** [Input.tsx](../utils/src/ui/Input/Input.tsx)

Base input component. All specific input components extend this pattern.

```typescript
interface InputProps<T> {
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}
```

#### `InputList<T>`

**File:** [InputList.tsx](../utils/src/ui/Input/InputList.tsx)

List variant of Input for array-typed arguments (e.g., multiple items, multiple entities).

```typescript
interface InputListProps<T> {
  values: T[];
  onChange: (values: T[]) => void;
  disabled?: boolean;
}
```

### Form Control Components

| Component | File | Purpose |
|---|---|---|
| `Select` | [Select.tsx](../utils/src/ui/Input/Select.tsx) | Dropdown select from a list of options |
| `Checkbox` | [Checkbox.tsx](../utils/src/ui/Input/Checkbox.tsx) | Boolean checkbox (true/false) |
| `Number` | [Number.tsx](../utils/src/ui/Input/Number.tsx) | Single integer input |
| `NumberList` | [NumberList.tsx](../utils/src/ui/Input/NumberList.tsx) | List of integers |
| `OptionalNumber` | [OptionalNumber.tsx](../utils/src/ui/Input/OptionalNumber.tsx) | Integer with optional toggle |

### Text Input Components

| Component | File | Purpose |
|---|---|---|
| `TextArea` | [TextArea.tsx](../utils/src/ui/Input/TextArea.tsx) | Multi-line text input |
| `TextAreaList` | [TextAreaList.tsx](../utils/src/ui/Input/TextAreaList.tsx) | List of text values |

### Bukkit-Specific Components

| Component | File | Purpose |
|---|---|---|
| `EntityType` | [EntityType.tsx](../utils/src/ui/Input/EntityType.tsx) | Single entity type selector (dropdown with search) |
| `EntityTypeList` | [EntityTypeList.tsx](../utils/src/ui/Input/EntityTypeList.tsx) | List of entity types with drag reorder |
| `EntityTypeListWithAmount` | [EntityTypeListWithAmount.tsx](../utils/src/ui/Input/EntityTypeListWithAmount.tsx) | Entity types with associated amount field |
| `ItemList` | [ItemList.tsx](../utils/src/ui/Input/ItemList.tsx) | Material/item selector with amount and enchantments |
| `Biome` | [Biome.tsx](../utils/src/ui/Input/Biome.tsx) | Biome type selector |
| `DyeColor` | [DyeColor.tsx](../utils/src/ui/Input/DyeColor.tsx) | Dye color selector |
| `EnchantmentList` | [EnchantmentList.tsx](../utils/src/ui/Input/EnchantmentList.tsx) | Enchantment list (type + level pairs) |
| `PotionEffectType` | [PotionEffectType.tsx](../utils/src/ui/Input/PotionEffectType.tsx) | Single potion effect selector |
| `PotionEffectTypeList` | [PotionEffectTypeList.tsx](../utils/src/ui/Input/PotionEffectTypeList.tsx) | Potion effect list with duration/amplifier |
| `BlockSelector` | [BlockSelector.tsx](../utils/src/ui/Input/BlockSelector.tsx) | Block selector with material + states |

### Location Components

| Component | File | Purpose |
|---|---|---|
| `BaseLocation` | [BaseLocation.tsx](../utils/src/ui/Input/BaseLocation.tsx) | Location input (x, y, z, world) |
| `BaseLocationList` | [BaseLocationList.tsx](../utils/src/ui/Input/BaseLocationList.tsx) | List of locations |

### Variable Components (V2 only)

| Component | File | Purpose |
|---|---|---|
| `Variable` | [Variable.tsx](../utils/src/ui/Input/Variable.tsx) | Variable reference input (`%variable.kind.instructions%`) |

---

## 7. UI Style System

All style overrides are in [utils/src/ui/style/](../utils/src/ui/style/). These files override Ant Design component styles to use VS Code CSS variables, ensuring webviews match the user's theme.

### Main Entry

[ant.tsx](../utils/src/ui/style/ant.tsx) — Re-exports Ant Design components with VS Code-themed CSS overrides applied.

### Component CSS Overrides

| CSS File | Overrides |
|---|---|
| `antButton.css` | Button colors, borders, hover states |
| `antCheckbox.css` | Checkbox colors, check mark color |
| `antDivider.css` | Divider color |
| `antInput.css` | Input background, text color, border, focus ring |
| `antInputNumber.css` | Number input styling |
| `antModal.css` | Modal overlay, content background |
| `antPopover.css` | Popover background, arrow |
| `antRadio.css` | Radio button colors |
| `antSelect.css` | Select dropdown, option hover, selected state |
| `antTooltip.css` | Tooltip background, text color |

### VS Code CSS Variable Mapping

All components use these VS Code variables:
- `--vscode-editor-background` — page backgrounds
- `--vscode-editor-foreground` — text colors
- `--vscode-input-background` — input field backgrounds
- `--vscode-input-border` — input borders
- `--vscode-focusBorder` — focus ring color
- `--vscode-button-background` / `--vscode-button-foreground` — button colors
- `--vscode-dropdown-background` / `--vscode-dropdown-border` — dropdown styles
- `--vscode-list-hoverBackground` — hover states
- `--vscode-list-activeSelectionBackground` — selected states

---

## See Also

- [02-architecture.md](02-architecture.md) §4 — shared utils architecture overview
- [08-ast-node-reference.md](08-ast-node-reference.md) — AST node catalog (server-side counterparts)
- [09-webview-component-catalog.md](09-webview-component-catalog.md) — webview React components
- [../kb/bukkit-data-types.md](../kb/bukkit-data-types.md) — Bukkit data generation deep dive
- [../kb/i18n-system.md](../kb/i18n-system.md) — i18n architecture deep dive

---

*Last updated: 2026-05-26*
