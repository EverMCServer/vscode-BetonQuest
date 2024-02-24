import * as vscode from "vscode";
import { LanguageClientOptions } from "vscode-languageclient";


export const lspClientOptions: LanguageClientOptions = {
  documentSelector: [{ language: 'yaml' }],
  synchronize: {
    fileEvents: [
      vscode.workspace.createFileSystemWatcher('**/*.yml'),
      vscode.workspace.createFileSystemWatcher('**/*.yaml')
    ]
  },
  initializationOptions: {}
};