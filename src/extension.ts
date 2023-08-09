// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ConversationEditorProvider } from "./conversationEditorProvider";
// import { ExampleEditorProvider } from './exampleEditorProvider';
import { setLocale } from "./i18n/i18n";
import { ExampleEditorProvider } from "./exampleEditorProvider";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "betonquest" is now active!'
  // );

  // Command to open the Conversation Editor
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'betonquest.openConversationEditor',
      async () => {

        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return; // No active editor
        }

        await vscode.commands.executeCommand('vscode.openWith', activeTextEditor.document.uri, 'betonquest.conversationEditor', vscode.ViewColumn.Beside);
      }
    )
  );

  // Command to open the Example Editor (for development reference only)
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'betonquest.openExampleEditor',
      async () => {

        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return; // No active editor
        }

        await vscode.commands.executeCommand('vscode.openWith', activeTextEditor.document.uri, 'betonquest.exampleEditor', vscode.ViewColumn.Beside);
      }
    )
  );

  // Initialize i18n localization
  setLocale(vscode.env.language);

  // Register custom editor
  context.subscriptions.push(ConversationEditorProvider.register(context));
  context.subscriptions.push(ExampleEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}
