import { CodeAction, Command, Connection, DidChangeConfigurationNotification, FileChangeType, HandlerResult, InitializeParams, InitializeResult, SemanticTokensParams, SemanticTokensRequest, TextDocumentSyncKind, TextDocuments, WorkspaceFolder } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

import { setLocale } from 'betonquest-utils/i18n/i18n';
import { FilesResponse, LocationsParams } from 'betonquest-utils/lsp/file';

import { ASTs } from './ast/ast';
import { legend } from './semantics/legend';
import { hoverHandler } from './service/hover';
import { locationsHandler } from './service/locations';
import { semanticTokensHandler } from './service/semanticTokens';
import { AllDocuments, getAllDocuments } from './utils/document';

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

    // Get client locale and set i18n
    setLocale(params.locale ?? 'en');

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
        codeActionProvider: true,

        // Tell the client that this server support hover.
        hoverProvider: true,

        // Tell the client that this server provides semantic tokens.
        semanticTokensProvider: {
          full: true,
          legend: legend
        },

        // Tell the client that this server provides definitions searching.
        definitionProvider: true,

        // Tell the client that this server provides references searching.
        referencesProvider: true,

        // Tell the client that this server provides code completion.
        completionProvider: {
          triggerCharacters: [" ", ",", ":", ".", "\"", "'", "\n"],
          // resolveProvider: true,
          // completionItem: {
          //   labelDetailsSupport: true
          // }
        },
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
    // connection.console.log("connection.onDidChangeWatchedFiles: " + params.changes.map(e => e.type + ":" + e.uri).join(" "));

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
    // connection.console.log("document " + e.document.uri + " changed. version:" + e.document.version);
    // TODO: only update the changed file
    // 1. Update the changed document on allDocuments cache
    allDocuments.updateDocument(e.document);
    // 2. Update the AST
    asts.updateDocuments(allDocuments);
    // Send Diagnostics
    asts.getDiagnostics(e.document.uri).forEach(diag => connection.sendDiagnostics(diag));
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
      a.push(
        ...asts.getCodeActions(params.textDocument.uri)
          .filter(c =>
            c.diagnostics?.some(d2 =>
              d2.code === d.code
              && d2.message === d.message
              && d2.range.start.line === d.range.start.line
              && d2.range.start.character === d.range.start.character
              && d2.range.end.line === d.range.end.line
              && d2.range.end.character === d.range.end.character
            )
          )
      );
    });
    return a;
  });

  // Listen on Definitions requests
  connection.onDefinition((params, token, workDoneProgress, resultProgress) => {
    const position = allDocuments.getOffsetByPosition(params.textDocument.uri, params.position);
    return asts.getDefinitions(position, params.textDocument.uri).map(l => ({
      originSelectionRange: l.originSelectionRange ? allDocuments.getRangeByOffsets(params.textDocument.uri, l.originSelectionRange) : undefined,
      targetUri: l.targetUri,
      targetRange: allDocuments.getRangeByOffsets(l.targetUri, l.targetRange),
      targetSelectionRange: allDocuments.getRangeByOffsets(l.targetUri, l.targetSelectionRange),
    }));
  });

  // Listen on References requests
  connection.onReferences((params, token, workDoneProgress, resultProgress) => {
    const position = allDocuments.getOffsetByPosition(params.textDocument.uri, params.position);
    return asts.getReferences(position, params.textDocument.uri).map(l => ({
      uri: l.targetUri,
      range: allDocuments.getRangeByOffsets(l.targetUri, l.targetRange)
    }));
  });

  // Listen on Completion requests
  connection.onCompletion((params, token, workDoneProgress, resultProgress) => {
    // return {
    //   isIncomplete: true,
    //   items: [
    //     {
    //       label: "class",
    //       kind: CompletionItemKind.Class,
    //       data: 1,
    //     }
    //   ]
    // };
    // console.log("Completion triggered:", params);
    // params.context?.triggerKind
    // params.context?.triggerCharacter
    // params.partialResultToken
    // params.position
    // params.textDocument
    // params.workDoneToken
    // return [
    //   {
    //     // insertText: "Class",
    //     label: "class",
    //     kind: CompletionItemKind.Class,
    //     data: 1,
    //     range: ""
    //   }
    // ];
    const position = allDocuments.getOffsetByPosition(params.textDocument.uri, params.position);
    return asts.getCompletions(position, params.textDocument.uri);
  });

  // // This handler resolves additional information for the item selected in
  // // the completion list.
  // connection.onCompletionResolve(
  //   (item: CompletionItem): CompletionItem => {
  //     if (item.data === 1) {
  //       item.detail = 'BetonQuest details';
  //       item.documentation = 'BetonQuest documentation';
  //     } else if (item.data === 2) {
  //       item.detail = 'JavaScript details';
  //       item.documentation = 'JavaScript documentation';
  //     }
  //     return item;
  //   }
  // );

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
