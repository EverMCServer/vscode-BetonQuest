# Troubleshooting & FAQ

Practical troubleshooting reference for common issues encountered during development and usage of the vscode-BetonQuest extension.

---

## 1. Common Issues & Solutions

### Blank Webview Panel

**Symptoms:** Opening a custom editor shows a blank white panel instead of the expected UI.

**Causes & Fixes:**
1. **Webpack chunks not loading** — Check the webpack build output for errors. Verify chunk paths in the provider's HTML template match the actual output in `webview/dist/`.
2. **React rendering error** — Open Webview Developer Tools (`Ctrl+Shift+P` -> "Developer: Open Webview Developer Tools") and check the console for React errors.
3. **YAML parse error** — The `YamlErrorPage` component should display if YAML parsing fails. If the page is completely blank, the error may be in the React app bootstrap, not YAML parsing.
4. **Missing React UMD bundles** — Verify `webview/dist/lib/` contains `react.production.min.js` and `react-dom.production.min.js` (copied by `copy-webpack-plugin`).

### LSP Features Not Working

**Symptoms:** No semantic highlighting, no hover tooltips, no completions, no diagnostics in `.yml` files.

**Causes & Fixes:**
1. **Server not started** — Check the extension host console (Help -> Toggle Developer Tools -> Console) for errors during LSP client startup.
2. **AST not built** — The AST only builds for files inside recognized BetonQuest packages. Verify `main.yml` or `package.yml` exists in a parent directory.
3. **File not detected as YAML** — VS Code must recognize the file as language `yaml`. Check the status bar shows "YAML" as the language mode.
4. **Server crashed** — Check if the server process is still running. Restart VS Code or run the "Developer: Restart Extension Host" command.

### Editor Toolbar Button Not Showing

**Symptoms:** The BetonQuest editor buttons don't appear in the editor toolbar for `.yml` files.

**Causes & Fixes:**
1. **Context key not set** — The toolbar buttons use `when` clauses with `canActivate*Editor` context keys. Verify the file is inside a BetonQuest package directory.
2. **File pattern mismatch** — Check the `when` clause in `package.json`:
   - Conversation button requires path matching `/conversations[/\\].+\.yml$/i`
   - Events button requires filename `events.yml` or `events.yaml`
   - Conditions button requires filename `conditions.yml` or `conditions.yaml`
   - Objectives button requires filename `objectives.yml` or `objectives.yaml`
3. **Custom editor already active** — The `when` clause includes `!activeCustomEditorId`. If another custom editor is already open, the button won't show. Close the custom editor first.

### Missing Bukkit Data / Completions

**Symptoms:** Entity type, material, or enchantment completions don't appear or are incomplete.

**Causes & Fixes:**
1. **Data not generated** — Run `npm run generate-list` to regenerate the JSON data files.
2. **Stale data** — If you recently updated Minecraft versions, the data may not include new items. Check the `minecraft-data` version and regenerate.
3. **File not in a package** — Bukkit data completions only activate when the file is recognized as part of a BetonQuest package.

### Extension Fails to Activate

**Symptoms:** The extension doesn't start, or shows an activation error.

**Causes & Fixes:**
1. **Build errors** — Run `npm run compile` and check for TypeScript or webpack errors.
2. **Missing dependencies** — Run `npm install` at root to ensure all sub-project `node_modules` are installed.
3. **VS Code version too old** — The extension requires VS Code 1.80+.
4. **Corrupted VSIX** — If installed from a VSIX, try reinstalling.

### Webpack Build Errors

**Symptoms:** `npm run compile` fails during the webpack step.

