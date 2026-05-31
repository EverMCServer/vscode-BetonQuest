# Build, Test & Packaging

## 1. Build Pipeline

### 1.1 Full Compile

```bash
npm run compile
```

This runs sequentially:
1. **`npm-run-all i`** — `npm prune && npm install` at root
2. **`npm-run-all generate-list`** — `ts-node scripts/generateData.ts` -> generates `utils/src/bukkit/Data/*.json`
3. **`npm-run-all compile:all`** — `tsc -b ./extension/ ./webview/ ./server/` -> type checking + `.d.ts` declarations
4. **`npm-run-all webpack:compile`** — `webpack --config webpack.prod.js` -> 5 bundled outputs

### 1.2 Watch Mode (Development)

```bash
npm run watch
```

Runs in parallel:
- `tsc -b -watch ./extension/ ./webview/ ./server/` — re-type-check on changes
- `webpack --watch --config webpack.dev.js` — re-bundle on changes

### 1.3 VS Code Tasks (`.vscode/tasks.json`)

Preconfigured tasks available via `Terminal > Run Task`:
- `npm: compile`
- `npm: watch`

### 1.4 VS Code Launch Configurations

Available from the workspace file (`vscode-BetonQuest.code-workspace`):
- **`Launch Extension`** — F5 debug with `--extensionDevelopmentPath=.`
- **`Launch Web Extension`** — Opens in browser via `vscode-test-web`

### 1.5 Dependency Graph

```
scripts/generateData.ts
  -> fetches Spigot Java sources
  -> merges with minecraft-data
  -> generates utils/src/bukkit/Data/*.json

utils/ (build first — no dependencies on other sub-projects)
  -> tsc compiles to utils/out/
  -> webview and server depend on this via tsconfig references

server/ (depends on utils/)
  -> tsc compiles to server/out/
  -> webpack bundles to server/dist/server.node.js and server/dist/server.web.js

webview/ (depends on utils/)
  -> tsc compiles to webview/out/
  -> webpack bundles 5 entry points to webview/dist/

extension/ (no code dependency on utils)
  -> tsc compiles to extension/out/
  -> webpack bundles to extension/dist/extension.js and extension/dist/web/extension.js
```

### 1.6 Incremental Builds

- **`tsc -b`** uses TypeScript's build mode with project references. It only recompiles changed projects and their dependents.
- **When full rebuild is needed:** After `npm install`, after `npm run generate-list`, or after deleting `out/`/`dist/` directories.

### 1.7 Build Artifacts

| Webpack Config | Target | Entry File | Output File |
|---|---|---|---|
| `extensionConfig` | `node` | `extension/src/extension.node.ts` | `extension/dist/extension.js` |
| `webExtensionConfig` | `webworker` | `extension/src/extension.web.ts` | `extension/dist/web/extension.js` |
| `webviewConfig` | `web` | 5 entries (one per editor) | `webview/dist/conversationEditor.js`, `eventsEditor.js`, etc. |
| `lspServerNodeConfig` | `node` | `server/src/server.node.ts` | `server/dist/server.node.js` |
| `lspServerWebConfig` | `webworker` | `server/src/server.web.ts` | `server/dist/server.web.js` |

---

## 2. Package Installation

```bash
npm install    # Runs postinstall -> installs all 4 sub-projects
```

The `postinstall` script runs:
```
npm-run-all install:*
```
Which executes in parallel:
- `cd extension/ && npm install && npm prune`
- `cd server/ && npm install && npm prune`
- `cd webview/ && npm install && npm prune`
- `cd utils/ && npm install && npm prune`

---

## 3. Webpack Configuration

### 3.1 Common Config (`webpack.common.js`)

Defines 5 webpack configs:

| # | Name | Target | Entry | Output |
|---|---|---|---|---|
| 0 | `extensionConfig` | `node` | `extension/src/extension.node.ts` | `extension/dist/extension.js` |
| 1 | `webExtensionConfig` | `webworker` | `extension/src/extension.web.ts` | `extension/dist/web/extension.js` |
| 2 | `webviewConfig` | `web` | 5 entry points | `webview/dist/*.js` |
| 3 | `lspServerNodeConfig` | `node` | `server/src/server.node.ts` | `server/dist/server.node.js` |
| 4 | `lspServerWebConfig` | `webworker` | `server/src/server.web.ts` | `server/dist/server.web.js` |

**Key webpack features:**
- `tsconfig-paths-webpack-plugin` — resolves `betonquest-utils/*` path aliases
- `copy-webpack-plugin` — copies React UMD bundles to `webview/dist/lib/`
- `css-modules-typescript-loader` — generates `.d.ts` for CSS modules
- Polyfills for web targets: `path-browserify`, `process`, `assert`

