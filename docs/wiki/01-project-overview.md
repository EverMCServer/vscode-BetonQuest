# Project Overview

## What is vscode-BetonQuest?

**vscode-BetonQuest** is a VS Code extension (v0.5.6, published by **EverMC**) that provides IntelliSense, semantic highlighting, and graphical editors for [BetonQuest](https://github.com/BetonQuest/BetonQuest) — a Minecraft server plugin for creating quests and interactive NPCs through YAML-based scripting.

The extension transforms VS Code into a purpose-built IDE for BetonQuest development, replacing raw YAML editing with language-aware tooling.

## Quick Start Guide

### Prerequisites

- Node.js 18+
- npm 9+
- VS Code 1.80+

### Clone, Install, Build

```bash
git clone https://github.com/EverMCServer/vscode-BetonQuest.git
cd vscode-BetonQuest
npm install        # installs root + all 4 sub-project dependencies
npm run compile    # full build: generate data -> tsc -> webpack
```

### Launch Extension Development Host

Press **F5** in VS Code to launch a new VS Code window with the extension loaded. Open a BetonQuest package folder to see the extension in action.

### Open a Sample BetonQuest Package

The extension auto-detects BetonQuest packages by scanning for `main.yml` (V1) or `QuestPackages/*/package.yml` (V2) in parent directories. Open any `.yml` file inside such a directory.

### Verification Checklist

- [ ] Editor toolbar shows BetonQuest editor buttons when a `.yml` file is open
- [ ] Hovering over event/condition/objective names shows documentation tooltips
- [ ] Semantic highlighting colors element names, keywords, and references
- [ ] Code completions appear when typing conditions or events
- [ ] Go-to-definition (F12) navigates between references
- [ ] "Open Conversation Editor" button appears for files under `conversations/`

---

## BetonQuest Domain Concepts

This section explains the BetonQuest domain model. If you are new to BetonQuest, read this before diving into the codebase.

### Package

A **package** is the top-level container for all BetonQuest content for a quest or set of quests.

**V1 disk layout:**
```
some-folder/
├── main.yml              # Package manifest (events, conditions, objectives tagged here)
├── events.yml            # All event definitions
├── conditions.yml        # All condition definitions
├── objectives.yml        # All objective definitions
└── conversations/        # One YAML file per NPC
    ├── blacksmith.yml
    └── guard.yml
```

**V2 disk layout:**
```
QuestPackages/
└── my-quest/
    ├── package.yml       # All-in-one: conversations, events, conditions, objectives, items
    ├── events.yml        # Named event sections
    ├── conditions.yml    # Named condition sections
    └── objectives.yml    # Named objective sections
```

### Event

An **event** is an action that fires when something happens — completing an objective, choosing a dialogue option, or triggering by another event. Events are defined as named entries with a kind (type) and arguments.

Common event kinds: `message`, `give`, `take`, `teleport`, `command`, `killmob`, `notify`, `objective`, `point`, `tag`, `variable`, `folder`, `setblock`, `spawnmob`.

**V1 YAML example:**
```yaml
# events.yml
reward_player: "give iron_sword,compass:4 sword:sharpness:5"
welcome_message: "message Welcome to the quest, %player%!"
```

**V2 YAML example:**
```yaml
# events.yml
reward_player:
  kind: give
  items:
    - material: iron_sword
      enchantments:
        - type: sharpness
          level: 5
    - material: compass
      amount: 4
welcome_message:
  kind: message
  message: "Welcome to the quest, %player%!"
```

### Condition

A **condition** is a check that evaluates to true or false. Conditions gate conversation options, event execution, and objective completion.

Common condition kinds: `hasItem`, `hasPermission`, `experience`, `health`, `location`, `tag`, `point`, `variable`, `check`, `time`, `weather`, `money`, `armor`.

**V1 YAML example:**
```yaml
# conditions.yml
has_sword: "item iron_sword:1"
is_high_level: "experience 30"
```

**V2 YAML example:**
```yaml
# conditions.yml
has_sword:
  kind: item
  items:
    - material: iron_sword
      amount: 1
is_high_level:
  kind: experience
  level: 30
```

### Objective

An **objective** is a quest task the player must complete. Objectives track progress and can fire events on completion.

Common objective kinds: `location`, `block`, `mobkill`, `action`, `die`, `craft`, `smelt`, `fish`, `breed`, `pickup`, `variable`, `password`.

**V1 YAML example:**
```yaml
# objectives.yml
kill_skeletons: "mobkill skeleton:10 events:reward_player"
```

**V2 YAML example:**
```yaml
# objectives.yml
kill_skeletons:
  kind: mobkill
  mob: skeleton
  amount: 10
  events: reward_player
```

### Conversation

A **conversation** is an NPC dialogue tree. It consists of:

- **Quester**: The NPC name
- **First options**: Entry points to the conversation
- **NPC Options**: What the NPC says (text, conditions to show, events to fire, pointers to player responses)
- **Player Options**: What the player can say (text, conditions to show, events to fire, pointers to next NPC options)
- **Pointers**: Links between options forming the dialogue flow

```
                ┌──────────────┐
                │  Start Node  │
                └──────┬───────┘
                       │
                ┌──────▼───────┐
                │ NPC Option 1 │──┐
                │ (text+events)│  │ pointers
                └──────┬───────┘  │
                       │          │
                ┌──────▼───────┐  │
                │Player Option │◄─┘
                │   A / B      │
                └──────┬───────┘
                       │
                ┌──────▼───────┐
                │ NPC Option 2 │
                └──────────────┘
```

### Item (V2 only)

In V2, items are defined as named entries that can be referenced by events and conditions. They define material, amount, enchantments, lore, and other item properties.

```yaml
# items.yml
quest_sword:
  material: iron_sword
  name: "&6Quest Sword"
  lore:
    - "&7A mighty blade"
  enchantments:
    - type: sharpness
      level: 3
```

### Arguments

Arguments are the key-value parameters of an element (event, condition, objective, item). Each element kind has a defined set of arguments, each being **mandatory** (required) or **optional** (has a default).

**V1 arguments** are positional values in a space-delimited string:
```
"give iron_sword:1 tagged(quest_item)"
 └─┬─┘ └────┬────┘ └──────┬──────┘
  kind  mandatory    optional arg
         arg
```

**V2 arguments** are explicit key-value pairs:
```yaml
kind: give
items:                  # mandatory
  - material: iron_sword
    amount: 1
tagged: quest_item      # optional
notify: true            # optional
```

### Element Kinds

The type taxonomy for BetonQuest elements:

| Category | Domain | V1 Example Kinds | V2 Example Kinds |
|---|---|---|---|
| **Event** | Things that happen | `message`, `give`, `teleport`, `command` | Same as V1, plus folder-based variants |
| **Condition** | Checks that must be true | `hasItem`, `experience`, `location`, `tag` | Same as V1, plus variable-based checks |
| **Objective** | Tasks to complete | `mobkill`, `location`, `action`, `block` | Same as V1 |
| **Item** | Item definitions | N/A (not in V1) | Named item with material, enchants, lore |
| **Conversation** | NPC dialogue | `npc_option`, `player_option` | Same |
| **Option** (NPC/Player) | Nodes in dialogue tree | Inside `conversations/*.yml` | Inside `package.yml` conversation sections |

### Variables (V2 only)

V2 supports a variable system using `%variable%` syntax. Variables allow dynamic values to be passed between events, conditions, and objectives.

**Variable kinds:**
- `condition` — stores the result of a condition evaluation
- `point` — numeric point counter
- `globalpoint` — server-wide point counter
- `tag` — boolean tag
- `globaltag` — server-wide boolean tag
- `objective` — objective property value (progress, state)
- `section` — conversation section reference

```yaml
# Example: event that uses a variable
give_points:
  kind: point
  variable: %player_score%
  amount: 10
```

---

## Key Capabilities

| Capability | Description |
|---|---|
| **Language Server (LSP)** | Semantic tokens, hover info, code completions, go-to-definition, find-references, diagnostics for `.yml` files |
| **Graphical Editors** | Custom webview editors for conversation flowcharts, events, conditions, objectives, and full packages |
| **Dual Format Support** | BetonQuest v1 (single `main.yml` with separate files) and v2 (`package.yml` inside `QuestPackages/`) |
| **VS Code Everywhere** | Works on desktop (Node.js) and web (vscode.dev) via webpack targets |
| **i18n** | UI and hover documentation in English, Simplified Chinese, and Japanese |

### LSP Features per File Context

| LSP Feature | V1 Events | V1 Conditions | V1 Objectives | V1 Conversations | V2 Package | V2 Sections |
|---|---|---|---|---|---|---|
| **Semantic Tokens** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Hover Info** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Completions** | Yes | Yes | Yes | Partial | Yes | Yes |
| **Go-to-Definition** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Find References** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Diagnostics** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Code Actions** | Partial | Partial | Partial | Partial | Partial | Partial |

### Editor Features per Editor Type

| Feature | Conversation Editor | Events Editor | Conditions Editor | Objectives Editor | Package Editor |
|---|---|---|---|---|---|
| **Flowchart View** | Yes | — | — | — | Yes |
| **Inline Editing** | — | Yes | Yes | Yes | Yes |
| **Drag Reorder** | — | Yes | Yes | Yes | Yes |
| **Cursor Sync** | Yes | Yes | Yes | Yes | Yes |
| **Translation Selector** | Yes | — | — | — | Yes |
| **Resizable Panels** | — | — | — | — | Yes |
| **Tabbed Conversations** | — | — | — | — | Yes |
| **Auto Layout** | Yes | — | — | — | Yes |

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Extension Host** | TypeScript, VS Code Extension API |
| **Language Server** | TypeScript, LSP protocol, custom YAML AST parser |
| **Webview UI** | React 18, Ant Design, ReactFlow, CSS Modules |
| **Build** | Webpack 5 (5 targets), TypeScript project references |
| **Shared Models** | TypeScript classes for BetonQuest YAML schema |
| **Data** | minecraft-data, Bukkit/Spigot source parsing |

## Repository Structure

```
vscode-BetonQuest/
├── extension/          # VS Code extension host
│   └── src/
│       ├── extension.node.ts          # Desktop entry (IPC transport)
│       ├── extension.web.ts           # Web entry (Worker transport)
│       ├── extension.common.ts        # Core activation: LSP client, commands, editor providers
│       ├── conversationEditorProvider.ts
│       ├── eventsEditorProvider.ts
│       ├── conditionsEditorProvider.ts
│       ├── objectivesEditorProvider.ts
│       ├── packageEditorProvider.ts
│       └── lsp/
│           ├── options.ts             # LSP client configuration
│           └── file.ts                # File system custom request handlers
│
├── server/             # LSP Language Server
│   └── src/
│       ├── server.node.ts             # Node.js LSP connection
│       ├── server.web.ts              # Web/browser LSP connection
│       ├── server.common.ts           # Core LSP: capabilities, handlers, AST management
│       ├── ast/                       # YAML AST parser (two-version architecture)
│       │   ├── ast.ts                 # ASTs manager (multi-workspace)
│       │   ├── node.ts                # AbstractNode base class (tree traversal, diagnostics, tokens)
│       │   ├── v1.ts / v2.ts          # Version-specific node bases
│       │   ├── v1/                    # V1 AST nodes (Package, Condition*, Event*, Conversation*, etc.)
│       │   └── v2/                    # V2 AST nodes (Package, Condition*, Event*, Conversation*, etc.)
│       ├── service/                   # LSP feature handlers
│       │   ├── hover.ts, locations.ts, semanticTokens.ts
│       │   ├── packageConditions.ts, packageEvents.ts
│       └── utils/                     # YAML parsing, diagnostics codes, document management
│
├── webview/            # React Webview UIs
│   └── src/
│       ├── conditionsEditor/          # Entry: legacyListEditor/app → <App<Condition>>
│       ├── eventsEditor/              # Entry: legacyListEditor/app → <App<Event>>
│       ├── objectivesEditor/          # Entry: legacyListEditor/app → <App<Objective>>
│       ├── conversationEditor/        # ReactFlow-based flowchart editor
│       │   └── components/            # ConnectionLine, ContextMenu, TranslationSelector, autoLayout
│       ├── packageEditor/             # Full v2 package editor (tabs + resizable sider)
│       │   └── components/
│       │       ├── Main/              # Conversation flowcharts in tabs
│       │       └── Sider/             # Events/Conditions/Objectives/Items list editors
│       └── components/                # Shared: DraggableTag, ResizableDrawer, ResizableSider, YamlErrorPage
│
├── utils/              # Shared utilities (path alias: "betonquest-utils/*")
│   └── src/
│       ├── betonquest/                # BetonQuest YAML data model classes
│       │   ├── List.ts, ListElement.ts, Event.ts, Condition.ts, Objective.ts, Item.ts
│       │   ├── Conversation.ts, Package.ts, Arguments.ts
│       │   ├── v1/Element.ts, v2/Element.ts     # V1/V2 element kind type definitions
│       │   └── DataType/              # Block, Enchantment, Entity, Item, Location wrappers
│       ├── bukkit/                    # Bukkit/Minecraft data types
│       │   ├── Data/                  # Generated JSON: EntityTypeList, MaterialList, etc.
│       │   └── DataType/              # TypeScript classes for each type
│       ├── yaml/                      # YAML utilities (offset/path mapping, node finding)
│       ├── lsp/                       # Shared LSP contract types (File, Locations, PackageEntries)
│       ├── i18n/                      # i18n system + English/Chinese/Japanese translations
│       └── ui/                        # Ant Design CSS overrides themed with VS Code variables
│
├── scripts/            # Data generation (pulls Bukkit/Minecraft data from Spigot, minecraft-data)
├── assets/             # Icons and screenshots
└── docs/               # Project documentation (wiki, KB, specs) ← THIS DIRECTORY
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                │
│  extension/src/extension.common.ts                      │
│                                                         │
│  ┌──────────────┐  ┌──────────────────────────────┐     │
│  │ LanguageClient│  │ 5× CustomEditorProviders    │     │
│  │ (LSP Client) │  │                              │     │
│  │              │  │ conversationEditorProvider   │     │
│  │              │  │ eventsEditorProvider         │     │
│  │              │  │ conditionsEditorProvider     │     │
│  │              │  │ objectivesEditorProvider     │     │
│  │              │  │ packageEditorProvider        │     │
│  └──────┬───────┘  └─────────────┬────────────────┘     │
│         │ IPC/Worker             │ postMessage          │
└─────────┼────────────────────────┼──────────────────────┘
          │                        │
    ┌─────▼──────────┐    ┌────────▼───────────┐
    │  LSP Server    │    │  React Webviews    │
    │  server/       │    │  webview/          │
    │                │    │                    │
    │  ASTs Manager  │    │  legacyListEditor  │
    │  (V1 + V2)    │    │  conversationEditor│
    │                │    │  packageEditor     │
    │  Services:     │    │                    │
    │  - hover       │    │  Uses shared:      │
    │  - completions │    │  - betonquest utils│
    │  - semantic    │    │  - bukkit data     │
    │  - diagnostics │    │  - i18n            │
    │  - definitions │    │  - yaml helpers    │
    │  - references  │    └────────────────────┘
    └────────────────┘
```

## Dual Format: V1 vs V2

BetonQuest has two YAML package formats:

| Aspect | V1 (Legacy) | V2 (Modern) |
|---|---|---|
| **Package root** | `main.yml` at any folder level | `package.yml` inside `QuestPackages/<name>/` |
| **Event files** | `events.yml` (single file) | `events.yml` with named sections |
| **Condition files** | `conditions.yml` (single file) | `conditions.yml` with named sections |
| **Objective files** | `objectives.yml` (single file) | `objectives.yml` with named sections |
| **Conversations** | `conversations/*.yml` (separate files per NPC) | Defined inline within `package.yml` sections |
| **Editor** | Separate editors per file type | Unified `packageEditor` |
| **Variable support** | Limited | Full variable system (`%variable%`) |
| **Event format** | Space-delimited positional args: `give sword:1` | Key-value: `kind: give`, `items: [{material: sword}]` |
| **Condition format** | Space-delimited positional args: `item sword:1` | Key-value: `kind: item`, `items: [{material: sword}]` |
| **Objective format** | Space-delimited: `mobkill skeleton:10 events:reward` | Key-value: `kind: mobkill`, `mob: skeleton`, `amount: 10` |

## Extension Activation

- **Event:** `onStartupFinished` — the extension activates eagerly after VS Code finishes loading
- **Context keys:** `canActivateConversationEditor`, `canActivateEventsEditor`, `canActivateConditionsEditor`, `canActivateObjectivesEditor`, `canActivatePackageEditor` — determined by checking if the active file lives inside a BetonQuest package directory (presence of `main.yml` or `package.yml` in parent directories)
- Editors appear as "Open" buttons in the editor toolbar when the context is right

## Extension Contributions Reference

### Commands

| Command ID | Title | When Clause (toolbar visibility) |
|---|---|---|
| `betonquest.openConversationEditor` | Open Conversation Editor | `resourceLangId == yaml && !activeCustomEditorId && resourcePath =~ /conversations[/\\].+\.yml$/i && canActivateConversationEditor` |
| `betonquest.openEventsEditor` | Open Events Editor | `resourceLangId == yaml && !activeCustomEditorId && resourcePath =~ /events\.yml$/i && canActivateEventsEditor` |
| `betonquest.openConditionsEditor` | Open Conditions Editor | `resourceLangId == yaml && !activeCustomEditorId && resourcePath =~ /conditions\.yml$/i && canActivateConditionsEditor` |
| `betonquest.openObjectivesEditor` | Open Objectives Editor | `resourceLangId == yaml && !activeCustomEditorId && resourcePath =~ /objectives\.yml$/i && canActivateObjectivesEditor` |
| `betonquest.openPackageEditor` | Open Package Editor | `resourceLangId == yaml && !activeCustomEditorId && canActivatePackageEditor` |

### Custom Editors

| viewType | Display Name | Selector (file patterns) | Priority |
|---|---|---|---|
| `betonquest.conversationEditor` | BetonQuest Conversation Editor | `**/conversations/*.yml`, `**/conversations/*.yaml` | `option` |
| `betonquest.eventsEditor` | BetonQuest Events Editor | `**/events.yml`, `**/events.yaml` | `option` |
| `betonquest.conditionsEditor` | BetonQuest Conditions Editor | `**/conditions.yml`, `**/conditions.yaml` | `option` |
| `betonquest.objectivesEditor` | BetonQuest Objectives Editor | `**/objectives.yml`, `**/objectives.yaml` | `option` |
| `betonquest.packageEditor` | BetonQuest Package Editor | `**/*.yml`, `**/*.yaml` | `option` |

### Configuration Settings

| Setting | Type | Default | Description |
|---|---|---|---|
| `betonquest.setting.translationSelection` | `string` | `"en"` | Translation language for conversation flowchart display. Available: `"en"`, `"ja"`, `"zh_cn"` |

### Context Keys

| Context Key | Set When | Purpose |
|---|---|---|
| `canActivateConversationEditor` | Active YAML file is inside a BetonQuest package and is under a `conversations/` directory | Show conversation editor toolbar button |
| `canActivateEventsEditor` | Active YAML file is inside a BetonQuest package and is named `events.yml`/`events.yaml` | Show events editor toolbar button |
| `canActivateConditionsEditor` | Active YAML file is inside a BetonQuest package and is named `conditions.yml`/`conditions.yaml` | Show conditions editor toolbar button |
| `canActivateObjectivesEditor` | Active YAML file is inside a BetonQuest package and is named `objectives.yml`/`objectives.yaml` | Show objectives editor toolbar button |
| `canActivatePackageEditor` | Active YAML file is inside a BetonQuest V2 package (`QuestPackages/*/package.yml` present) | Show package editor toolbar button |

## Compatibility

### VS Code Version Support

- **Minimum:** VS Code 1.80.0
- **Tested on:** VS Code 1.80+ (desktop), vscode.dev (web)
- **Platforms:** Windows, macOS, Linux (desktop); any browser (web)

### BetonQuest Plugin Version Compatibility

- **V1 format:** BetonQuest 1.x (legacy format, space-delimited arguments)
- **V2 format:** BetonQuest 2.x (QuestPackages structure, key-value arguments, variables)
- The extension supports both formats simultaneously — the AST layer has parallel V1 and V2 implementations

### Minecraft Version Support

- **Bukkit data:** Generated from Spigot/Paper source code (Material, EntityType, Enchantment, etc.)
- **minecraft-data:** v3.105.0 (used for block state mappings)
- Data is regenerated via `npm run generate-list` when new Minecraft versions are supported

---

## See Also

- [02-architecture.md](02-architecture.md) — detailed architecture of all subsystems
- [05-development-guide.md](05-development-guide.md) §8 — project-specific terminology glossary
- [../kb/ast-system.md](../kb/ast-system.md) — AST system deep dive
- [../kb/bukkit-data-types.md](../kb/bukkit-data-types.md) — Bukkit data type generation

---

*Last updated: 2026-05-26*
