// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import * as path from 'path';

import { _activate, _deactivate } from "./extension.common";

let lspClient: LanguageClient;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "betonquest" is now active!'
  // );

  // Register LSP client, node environment
  const lspServerModule = vscode.Uri.joinPath(context.extensionUri, 'server/dist/server.node.js').toString();
  const lspClientOptions: LanguageClientOptions = {
    documentSelector: [{ language: 'yaml' }],
    synchronize: {},
    initializationOptions: {}
  };
  const lspServerOptions: ServerOptions = {
    run: {
      module: lspServerModule,
      transport: TransportKind.ipc
    },
    debug: {
      module: lspServerModule,
      transport: TransportKind.ipc
    }
  };
  lspClient = new LanguageClient('BetonQuest Language Server', lspServerOptions, lspClientOptions);
  lspClient.start().then(() => {
    console.log('lsp-web-extension-sample server is ready');
  });
  context.subscriptions.push({
    dispose: () => {
      lspClient.stop();
      lspClient.dispose();
    }
  });

  // Execute rest of the activation steps
  _activate(context);
}

// This method is called when your extension is deactivated
export function deactivate () {
  return _deactivate();
}