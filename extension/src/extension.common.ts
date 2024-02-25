// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from 'path';
import { BaseLanguageClient } from 'vscode-languageclient/lib/common/client';

import { ConversationEditorProvider } from "./conversationEditorProvider";
import { EventsEditorProvider } from "./eventsEditorProvider";
import { ConditionsEditorProvider } from "./conditionsEditorProvider";
import { ObjectivesEditorProvider } from "./objectivesEditorProvider";
import { PackageEditorProvider } from "./packageEditorProvider";
import { ResponseError } from "vscode-languageclient";
// import { ExampleEditorProvider } from './exampleEditorProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function _activate(context: vscode.ExtensionContext, lspClient: BaseLanguageClient) {
  // Register Language Client and methods
  await lspClient.start().then(() => setTimeout(() => {
    lspClient.onNotification('custom/file/tree', (tree: string) => {
      console.log('BQLS: filetree:', tree);
    });

    // TODO
    // Send all files when requested
    lspClient.onNotification('custom/file/all', (workspace?: string) => {
      // Get workspace by name
      if (workspace) {
      }
      lspClient.sendNotification('custom/file/all', {});
    });
    // Send all files as initialization
    lspClient.sendNotification('custom/file/all', {});
    // let uri = (await vscode.workspace.findFiles("**/*"))[0];
    // let file = (await vscode.workspace.fs.readFile(uri));
    // file.toString();
    lspClient.onRequest('custom/file', async (uriString: string) => {
      let uri = vscode.Uri.parse(uriString);
      try {
        let file = (await vscode.workspace.fs.readFile(uri));
        return file;
      } catch (e) {
        console.log("BQLS: read file error: ", e);
        if (e instanceof vscode.FileSystemError) {
          switch (e.code) {
            case "FileNotFound":
              return new ResponseError(404, e.message, e.code);
            case "FileIsADirectory":
              return new ResponseError(400, e.message, e.code);
            case "NoPermissions":
              return new ResponseError(403, e.message, e.code);
            case "Unavailable":
              return new ResponseError(429, e.message, e.code);
            // case "FileExists":
            // case "FileNotADirectory":
            default:
              return new ResponseError(500, e.message, e.code);
          }
        }
      }
    });

    console.log('BQLS: ready');
  }, 0)).catch(reason => {
    console.error('BQLS: betonquest-server failed to start', reason);
  });
  context.subscriptions.push({
    dispose: () => {
      lspClient.stop();
      lspClient.dispose();
    }
  });

  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  // console.log(
  //   'Congratulations, your extension "betonquest" is now active!'
  // );

  // Check if the custom editor's buttons should be shown.
  function checkCanActivateEditor(editor: vscode.TextEditor) {
    // Set default value
    vscode.commands.executeCommand('setContext', 'canActivateConversationEditor', false);
    vscode.commands.executeCommand('setContext', 'canActivateEventsEditor', false);
    vscode.commands.executeCommand('setContext', 'canActivateConditionsEditor', false);
    vscode.commands.executeCommand('setContext', 'canActivateObjectivesEditor', false);
    vscode.commands.executeCommand('setContext', 'canActivatePackageEditor', false);

    // Show Conversation Editor activation button only when it is appropriate
    if (editor.document.fileName.match(/[\/\\]conversations[\/\\].+\.ya?ml$/gi)) {
      const dir = path.resolve(path.dirname(editor.document.fileName), "..");

      // Check for main.yml
      const mainFile = vscode.Uri.file(path.join(dir, 'main.yml'));
      checkIfFileExists(mainFile).then(mainExists => {
        if (mainExists) {
          // Set the context variable based on the result
          vscode.commands.executeCommand('setContext', 'canActivateConversationEditor', mainExists);
        }
      });
    }

    // Show Events, Conditions, Objectives, Items Editor activation button only when it is appropriate
    if (
      editor.document.fileName.match(/[\/\\]events\.ya?ml$/) ||
      editor.document.fileName.match(/[\/\\]conditions\.ya?ml$/) ||
      editor.document.fileName.match(/[\/\\]objectives\.ya?ml$/) ||
      editor.document.fileName.match(/[\/\\]items\.ya?ml$/)
    ) {
      const dir = path.dirname(editor.document.fileName);

      // Check for main.yml
      const mainFile = vscode.Uri.file(path.join(dir, 'main.yml'));
      checkIfFileExists(mainFile).then(mainExists => {
        if (mainExists) {
          // Set the context variable based on the result
          vscode.commands.executeCommand('setContext', 'canActivateEventsEditor', mainExists);
          vscode.commands.executeCommand('setContext', 'canActivateConditionsEditor', mainExists);
          vscode.commands.executeCommand('setContext', 'canActivateObjectivesEditor', mainExists);
        }
      });
    }

    // Show Package Editor activation button only when it is appropriate
    if (editor.document.fileName.match(/[^\/\\]+\.ya?ml$/gi)) {
      // Iterate all parents dir to find "package.yml"
      checkIfFileExistsInAllParents(path.dirname(editor.document.fileName), 'package.yml').then(packageExists => {
        // Set the context variable based on the result
        vscode.commands.executeCommand('setContext', 'canActivatePackageEditor', packageExists);
      });
    }
  }
  // Iterate all opened documents on start-up.
  for (const editor of vscode.window.visibleTextEditors) {
    checkCanActivateEditor(editor);
  }
  // Listen for future opened documents.
  vscode.window.onDidChangeActiveTextEditor(async (e) => { if (e) { checkCanActivateEditor(e); } });

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

  // Command to open the Conditions Editor
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'betonquest.openConditionsEditor',
      async () => {

        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
          return; // No active editor
        }

        await vscode.commands.executeCommand('vscode.openWith', activeTextEditor.document.uri, 'betonquest.conditionsEditor', vscode.ViewColumn.Beside);
      }
    )
  );

  // Command to open the Objectives Editor
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'betonquest.openObjectivesEditor',
      async () => {

        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
          return; // No active editor
        }

        await vscode.commands.executeCommand('vscode.openWith', activeTextEditor.document.uri, 'betonquest.objectivesEditor', vscode.ViewColumn.Beside);
      }
    )
  );

  // // Command to open the Example Editor (for development reference only)
  // context.subscriptions.push(
  //   vscode.commands.registerCommand(
  //     'betonquest.openExampleEditor',
  //     async () => {

  //       const activeTextEditor = vscode.window.activeTextEditor;
  //       if (!activeTextEditor) {
  //           return; // No active editor
  //       }

  //       await vscode.commands.executeCommand('vscode.openWith', activeTextEditor.document.uri, 'betonquest.exampleEditor', vscode.ViewColumn.Beside);
  //     }
  //   )
  // );

  // Command to open the Package Editor
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'betonquest.openPackageEditor',
      async () => {

        const activeTextEditor = vscode.window.activeTextEditor;
        if (!activeTextEditor) {
          return; // No active editor
        }

        await vscode.commands.executeCommand('vscode.openWith', activeTextEditor.document.uri, 'betonquest.packageEditor', vscode.ViewColumn.Beside);
      }
    )
  );

  // Register custom editor
  context.subscriptions.push(ConversationEditorProvider.register(context, lspClient));
  context.subscriptions.push(EventsEditorProvider.register(context, lspClient));
  context.subscriptions.push(ConditionsEditorProvider.register(context, lspClient));
  context.subscriptions.push(ObjectivesEditorProvider.register(context, lspClient));
  // context.subscriptions.push(ExampleEditorProvider.register(context, lspClient));
  context.subscriptions.push(PackageEditorProvider.register(context, lspClient));
}

async function checkIfFileExists(filePath: vscode.Uri): Promise<boolean> {
  try {
    await vscode.workspace.fs.stat(filePath);
    return true;
  } catch (error) {
    // If an error occurs, the file does not exist
    return false;
  }
}

function checkIfFileExistsInAllParents(filePath: string, fileName: string): Promise<boolean> {
  let d = filePath;

  return checkIfFileExists(vscode.Uri.file(path.join(d, fileName))).then(file => {
    if (file) {
      // Set the context variable based on the result
      return true;
    } else if (vscode.workspace.workspaceFolders?.find(base => {
      const u = base.uri.fsPath.toString();
      return u === d || u.length >= d.length;
    })) {
      // Break out recursion if all parent path are iterated
      return false;
    } else {
      // Check parent
      d = path.resolve(d, "..");
      return checkIfFileExistsInAllParents(d, fileName);
    }
  });
}

// This method is called when your extension is deactivated
export function _deactivate() { }
