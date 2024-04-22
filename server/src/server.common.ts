import { CodeAction, CodeActionKind, Command, Connection, DidChangeConfigurationNotification, FileChangeType, HandlerResult, InitializeParams, InitializeResult, SemanticTokensParams, SemanticTokensRequest, TextDocumentSyncKind, TextDocuments, WorkspaceFolder } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FilesResponse, LocationsParams } from 'betonquest-utils/lsp/file';
import { AllDocuments, getAllDocuments } from './utils/document';
import { ASTs } from './ast/ast';
import { legend } from './semantics/legend';
import { semanticTokensHandler } from './service/semanticTokens';
import { hoverHandler } from './service/hover';
import { locationsHandler } from './service/locations';

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

let workspaceFolders: WorkspaceFolder[] | null | undefined;

export function server(connection: Connection): void {

  let allDocuments: AllDocuments = new AllDocuments([]); // Document Tree
  let asts: ASTs = new ASTs(allDocuments); // All AST by workspace folders

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
        // codeActionProvider: true,

        // Tell the client that this server support hover.
        hoverProvider: true,

        // Tell the client that this server provides semantic tokens
        semanticTokensProvider: {
          full: true,
          legend: legend
        }
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
          asts.updateDocuments(allDocuments);
          // Send Diagnostics
          asts.getDiagnostics().forEach(diag => connection.sendDiagnostics(diag));
        });
      });
    }
    // Construct the initial BetonQuest AST
    // 1. iterate workspace folders
    // 2. request all files from client, through message channel
    // 3. construct the AST for each folder
    allDocuments = await getAllDocuments(connection, workspaceFolders);
    asts.updateDocuments(allDocuments);
    // Send Diagnostics
    asts.getDiagnostics().forEach(diag => connection.sendDiagnostics(diag));
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
            // Create new document on the document list
            allDocuments.insertDocument(change.uri, content);
          } else if (change.type === FileChangeType.Changed) {
            // Search and replace document's content
            allDocuments.updateDocumentContent(change.uri, content);
          }
        }
      } else if (change.type === FileChangeType.Deleted) {
        // Remove document from allDocuments file tree
        allDocuments.removeDocument(change.uri);
      }
    });

    // Update AST
    asts.updateDocuments(allDocuments);
    // Send Diagnostics
    asts.getDiagnostics().forEach(diag => connection.sendDiagnostics(diag));

  });

  // connection.onDidChangeTextDocument((params) => {
  //   connection.console.log("connection.onDidChangeTextDocument: " + params.contentChanges.map(e => e.text).join(" "));
  // });

  // Listen to file editing on VSCode.
  documents.onDidChangeContent(e => {
    connection.console.log("document " + e.document.uri + " changed. version:" + e.document.version);
    // TODO: only update the changed file
    // 1. Update the changed document on allDocuments cache
    allDocuments.updateDocument(e.document);
    // 2. Update the AST
    asts.updateDocuments(allDocuments);
    // Send Diagnostics
    asts.getDiagnostics().forEach(diag => connection.sendDiagnostics(diag));
  });

  // Listen on semantic tokens requests
  // Provide semantic tokens dynamically
  connection.onRequest(SemanticTokensRequest.type, (params: SemanticTokensParams) => {
    return semanticTokensHandler(allDocuments, asts, params);
  });

  // Listen on Hover event
  connection.onHover((params, token, workDoneProgress, resultProgress) => {
    return hoverHandler(allDocuments, asts, params, token, workDoneProgress, resultProgress);
  });

  // Listen to actions, e.g. quick fixes
  connection.onCodeAction(params => {
    const a: HandlerResult<(Command | CodeAction)[] | null | undefined, void> = [];
    params.context.diagnostics.forEach(d => {
      // TODO
    });
    // const diagnostic = params.context.diagnostics[0];
    // if (diagnostic.code === "BQ-001") {
    //   a.push(
    //     {
    //       title: "My Quick Fix",
    //       kind: CodeActionKind.QuickFix,
    //       diagnostics: [diagnostic],
    //       // The edits this action performs.
    //       edit: {
    //         documentChanges: [
    //           {
    //             textDocument: {
    //               ...params.textDocument,
    //               version: 1
    //             },
    //             // The range this change applies to.
    //             edits: [
    //               {
    //                 range: diagnostic.range,
    //                 newText: "aaa"
    //               }
    //             ]
    //           }
    //         ]
    //       },
    //     }
    //   );
    // }
    return a;
  });

  // Register custom handlers
  connection.onRequest("custom/locations", (params: LocationsParams) => {
    return locationsHandler(allDocuments, asts, params);
  });

  // Make the text document manager listen on the connection
  // for open, change and close text document events
  documents.listen(connection);

  // Listen on the connection
  connection.listen();

};
