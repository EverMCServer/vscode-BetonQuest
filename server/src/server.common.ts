import { FileType } from 'vscode';
import { Connection, DidChangeConfigurationNotification, InitializeParams, InitializeResult, ResponseError, TextDocumentSyncKind, TextDocuments, WorkspaceFolder } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { syncWorkspaces } from './init/workspace';

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

let workspaceFolders: WorkspaceFolder[] | null | undefined;

export function server(connection: Connection): void {

  connection.onInitialize((params: InitializeParams) => {
    workspaceFolders = params.workspaceFolders;
    let capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(
      capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
      capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
      capabilities.textDocument &&
      capabilities.textDocument.publishDiagnostics &&
      capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
      capabilities: {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        // // Tell the client that this server supports code completion.
        // completionProvider: {
        //   resolveProvider: true
        // }
      }
    };
    if (hasWorkspaceFolderCapability) {
      result.capabilities.workspace = {
        workspaceFolders: {
          supported: true
        }
      };
    }
    return result;
  });

  connection.onInitialized(params => {
    if (hasConfigurationCapability) {
      // Register for all configuration changes.
      connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
      connection.workspace.onDidChangeWorkspaceFolders(_event => {
        connection.console.log('Workspace folder change event received.');
        connection.workspace.getWorkspaceFolders().then(folders => {
          workspaceFolders = folders;
          connection.console.log('WorkspaceFolders: ' + workspaceFolders?.map(e => e.name + ":" + e.uri).concat(" "));
          syncWorkspaces(connection, workspaceFolders);
          // // DEBUG get file
          // connection.sendRequest('custom/file', workspaceFolders![0].uri+"/asdf");
        });
      });
    }

    connection.console.log("BetonQuest Language Server 1.0.\nWorkspaceFolders: " + workspaceFolders?.map(e => e.name + ":" + e.uri).concat(" "));

    // TODO: Construct the initial BetonQuest AST
    // 1. iterate workspace folders
    // 2. request all files from client, through message channel
    // 3. construct the AST for each folder
    // ...
    //
    syncWorkspaces(connection, workspaceFolders);
  });

  // Listen to file changed event outside VSCode.
  // Right now it only works on node environment (not browser).
  // It requires `synchronize.fileEvents: vscode.workspace.createFileSystemWatcher('glob patten')` registration in the client.
  connection.onDidChangeWatchedFiles((params) => {
    connection.console.log("connection.onDidChangeWatchedFiles: " + params.changes.map(e => e.type + ":" + e.uri).join(" "));
  });

  // connection.onDidChangeTextDocument((params) => {
  //   connection.console.log("connection.onDidChangeTextDocument: " + params.contentChanges.map(e => e.text).join(" "));
  // });

  // Listen to file editing on VSCode.
  documents.onDidChangeContent(e => {
    connection.console.log("document " + e.document.uri + " changed. version:" + e.document.version);
    // TODO: update the AST

    connection.sendNotification("custom/filetree", e.document.uri);
  });

  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  connection.listen();

};