### 3.2 Production vs Development

| Aspect | Production (`webpack.prod.js`) | Development (`webpack.dev.js`) |
|---|---|---|
| Mode | `production` | `development` |
| Source maps | `source-map` | `eval-source-map` |
| Minification | Yes | No |
| React loading | Production UMD | Development UMD |

---

## 4. Testing

### 4.1 Test Architecture Overview

The project has three test layers:

| Layer | What it tests | Technology |
|---|---|---|
| **Unit tests** | Pure logic in `utils/` (data models, YAML utilities, i18n) | Mocha + assert |
| **Server tests** | AST parsing, diagnostics, LSP features | Mocha + mock TextDocument |
| **Extension/Webview tests** | End-to-end: editor providers, webview rendering | `@vscode/test-electron`, React Testing Library |

### 4.2 Current State

Tests are **minimal/stub**. The existing test infrastructure:

- **[extension/src/test/runTest.ts](../extension/src/test/runTest.ts)** — Configures VS Code test runner via `@vscode/test-electron`
- **[extension/src/test/suite/extension.test.ts.bak](../extension/src/test/suite/extension.test.ts.bak)** — Stub test file (disabled, `.bak` extension)
- **[extension/src/test/suite/index.ts.bak](../extension/src/test/suite/index.ts.bak)** — Stub test runner config (disabled, `.bak` extension)

No tests exist for `server/`, `webview/`, or `utils/` packages.

### 4.3 Writing Unit Tests (utils/)

For pure logic with no VS Code dependency:

```typescript
// utils/src/test/suite/yaml.test.ts
import * as assert from 'assert';
import { findYamlNodeByOffset } from '../../yaml/findYamlNodeByOffset';
import { parseDocument } from 'yaml';

suite('YAML Utilities', () => {
  test('findYamlNodeByOffset returns correct node', () => {
    const doc = parseDocument('key: value\nlist:\n  - item1\n  - item2');
    const node = findYamlNodeByOffset(doc, 0);
    assert.ok(node);
  });
});
```

### 4.4 Writing Server Tests

Mock `TextDocument` to test AST parsing:

```typescript
// server/src/test/suite/ast.test.ts
import { buildV1Ast } from '../../ast/ast';

function mockDocument(content: string): TextDocument {
  return {
    uri: 'file:///test/events.yml',
    getText: () => content,
    // ... other required properties
  } as TextDocument;
}

test('parses V1 event entry', () => {
  const doc = mockDocument('reward: "give sword:1"');
  const ast = buildV1Ast(doc.getText(), doc);
  // assert on AST structure
});
```

### 4.5 Writing Extension Tests

Use `@vscode/test-electron` for integration tests that exercise real VS Code APIs:

```typescript
// extension/src/test/suite/extension.test.ts
import * as vscode from 'vscode';

test('extension activates', async () => {
  const ext = vscode.extensions.getExtension('EverMC.betonquest');
  assert.ok(ext);
  await ext.activate();
  assert.ok(ext.isActive);
});
```

### 4.6 Writing Webview Tests

Use React Testing Library with mocked VS Code API:

```typescript
// Mock vscode API
global.acquireVsCodeApi = () => ({
  postMessage: jest.fn(),
  getState: jest.fn(),
  setState: jest.fn(),
});

test('renders event list from YAML', () => {
  render(<App<Event> />);
  // Simulate receiving update message
  // Assert on rendered elements
});
```

### 4.7 Running Tests

```bash
# Unit tests (utils)
cd utils && npx mocha src/test/suite/*.test.ts

# Server tests
cd server && npx mocha src/test/suite/*.test.ts

# Extension tests (requires VS Code)
npm test    # Currently non-functional — stub tests only

# Web testing
npm run open-in-browser
```

### 4.8 Test Data

Sample YAML fixtures for testing should be placed in `<package>/src/test/fixtures/`:

```
server/src/test/fixtures/
+-- v1/
|   +-- events.yml           # Minimal V1 events
|   +-- conditions.yml        # Minimal V1 conditions
|   +-- conversations/
|       +-- simple.yml        # Minimal V1 conversation
+-- v2/
    +-- package.yml           # Minimal V2 package
```

---

## 5. CI/CD Setup

### 5.1 GitHub Actions Workflow (Recommended)

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: npm run compile
      - run: npm test
```

### 5.2 Build Verification

`npm run compile` is the canonical verification that the project builds. A CI pipeline should at minimum:
1. Checkout
2. Install dependencies
3. Compile
4. Verify no TypeScript errors

### 5.3 VSIX Artifact

```yaml
- name: Package VSIX
  run: npx vsce package
