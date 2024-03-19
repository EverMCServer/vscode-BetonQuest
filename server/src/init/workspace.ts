import { Connection, DiagnosticSeverity, ResponseError, WorkspaceFolder } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { FileTreeParams, FilesResponse } from "betonquest-utils/lsp/file";

import { AST } from "../ast/ast";

export function syncWorkspaces(connection: Connection, workspaceFolders: WorkspaceFolder[] | null | undefined) {
  // 1. get folders
  workspaceFolders?.forEach(async wsFolder => {
    try {
      // Get file tree
      let a = await connection.sendRequest<string[]>('custom/file/tree', {
        uriString: wsFolder.uri, //  + "/2.0"
        recursive: true,
        pattern: "\.ya?ml$"
      } as FileTreeParams);
      // connection.console.log("file tree:\n" + a.join("\n"));

      // Get files
      let files = await connection.sendRequest<FilesResponse>('custom/files', a);
      // files.forEach(([uri, content]) => {
      //   connection.console.log("file: " + uri + " size: " + content.length + " content: " + content);
      // });
      const ast = new AST(files);
      console.log("AST created:", ast);

      // DEBUG: Test diagnostics
      const doc = TextDocument.create(files[0][0], 'yaml', 1, files[0][1]);
      connection.sendDiagnostics({
        uri: files[0][0],
        diagnostics: [{
          code: "BQ-001",
          severity: DiagnosticSeverity.Error,
          range: {
            start: doc.positionAt(1),
            end: doc.positionAt(2)
          },
          message: `Dummy error.`,
          source: 'BetonQuest'
        }]
      });

      // connection.sendRequest<string>('custom/file', workspaceFolders![0].uri + "/config.yml").then(
      //   content => {
      //     connection.console.log("response from " + workspaceFolders![0].uri + "/config.yml" + ": " + content);
      //   },
      //   (reason: ResponseError<string>) => {
      //     if (reason.code === 404) {
      //       // TODO: remove from AST
      //     } else {
      //       connection.console.log("request failed: " + [reason.code, reason.data, reason.message].join("\n"));
      //     }
      //   }
      // );
    } catch (e) {
      if (e instanceof ResponseError) {
        connection.console.log("request file tree failed: " + e);
      }
    };
    // 2. compare folders, which one is removed / new?
    // 3. drop / create new AST
  });
}
