// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ConversationEditorProvider } from "./conversationEditorProvider";
import { EventsEditorProvider } from "./eventsEditorProvider";
import { ExampleEditorProvider } from './exampleEditorProvider';
import { setLocale } from "./i18n/i18n";
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "betonquest" is now active!'
  // );

  // Check if the custom editor's buttons should be shown.
  function checkCanActivateEditor(document: vscode.TextDocument) {
    // Show Conversation Editor activation button only when it is appropriate
    if (document.fileName.match(/\/conversations\/.+\.ya?ml$/g)) {
      const dir = path.resolve(path.dirname(document.fileName), "..");

      // Check for main.yml
      const mainFile = path.join(dir, 'main.yml');
      const mainExists = fs.existsSync(mainFile);

      // Set the context variable based on the result
      vscode.commands.executeCommand('setContext', 'canActivateConversationEditor', mainExists);
    }

    // Show Events, Conditions, Objectives, Items Editor activation button only when it is appropriate
    if (
      document.fileName.match(/\/events.ya?ml$/) ||
      document.fileName.match(/\/conditions.ya?ml$/) ||
      document.fileName.match(/\/objectives.ya?ml$/) ||
      document.fileName.match(/\/items.ya?ml$/)
      ) {
      const dir = path.dirname(document.fileName);

      // Check for main.yml
      const mainFile = path.join(dir, 'main.yml');
      const mainExists = fs.existsSync(mainFile);

      // Check for conversations folder
      const conversationsDir = path.join(dir, 'conversations');
      const conversationsExists = fs.existsSync(conversationsDir) && fs.statSync(conversationsDir).isDirectory();

      // Set the context variable based on the result
      vscode.commands.executeCommand('setContext', 'canActivateEventsEditor', mainExists && conversationsExists);
    }
  }
  // Iterate all opened documents on start-up.
  for (const document of vscode.workspace.textDocuments) {
    checkCanActivateEditor(document);
  }
  // Listen for future opened documents.
  vscode.workspace.onDidOpenTextDocument(async (e) => checkCanActivateEditor(e));

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

  // Command to open the Events Editor
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'betonquest.openEventsEditor',
      async () => {

        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
            return; // No active editor
        }

        await vscode.commands.executeCommand('vscode.openWith', activeTextEditor.document.uri, 'betonquest.eventsEditor', vscode.ViewColumn.Beside);
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
  context.subscriptions.push(EventsEditorProvider.register(context));
  context.subscriptions.push(ExampleEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {}
