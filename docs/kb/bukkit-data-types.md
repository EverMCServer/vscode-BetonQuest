# Knowledge Base: Bukkit Data Types

**Type:** reference

## Overview

The extension includes TypeScript wrappers around Minecraft/Bukkit enumerations to provide type-safe completions and validation for BetonQuest arguments that reference Minecraft concepts (materials, entities, enchantments, etc.).

## Data Flow

```
Spigot Source Code (Bitbucket)        minecraft-data npm package
         │                                      │
         ▼                                      ▼
    scripts/generateData.ts  ──────────────────┘
         │
         │  Generates JSON lists
         ▼
    utils/src/bukkit/Data/*.json
         │
         │  Imported by TypeScript classes
         ▼
    utils/src/bukkit/DataType/*.ts
         │
         │  Used by
         ├── Webview React apps (form dropdowns, validation)
         └── LSP Server AST (completions, validation)
```

## Data Types

| Type | Source | JSON File | TS Class |
|---|---|---|---|
| EntityType | Spigot's `EntityType.java` | `EntityTypeList.json` | `EntityType.ts` |
| Material | Spigot's `Material.java` + minecraft-data | `MaterialList.json` | `Material.ts` |
| Enchantment | Spigot's `Enchantment.java` | `EnchantmentList.json` | `Enchantment.ts` |
| PotionEffectType | Spigot's `PotionEffectType.java` | `PotionEffectTypeList.json` | `PotionEffectType.ts` |
| DyeColor | Spigot's `DyeColor.java` | `DyeColorList.json` | `DyeColor.ts` |
| Biome | Spigot's `Biome.java` | `BiomeList.json` | `Biome.ts` |
| BlockState | minecraft-data (1.21.11) | In MaterialList.json | `BlockState.ts` |

## Data Generation (`scripts/generateData.ts`)

The script:

1. **Fetches Java source** from Spigot's Bitbucket repository (raw files on `hub.spigotmc.org`)
2. **Parses enums with regex** — extracts enum constant names from Java source
3. **Merges with minecraft-data** — for materials, enriches with block state data from the `minecraft-data` npm package
4. **Generates JSON files** in `utils/src/bukkit/Data/`

**Important:** The generated JSON files are `.gitignore`d. They must be regenerated on each fresh checkout via `npm run generate-list`.

### Regenerating Data

```bash
npm run generate-list
```

This is automatically run as part of `npm run compile`.

## TypeScript Class Pattern

Each data type follows this pattern:

```typescript
// Simplified example based on EntityType
export class EntityType {
  private static list: EntityType[];

  static getAll(): EntityType[] {
    if (!this.list) {
      this.list = EntityTypeList.map(item => new EntityType(item));
    }
    return this.list;
  }

  static find(name: string): EntityType | undefined {
    return this.getAll().find(e => e.name.toLowerCase() === name.toLowerCase());
  }

  readonly name: string;
  readonly displayName: string;

  private constructor(data: EntityTypeItem) {
    this.name = data.name;
    this.displayName = data.displayName;
  }
}
```

Key conventions:
- **Private constructor** + static factory — ensures singleton instances
- **Lazy initialization** — `getAll()` initializes the list on first call
- **Case-insensitive lookup** — `find()` matches names ignoring case (Minecraft names are case-insensitive)
- **`name`** — the Minecraft internal name (e.g., `ZOMBIE`)
- **`displayName`** — human-readable name for UI (e.g., `Zombie`)

## Usage in LSP Completions

When the AST encounters an argument that expects a Bukkit type (e.g., an `ArgumentEntity` node), it provides completions based on the data type:

```typescript
// In ArgumentEntity._getCompletions():
EntityType.getAll().map(entity => ({
  label: entity.name,
  kind: CompletionItemKind.EnumMember,
  detail: entity.displayName
}));
```

## Usage in Webview Forms

When the webview renders a form for editing an event/condition/objective, arguments that reference Bukkit types show dropdown selects:

```tsx
// In Give.tsx (event editor form):
<Select>
  {Material.getAll().map(m => (
    <Option key={m.name} value={m.name}>{m.displayName}</Option>
  ))}
</Select>
```

## Block States

The `Material` type is special — it carries block state data from minecraft-data. This is used to validate block-related arguments in BetonQuest. The block state data maps each material to its valid block states (e.g., `OAK_FENCE` → `{ facing: ["north", "south", "east", "west"], waterlogged: ["true", "false"] }`).

## Updating for New Minecraft Versions

When Minecraft updates and adds/changes types:

1. **Update `scripts/generateData.ts`** — point to the new Spigot version's source URLs
2. **Update `minecraft-data`** dependency — bump the npm package version
3. **Run `npm run generate-list`** — regenerate JSON files
4. **Check for removed types** — verify that all references in `utils/src/betonquest/` still resolve (some argument validators may reference removed types)
