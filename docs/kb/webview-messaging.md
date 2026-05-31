# Knowledge Base: Webview Messaging Protocol

**Type:** reference
**Related:** [[ast-system]], [[lsp-custom-requests]]

## Overview

Communication between the VS Code extension host and webview React apps uses a typed `postMessage` protocol. All messages are plain JavaScript objects with a `type` discriminator field.

## Message Flow

```
┌──────────────────────┐         postMessage          ┌──────────────────────┐
│   Extension Host     │ ───────────────────────────►  │   Webview (React)    │
│   (CustomEditorProvider)│                             │                      │
│                      │ ◄─────────────────────────── │                      │
└──────────────────────┘         postMessage          └──────────────────────┘
          │                                                      │
          │  WorkspaceEdit                                       │  React state
          ▼                                                      ▼
    VS Code TextDocument                                YAML data model classes
```

## Message Types

### Extension → Webview

#### `update`
Sent whenever the text document changes (including external edits).

```typescript
{
  type: 'update';
  text: string;              // Complete YAML file content
}
```

The webview parses this YAML into its data model (`List<T>`, `Package`, `Conversation`, etc.) and re-renders.

**Rate limiting:** In the legacy list editors, rapid updates are debounced. The webview caches the last YAML and only processes `update` after a short delay to avoid jank during typing. See `legacyListEditor/app.tsx` for the `cachedYaml` mechanism.

#### `set-betonquest-translationSelection`
Sent when the user changes the translation language in VS Code settings (conversation + package editors only).

```typescript
{
  type: 'set-betonquest-translationSelection';
  data: string;              // Locale code: "en", "zh-cn", "ja"
}
```

#### `cursor-yaml-path`
Sent by the extension to navigate the webview cursor to a specific YAML element.

```typescript
{
  type: 'cursor-yaml-path';
  data: YamlPath;            // Abstract path identifying a YAML node
}
```

This enables bidirectional cursor sync: clicking in the text editor highlights the corresponding UI element in the webview.

### Webview → Extension

#### `edit`
The primary write path. Sent when the user makes changes in the webview UI.

```typescript
{
  type: 'edit';
  text: string;              // Complete modified YAML content
}
```

On receiving `edit`, the extension provider:
1. Creates a `WorkspaceEdit`
2. Replaces the entire document content
3. Applies via `vscode.workspace.applyEdit()`

**Important:** The webview sends the **full** YAML content, not a diff. The extension replaces the entire document. This is because the YAML data model classes serialize the complete structure.

#### `request-package-conditions`
Package editor only. Requests the list of condition names in the current package from the LSP server.

```typescript
{
  type: 'request-package-conditions';
}
```

The extension forwards this to the LSP server via `custom/packageConditions`, then sends the result back as a `package-conditions` message (or similar — check `packageEditorProvider.ts` for exact response format).

#### `request-package-events`
Same pattern as conditions but for event names.

```typescript
{
  type: 'request-package-events';
}
```

#### `cursor-yaml-path`
Sent by the webview to report where the user's cursor is in the UI (reverse of the same-named message from extension).

```typescript
{
  type: 'cursor-yaml-path';
  data: YamlPath;
}
```

The extension uses this to move the text editor cursor to the corresponding YAML location, enabling bidirectional navigation.

## Cursor Synchronization

Bidirectional cursor sync is a key UX feature:

1. **User clicks in text editor** → Extension sends `cursor-yaml-path` → Webview scrolls to and highlights the UI element
2. **User clicks in webview UI** → Webview sends `cursor-yaml-path` → Extension moves text editor cursor to the YAML key

The `YamlPath` type (from `utils/src/yaml/yamlPathPointer.ts`) is a path array that identifies a YAML node position:

```typescript
// Example: ["events", "giveWood", "arguments", "amount"]
type YamlPath = (string | number)[];
```

The `YamlPathPointer` React context wraps each webview app to provide cursor position tracking throughout the component tree.

## Provider Implementation Pattern

Each provider's `resolveCustomTextEditor` follows this exact flow:

```
resolveCustomTextEditor(document, webviewPanel, token):
  // SETUP
  webviewPanel.webview.options = { enableScripts: true, retainContextWhenHidden: true }
  webviewPanel.webview.html = getWebviewContent(webviewPanel, extensionUri)

  // DOCUMENT → WEBVIEW
  updateWebview() {
    webviewPanel.webview.postMessage({
      type: 'update',
      text: document.getText()
    })
  }

  // WEBVIEW → DOCUMENT
  webviewPanel.webview.onDidReceiveMessage(message => {
    switch (message.type) {
      case 'edit':
        const edit = new vscode.WorkspaceEdit()
        edit.replace(document.uri, fullRange, message.text)
        vscode.workspace.applyEdit(edit)
        break
      case 'cursor-yaml-path':
        // Move text editor cursor
        break
      case 'request-package-conditions':
        // Query LSP, send result back
        break
      case 'request-package-events':
        // Query LSP, send result back
        break
    }
  })

  // SUBSCRIPTIONS
  sub1 = vscode.workspace.onDidChangeTextDocument(e => {
    if (e.document.uri.toString() === document.uri.toString()) updateWebview()
  })
  sub2 = vscode.workspace.onDidChangeConfiguration(e => {
    if (e.affectsConfiguration('betonquest.setting.translationSelection')) {
      webviewPanel.webview.postMessage({ type: 'set-betonquest-translationSelection', ... })
    }
  })
```

## Webview Lifecycle

1. **Created:** User opens a YAML file matching a custom editor selector, or clicks the editor toolbar button
2. **Active:** Receives `update` messages, sends `edit` messages. Has focus.
3. **Hidden:** `retainContextWhenHidden: true` means the webview stays in memory and keeps its React state when the user switches tabs
4. **Disposed:** When the editor tab is closed. The provider's `dispose()` cleans up event listeners.
