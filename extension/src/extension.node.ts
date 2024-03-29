// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';
import * as path from 'path';

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
  const lspServerModule = context.asAbsolutePath(path.join('server', 'dist', 'server.node.js'));
  const lspServerOptions: ServerOptions = {
    run: {
      module: lspServerModule,
      transport: TransportKind.ipc
    },
    debug: {
      module: lspServerModule,
      transport: TransportKind.ipc,
      options: {
        execArgv: ['--nolazy', '--inspect=6008']
      }
    }
  };
  lspClient = new LanguageClient('BetonQuest Language Server', lspServerOptions, lspClientOptions);

  // Execute rest of the activation steps
  await _activate(context, lspClient);
}

// This method is called when your extension is deactivated
export function deactivate () {
  return _deactivate();
}
