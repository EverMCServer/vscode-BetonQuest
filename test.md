How to add syntax / semantic highlighting support dynamically on a custom language (`customlang`), which is embedded in an existing language (`yaml`), through a language server (`vscode-languageserver`) in VSCode? The solution should avoid implementing the YAML grammar. Please explain with codes.

Here is an example of this custom language embedded in `yaml`:
```yaml
customlang: |-
  # Contents of `customlang`:
  cp ./file1 ./file2
````

To add syntax and semantic highlighting support for a custom language (`customlang`) embedded in an existing language (`yaml`) in VSCode, using the Language Server Protocol (LSP) provided by `vscode-languageserver`, involves several steps:

1. **Create a new VSCode extension.**
2. **Set up the language server.**
3. **Handle the embedded language within YAML documents.**
4. **Provide syntax and semantic highlighting for `customlang`.**

Let’s walk through each step, providing relevant code snippets and explanations.

### Step 1: Create a new VSCode extension

First, create a new VSCode extension by following the steps outlined in the [VSCode extension documentation](https://code.visualstudio.com/api/get-started/your-first-extension). This involves using Yeoman and the VSCode Extension Generator:

```bash
npm install -g yo generator-code
yo code
```

Select **New Extension (TypeScript)**, name your extension, and complete the setup. This will create a new directory with all the necessary files for your extension.

### Step 2: Set up the language server

In your extension, install the necessary Language Server Protocol libraries:

```bash
npm install vscode-languageserver vscode-languageserver-textdocument
```

Update the `extension.ts` file to start the language server when the extension is activated:

```typescript
import * as path from 'path';
import * as vscode from 'vscode';
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  TextDocumentSyncKind,
  InitializeResult
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

