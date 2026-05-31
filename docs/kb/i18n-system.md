# Knowledge Base: Internationalization (i18n) System

**Type:** reference

## Overview

The extension supports three languages for both the VS Code UI and the webview content. The i18n system has two independent layers:
1. **VS Code UI strings** — via `package.nls.{locale}.json` (standard VS Code i18n)
2. **Webview + Hover content** — via `utils/src/i18n/` (custom i18n system)

## Layer 1: VS Code UI (`package.nls.*.json`)

Standard VS Code localization for commands, editor names, and settings descriptions.

**Files:**
- `package.nls.json` — English (default, fallback)
- `package.nls.zh-cn.json` — Simplified Chinese
- `package.nls.ja.json` — Japanese

**Usage in `package.json`:**
```json
{
  "title": "%extension.customEditors.conversationEditor.displayName%"
}
```

VS Code automatically selects the right `package.nls.*.json` based on the user's VS Code display language.

## Layer 2: Webview + Hover Content (`utils/src/i18n/`)

A custom i18n system for dynamic content: hover tooltips, webview UI labels, and BetonQuest element documentation.

### Architecture

```
utils/src/i18n/
├── i18n.ts              # Core: setLocale(), L(), allLanguages
└── data/
    ├── en.json           # English (default)
    ├── zh_cn.json        # Simplified Chinese
    └── ja.json           # Japanese
```

### Core API

```typescript
// Set the current locale
setLocale(locale: string): void;

// Get a translated string by dot-separated key
L(key: string, ...args: string[]): string;

// Available locales
const allLanguages: { code: string; name: string }[];
```

### Key Structure

Translation keys use dot-separated paths mirroring the JSON structure:

```json
// en.json
{
  "events": {
    "message": {
      "display": "Message",
      "description": "Sends a message to the player"
    },
    "give": {
      "display": "Give Item",
      "description": "Gives the player an item"
    }
  }
}
```

```typescript
L('events.message.display');      // "Message"
L('events.give.description');     // "Gives the player an item"
```

### Parameterized Strings

Some strings accept arguments for dynamic content:

```typescript
L('errors.argument.missing', 'amount');
// → "Missing required argument: amount"
```

### Fallback Behavior

If a key is not found in the current locale, the system falls back to English (`en.json`). This means `en.json` must always have every key — it's the canonical key registry.

### Where i18n is Used

| Context | Usage |
|---|---|
| **Hover tooltips** | `L()` in AST node `_getHoverInfo()` methods — provides translated documentation for BetonQuest elements |
| **Webview UI labels** | `L()` in React components — all UI text (buttons, labels, placeholders) |
| **Completions** | `L()` in `_getCompletions()` — completion item documentation |

## Adding a New Locale

1. **Create** `utils/src/i18n/data/<locale>.json` — copy the structure from `en.json` and translate all values
2. **Register** in `utils/src/i18n/i18n.ts`:
   ```typescript
   import newLocale from './data/<locale>.json';
   // Add to the locales map
   ```
3. **Add** `package.nls.<locale>.json` for VS Code UI strings
4. **Register** in `package.json` under `contributes.configuration` if the locale should be a selectable translation option

## Configuration

The translation language is controlled by the VS Code setting:
- **`betonquest.setting.translationSelection`** (default: `"en"`)

When the setting changes:
1. `extension.common.ts` / the editor providers detect the configuration change
2. They send `set-betonquest-translationSelection` to the webview
3. The webview calls `setLocale()` which re-renders all `L()` calls

## Key Principles

- **`en.json` is the canonical key set** — all other locales mirror its structure
- **Keys are dot-separated paths** — organized by domain (events, conditions, objectives, conversations, errors, ui)
- **Never concatenate translated strings** — use parameterized strings (`L('key', arg)`) instead
- **All strings go through `L()`** — no hardcoded English strings in UI or hover content
