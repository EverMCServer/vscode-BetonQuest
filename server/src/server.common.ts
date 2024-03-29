import { CodeAction, CodeActionKind, Command, Connection, DidChangeConfigurationNotification, FileChangeType, FileEvent, HandlerResult, InitializeParams, InitializeResult, ResponseError, TextDocumentSyncKind, TextDocuments, WorkspaceFolder } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FilesResponse } from 'betonquest-utils/lsp/file';
import { getAllDocuments } from './utils/document';
import { TextDocumentsArray } from './utils/types';
import { AST } from './ast/ast';

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

let workspaceFolders: WorkspaceFolder[] | null | undefined;

export function server(connection: Connection): void {

  let allDocuments: [string, TextDocumentsArray?][] = [];
  let asts: [string, AST?][] = [];

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
        // Tell the client that this server supports code actions.
        // codeActionProvider: true
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

  connection.onInitialized(async params => {
    if (hasConfigurationCapability) {
      // Register for all configuration changes.
      connection.client.register(DidChangeConfigurationNotification.type, undefined);
    }

    connection.console.log("BetonQuest Language Server 1.0.\nWorkspaceFolders: " + workspaceFolders?.map(e => e.name + ":" + e.uri).concat(" "));

    if (hasWorkspaceFolderCapability) {
      // Listen on Workspace folder change event
      connection.workspace.onDidChangeWorkspaceFolders(_event => {
        connection.console.log('Workspace folder change event received.');
        connection.workspace.getWorkspaceFolders().then(async folders => {
          // Update ASTs
          workspaceFolders = folders;
          connection.console.log('WorkspaceFolders: ' + workspaceFolders?.map(e => e.name + ":" + e.uri).concat(" "));
          allDocuments = await getAllDocuments(connection, workspaceFolders);
          asts = allDocuments.map<[string, AST?]>(([wsFolderUri, documents]) => [wsFolderUri, documents ? new AST(documents) : undefined]);
          // Send Diagnostics
          asts.forEach(([_, ast]) => ast?.getDiagnostics().forEach(diag => connection.sendDiagnostics(diag)));
        });
      });
    }
    // Construct the initial BetonQuest AST
    // 1. iterate workspace folders
    // 2. request all files from client, through message channel
    // 3. construct the AST for each folder
    allDocuments = await getAllDocuments(connection, workspaceFolders);
    asts = allDocuments.map<[string, AST?]>(([wsFolderUri, documents]) => [wsFolderUri, documents ? new AST(documents) : undefined]);
    // Send Diagnostics
    asts.forEach(([_, ast]) => ast?.getDiagnostics().forEach(diag => connection.sendDiagnostics(diag)));
  });

  // Listen to file changed event outside VSCode.
  // Right now it only works on node environment (not browser).
  // It requires `synchronize.fileEvents: vscode.workspace.createFileSystemWatcher('glob pattern')` registration in the client.
  connection.onDidChangeWatchedFiles(async (params) => {
    connection.console.log("connection.onDidChangeWatchedFiles: " + params.changes.map(e => e.type + ":" + e.uri).join(" "));

    // const changes = await Promise.all(params.changes.map<Promise<[FileEvent, string]>>(async change => {
    //   // Get files uri
    //   // return [change, (await connection.sendRequest<FilesResponse>('custom/files', [change.uri]))[0][1]];
    // }));

    // Update allDocuments file tree
    // Get changed files content
    const fileResponse = await connection.sendRequest<FilesResponse>('custom/files', params.changes.map(change => change.uri));
    params.changes.forEach(change => {
      // Update allDocuments file tree
      if (change.type === FileChangeType.Created || change.type === FileChangeType.Changed) {
        const content = fileResponse.find(([uri]) => uri === change.uri)?.[1];
        if (content) {
          if (change.type === FileChangeType.Created) {
            // Create document content
            allDocuments.forEach(([wsFolderUri, documents]) => {
              if (change.uri.startsWith(wsFolderUri)) {
                const entry: [string, TextDocument] = [change.uri, TextDocument.create(change.uri, 'yaml', 0, content!)];
                const i = documents?.findIndex(([uri]) => uri === change.uri);
                if (i && i > -1) {
                  documents![i] = entry;
                  return;
                }
                documents?.push(entry);
              }
            });
          } else if (change.type === FileChangeType.Changed) {
            // Search and replace document's content
            allDocuments.forEach(([wsFolderUri, documents]) => {
              if (change.uri.startsWith(wsFolderUri)) {
                documents?.forEach(([uri, document], i) => {
                  if (uri === change.uri) {
                    documents[i] = [change.uri, TextDocument.create(change.uri, 'yaml', document.version, content!)];
                  }
                });
              }
            });
          }
        }
      } else if (change.type === FileChangeType.Deleted) {
        // Remove document from allDocuments file tree
        allDocuments = allDocuments.map(([wsFolderUri, documents]) => {
          if (!change.uri.startsWith(wsFolderUri)) {
            return [wsFolderUri, documents];
          }
          return [wsFolderUri, documents?.filter(([uri]) => uri !== change.uri)];
        });
      }
    });

    // Update AST
    asts = allDocuments.map<[string, AST?]>(([wsFolderUri, documents]) => [wsFolderUri, documents ? new AST(documents) : undefined]);
    // Send Diagnostics
    asts.forEach(([_, ast]) => ast?.getDiagnostics().forEach(diag => connection.sendDiagnostics(diag)));

  });

  // connection.onDidChangeTextDocument((params) => {
  //   connection.console.log("connection.onDidChangeTextDocument: " + params.contentChanges.map(e => e.text).join(" "));
  // });

  // Listen to file editing on VSCode.
  documents.onDidChangeContent(e => {
    connection.console.log("document " + e.document.uri + " changed. version:" + e.document.version);
    // TODO: only update the changed file
    // 1. Update the changed document on allDocuments cache
    allDocuments.filter(([wsFolderUri, docs]) => e.document.uri.startsWith(wsFolderUri) && docs).forEach(([_, docs]) => {
      let doc: [string, TextDocument] | undefined;
      if ((doc = docs!.find(([uri]) => uri === e.document.uri)) !== undefined) {
        // Update
        doc[1] = e.document;
      } else {
        // Create
        docs!.push([e.document.uri, e.document]);
      }
    });
    // 2. Update the AST
    asts = allDocuments.map<[string, AST?]>(([wsFolderUri, documents]) => [wsFolderUri, documents ? new AST(documents) : undefined]);
    // Send Diagnostics
    asts.forEach(([_, ast]) => ast?.getDiagnostics().forEach(diag => connection.sendDiagnostics(diag)));
  });

  // Listen to actions, e.g. quick fixes
  connection.onCodeAction(params => {
    const diagnostic = params.context.diagnostics[0];
    let a: HandlerResult<(Command | CodeAction)[] | null | undefined, void> = [];
    if (diagnostic.code === "BQ-001") {
      a.push(
        {
          title: "My Quick Fix",
          kind: CodeActionKind.QuickFix,
          diagnostics: [diagnostic],
          // The edits this action performs.
          edit: {
            documentChanges: [
              {
                textDocument: {
                  ...params.textDocument,
                  version: 1
                },
                // The range this change applies to.
                edits: [
                  {
                    range: diagnostic.range,
                    newText: "aaa"
                  }
                ]
              }
            ]
          },
        }
      );
    }
    return a;
  });

  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  connection.listen();

};