**Common causes:**
1. **TypeScript errors not caught by tsc** — Run `npm run compile:all` (tsc only) to check for type errors separately from webpack.
2. **Missing webpack plugins** — Check that `tsconfig-paths-webpack-plugin` and `copy-webpack-plugin` are installed in root `node_modules`.
3. **Path alias resolution** — Verify `betonquest-utils/*` aliases are configured in `webpack.common.js` via `tsconfig-paths-webpack-plugin`.
4. **Memory limit** — Webpack may run out of memory on large projects. Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npx webpack`

### TypeScript Compilation Errors

**Symptoms:** `tsc -b` fails with type errors.

**Common causes:**
1. **Project reference order** — `utils` must compile first, then `extension`, `server`, `webview`. Use `tsc -b` (build mode) which handles ordering automatically.
2. **Missing `composite: true`** — All `tsconfig.json` files must have `composite: true` for project references to work.
3. **Path alias not resolving** — Check `tsconfig.json` `paths` mapping for `betonquest-utils/*`.

### Conversation Flowchart Rendering Issues

**Symptoms:** The conversation flowchart editor shows nodes in wrong positions, missing edges, or layout errors.

**Causes & Fixes:**
1. **Auto-layout failure** — Check `autoLayout.tsx` for dagre-related errors. Some graph structures (cycles, disconnected subgraphs) may layout poorly.
2. **Missing pointer references** — If an option points to a non-existent option ID, the edge won't render. Check for `BQ-3021` diagnostics.
3. **ReactFlow version** — Custom node types must be registered with ReactFlow before rendering. Check `ConversationEditor.tsx` for `nodeTypes` configuration.

### Cursor Sync Not Working

**Symptoms:** Clicking elements in the webview doesn't navigate the text editor cursor, or vice versa.

**Causes & Fixes:**
1. **Message handler not set up** — Verify `cursor-yaml-path` message handling in both the extension provider and webview.
2. **YamlPath mismatch** — The YamlPath array from the webview must match the actual YAML structure. Check that indices align with array positions.
3. **Offset conversion error** — The extension converts YamlPath to document offset via `custom/locations` LSP request. Check LSP server logs for conversion errors.

### Package Editor Tab State Loss

**Symptoms:** Switching between conversation tabs in the package editor loses unsaved changes.

**Causes & Fixes:**
1. **Tab switch triggers reload** — The package editor reloads conversation data from YAML on tab switch. Any in-progress edits not yet sent to the text editor will be lost.
2. **Workaround:** Auto-save edits immediately rather than on tab switch.

---

## 2. Diagnostic Procedures

### Checking LSP Server Logs

1. In VS Code, open Output panel (`Ctrl+Shift+U`)
2. Select "BetonQuest" from the dropdown (if the extension creates an output channel)
3. For verbose LSP logging, add `"trace.server": "verbose"` to the LSP client options in `extension/src/lsp/options.ts` and rebuild

### Inspecting Webview Console

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run **"Developer: Open Webview Developer Tools"**
3. Check the Console tab for errors
4. Check the Network tab to verify webpack chunks loaded successfully

### Verifying File Structure Detection

The extension detects BetonQuest packages by scanning parent directories for:
- V1: Any folder containing `main.yml`
- V2: Any folder matching `QuestPackages/*/package.yml`

To debug detection:
1. Check `canActivate*Editor` context keys in the Command Palette: run "Developer: Inspect Context Keys"
2. Add `console.log` in `extension.common.ts` context key evaluation logic

### Testing with Minimal BetonQuest Package

Create a minimal test package to isolate issues:

**Minimal V1 test:**
```
test-package/
├── main.yml         # Empty file (just needs to exist)
├── events.yml       # test_event: "message Hello!"
└── conversations/
    └── npc.yml      # quester: Test
                     # first: greet
                     # NPC_options:
                     #   greet:
                     #     text: "Hello there!"
```

**Minimal V2 test:**
```
QuestPackages/
└── test-quest/
    └── package.yml  # conversations:
                     #   test_npc:
                     #     quester: Test
                     #     first: greet
                     #     NPC_options:
                     #       greet:
                     #         text: "Hello there!"
```

---

## 3. Known Limitations

### No Test Coverage

The project currently has no functional automated tests. All testing is manual (F5 + manual verification). See [04-build-and-test.md](04-build-and-test.md) §4 for the test infrastructure status.

### No CI/CD

There is no continuous integration or deployment pipeline. Builds, tests, and releases are performed manually. See [04-build-and-test.md](04-build-and-test.md) §5 for CI/CD setup recommendations.

### V1 Format Limitations

- V1 uses space-delimited positional arguments, which are more error-prone than V2's key-value format
- V1 conversations require separate files per NPC, making cross-referencing more complex
- No variable support in V1
- The V1 AST is maintained for backward compatibility but receives fewer new features

### Web Extension Constraints

- No `fs` module access (all file I/O through custom LSP requests)
- No `child_process` (no spawning external tools)
- Limited `vscode.workspace.fs` API surface
- Web extension performance may be slower than desktop for large packages

### Performance with Large Packages

- ASTs are fully rebuilt on any document change (no partial reparse)
- Very large packages with hundreds of events/conditions/conversations may experience noticeable latency
- The ReactFlow conversation editor may slow down with >50 nodes in a single conversation
- No lazy loading of Bukkit data — all data types are loaded into memory

---

## See Also

- [04-build-and-test.md](04-build-and-test.md) — build pipeline and testing
- [05-development-guide.md](05-development-guide.md) — debugging techniques and common pitfalls
- [02-architecture.md](02-architecture.md) — data flow walkthroughs for tracing issues

---

*Last updated: 2026-05-31*
