// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { LanguageClient } from 'vscode-languageclient/browser';

import { lspClientOptions } from "./lsp/options";
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
  const lspServerModule = vscode.Uri.joinPath(context.extensionUri, 'server/dist/server.web.js').toString();
  const lspWorker = new Worker(lspServerModule);
  lspClient = new LanguageClient('betonquest', 'BetonQuest Language Server', lspClientOptions, lspWorker);

  // Execute rest of the activation steps
  await _activate(context, lspClient);
}

// This method is called when your extension is deactivated
export function deactivate () {
  return _deactivate();
}