let client: vscode.LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    let serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

    let serverOptions: vscode.ServerOptions = {
        run: { module: serverModule, transport: vscode.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: vscode.TransportKind.ipc,
            options: debugOptions
        }
    };

    let clientOptions: vscode.LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'yaml' }],
        synchronize: {
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    client = new vscode.LanguageClient(
        'languageServerExample',
        'Language Server Example',
        serverOptions,
        clientOptions
    );

    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
```

### Step 3: Handle the embedded language within YAML documents

In your language server implementation (`server.js`), modify the text document handling to parse YAML and locate embedded `customlang` code:

```javascript
const { createConnection, TextDocuments, TextDocumentSyncKind } = require('vscode-languageserver');
const { TextDocument } = require('vscode-languageserver-textdocument');

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

documents.onDidOpen((change) => {
  handleCustomLang(change.document);
});

documents.onDidChangeContent((change) => {
  handleCustomLang(change.document);
});

function handleCustomLang(textDocument) {
  const text = textDocument.getText();
  const customLangBlocks = extractCustomLang(text);

  for (const block of customLangBlocks) {
    // Perform syntax and semantic analysis and send diagnostics
    connection.sendDiagnostics({ uri: textDocument.uri, diagnostics: [] });
  }
}

function extractCustomLang(text) {
  // Implement function to extract `customlang` blocks from YAML file
  return [];
}

documents.listen(connection);
connection.listen();
```

### Step 4: Provide syntax and semantic highlighting

For syntax highlighting, you can define TextMate grammars in a `.tmLanguage.json` file. For semantic highlighting, use the language server to compute and send tokens based on the content of `customlang`.

For example, add a simple grammar definition for `customlang` for embedded regions:

```json
{
  "scopeName": "source.customlang",
  "patterns": [
    {
      "match": "\\b(cp|mv|rm|chmod|mkdir)\\b",
      "name": "keyword.command.customlang"
    }
  ],
  "repository": {},
  "fileTypes": []
}
```

And then use semantic tokens in your server implementation:

```javascript
// Send semantic tokens based on parsing results
function sendSemanticTokens(document) {
  let tokens = [];
  // Example: generate tokens by parsing document content
  return tokens;
}
```

The key to integrating `customlang` effectively is parsing the YAML file to extract `customlang` blocks and handling them accordingly with semantic understanding and syntax highlighting, communicating these features through the LSP interface to VSCode.


This is a basic framework which you will need to adapt and expand based on the specific syntax and semantics of `customlang`.

Step 4 involves setting up syntax and semantic highlights for a custom language called `customlang` embedded within a YAML file. This step requires defining a TextMate grammar for basic syntax highlighting and leveraging the Language Server Protocol (LSP) to provide dynamic semantic highlighting. Let's dive deeper into each part:

### Syntax Highlighting with TextMate Grammar

VSCode uses TextMate grammars for syntax highlighting. These grammars use regular expressions to token classes that determine how text is highlighted. Here we define a basic TextMate grammar for `customlang`:

**Create Grammar File:**

Create a new file named `syntaxes/customlang.tmLanguage.json` in your extension folder. Place the following JSON content to identify and highlight basic keywords and comments in `customlang`:

```json
{
    "scopeName": "source.customlang",
    "patterns": [
        {
            "include": "#comment"
        },
        {
            "include": "#commands"
        }
    ],
    "repository": {
        "comment": {
            "name": "comment.line.customlang",
            "match": "#.*$"
        },
        "commands": {
            "name": "keyword.control.customlang",
            "match": "\\b(cp|mv|rm|chmod|mkdir|touch)\\b"
        }
    },
    "fileTypes": [ "customlang" ]
}
```

**Configure the Extension to Use the Grammar:**

Edit the `package.json` file in your VSCode extension directory to associate this grammar with files or embedded content within YAML that is identified as `customlang`:

```json
"contributes": {
    "languages": [{
        "id": "customlang",
        "aliases": ["CustomLang"],
        "extensions": [".customlang"],
        "configuration": "./language-configuration.json"
    }],
    "grammars": [{
        "language": "customlang",
        "scopeName": "source.customlang",
        "path": "./syntaxes/customlang.tmLanguage.json"
    }]
}
```

### Semantic Highlighting via Language Server

Semantic highlighting provides a more intelligent highlighting compared to static TextMate grammars. It's useful for advanced language features. You can use the language server to analyze the `customlang` content and provide detailed token information.

**Modify language server for Semantic Tokens:**

Here's a basic structure for providing semantic tokens using the Visual Studio Code API and language server:

**1. Define the capabilities in your server initialization:**

```javascript
connection.onInitialize((params) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full,
            semanticTokensProvider: {
                full: true,
                legend: {
                    tokenTypes: ['keyword', 'variable', 'operator'],
                    tokenModifiers: ['declaration', 'definition']
                }
            }
        }
    };
});
```

**2. Handle semantic tokens request:**

```javascript
function parseTextForSemanticTokens(text) {
    const lines = text.split(/\r?\n/);
    const tokens = [];

    lines.forEach((line, i) => {
        let match;
        if (match = line.match(/^\s*(cp|mv|rm|chmod|mkdir|touch)\b/)) {
            tokens.push({ line: i, startChar: match.index, length: match[0].length, tokenType: 'keyword', tokenModifiers: ['declaration'] });
        }
    });

    return tokens;
}

connection.onSemanticTokensFull((params) => {
    const document = documents.get(params.textDocument.uri);
    const tokens = parseTextForSemanticTokens(document.getText());
    
    const data = [];
    let prevLine = 0;
    let prevChar = 0;

    for (let token of tokens) {
        data.push(token.line - prevLine);
        data.push(token.startChar - (token.line === prevLine ? prevChar : 0));
        data.push(token.length);
        data.push(token.tokenType);
        data.push(token.tokenModifiers);
        prevLine = token.line;
        prevChar = token.startChar;
    }

    return { data };
});
```

In the example above, we define how the language server handles full semantic token requests. The language server parses the text for keywords (`cp, mv, ...`) and returns their respective positions transformed into a flattened token format that VSCode expects.

- **tokenType** and **tokenModifiers** are indices into an array defined in the legend provided during the initialization.

Remember that a proper semantic parsing may require more advanced techniques such as building an actual parser for `customlang` if it has complex syntax or semantic rules.

Combining both steps provides a rich editing experience in VSCode, starting from simple syntax coloring to more intelligent context-aware highlighting. Make sure to extend and refine this according to `customlang`'s specifics, this can significantly enhance clarity and productivity for anyone working with your custom language.