- uses: actions/upload-artifact@v4
  with:
    name: betonquest-${{ matrix.os }}.vsix
    path: '*.vsix'
```

---

## 6. Development Environment

### 6.1 VS Code Workspace Setup

Open `vscode-BetonQuest.code-workspace` to get:
- Project references configured
- Recommended extensions suggested
- Debug launch configurations available
- Correct settings for excluding `dist/` and `out/` from searches

### 6.2 Recommended Extensions

From [`.vscode/extensions.json`](../.vscode/extensions.json):
- ESLint
- TypeScript + TSLint Problem Matcher

### 6.3 Debug Configurations

| Configuration | Purpose | How to Launch |
|---|---|---|
| Launch Extension | Desktop extension in Extension Dev Host | F5 |
| Launch Web Extension | Web extension in browser | F5 (select config), then `npm run open-in-browser` |
| Attach to Server | Debug LSP server process | Launch Extension first, then attach |

### 6.4 Hot Reload Limitations

- **Extension code changes:** Requires restarting the Extension Dev Host (close + F5)
- **Server code changes:** Server auto-restarts on webpack rebuild in watch mode
- **Webview code changes:** Webview auto-reloads on webpack rebuild (refresh the webview)
- **Utils code changes:** Both server and webview need rebuild (handled by webpack watch)

---

## 7. Data Generation Pipeline

### 7.1 Running

```bash
npm run generate-list
```

This executes `ts-node scripts/generateData.ts`.

### 7.2 Source Data Origins

| Data Type | Source | Format |
|---|---|---|
| EntityType | Spigot's `org.bukkit.entity.EntityType.java` (fetched from Bitbucket) | Java enum |
| Material | Spigot's `org.bukkit.Material.java` + minecraft-data blocks | Java enum + JSON |
| Enchantment | Spigot's `org.bukkit.enchantments.Enchantment.java` | Java class fields |
| PotionEffectType | Spigot's `org.bukkit.potion.PotionEffectType.java` | Java class fields |
| DyeColor | Spigot's `org.bukkit.DyeColor.java` | Java enum |
| Biome | Spigot's `org.bukkit.block.Biome.java` | Java enum |
| BlockState | minecraft-data (v1.21.11) `blocks.json` | JSON |

### 7.3 Generated File Formats

Each data type produces a JSON array in `utils/src/bukkit/Data/`:

```json
[
  { "name": "zombie", "displayName": "Zombie" },
  { "name": "skeleton", "displayName": "Skeleton" },
  ...
]
```

These JSON files are **gitignored** and regenerated during each build.

### 7.4 Updating for New Minecraft Versions

1. Update the `minecraft-data` dependency version in root `package.json`:
   ```json
   "minecraft-data": "^3.XXX.0"
   ```
2. Run `npm run generate-list` to regenerate data
3. Test that Completions include new materials/entities
4. Check for any removed/renamed materials (may require code changes)

---

## 8. Packaging

### 8.1 VSIX Creation

```bash
npx vsce package
```

The `.vscodeignore` file excludes from the VSIX:
- `.vscode/**`, `.vscode-test-web/**`
- `node_modules/**`, `*/node_modules/**`
- `*/src/**`, `*/out/**` (source and intermediate build files)
- All webpack configs, tsconfig files
- Screenshots, `.claude/`, `.gitignore`

### 8.2 Publishing

```bash
npx vsce publish
```

Publisher: **EverMC**

---

## 9. Scripts Reference

| Script | Purpose |
|---|---|
| `npm run compile` | Full production build |
| `npm run watch` | Development watch mode |
| `npm run generate-list` | Regenerate Bukkit/Minecraft JSON data |
| `npm run compile:all` | TypeScript compilation only (no webpack) |
| `npm run webpack:compile` | Webpack bundling only |
| `npm run webpack:watch` | Webpack watch mode |
| `npm run open-in-browser` | Test extension in browser |
| `npm run i` | Reinstall all dependencies |
| `npm run vscode:prepublish` | Pre-publish hook (runs `compile`) |

---

## See Also

- [02-architecture.md](02-architecture.md) §6 — data generation overview
- [03-coding-paradigm.md](03-coding-paradigm.md) §Testing Conventions — test writing patterns
- [05-development-guide.md](05-development-guide.md) — development workflow and debugging
- [../kb/bukkit-data-types.md](../kb/bukkit-data-types.md) — Bukkit data generation deep dive

---

*Last updated: 2026-05-26*
