// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions } from 'vscode-languageclient/browser';

import { _activate, _deactivate } from "./extension.common";

let lspClient: LanguageClient;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "betonquest" is now active!'
  // );

  // Register LSP client, node environment
  // TODO

  // Register LSP client, web environment
  const lspClientOptions: LanguageClientOptions = {
    documentSelector: [{ language: 'yaml' }],
    synchronize: {},
    initializationOptions: {}
  };
  const lspServerModule = vscode.Uri.joinPath(context.extensionUri, 'server/dist/server.web.js').toString();
  const lspWorker = new Worker(lspServerModule);
  lspClient = new LanguageClient('betonquest', 'BetonQuest Language Server', lspClientOptions, lspWorker);
  await lspClient.start().then(() => {
    lspClient.onNotification('custom/filetree', (tree: string) => {
      console.log('BQLS: filetree:', tree);
    });
    // lspClient.sendNotification('custom/filetree');
    console.log('BQLS: betonquest-server is ready');
  }).catch(reason => {
    console.error('BQLS: betonquest-server failed to start', reason);
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
