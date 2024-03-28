import { Connection, ResponseError, WorkspaceFolder } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { FileTreeParams, FilesResponse } from "betonquest-utils/lsp/file";

import { TextDocumentsArray } from "./types";

export async function getAllDocuments(connection: Connection, workspaceFolders: WorkspaceFolder[] | null | undefined) {
  var allDocs: [string, TextDocumentsArray?][] = [];

  // 1. get folders
  allDocs = await Promise.all(workspaceFolders!.flatMap(async wsFolder => {
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

      // Convert files into documents
      const documents: TextDocumentsArray = files.map(([uri, content]) => {
        // connection.console.log("file: " + uri + " size: " + content.length + " content: " + content);
        return [uri, TextDocument.create(uri, 'yaml', 0, content)];
      });

      return [wsFolder.uri, documents];
    } catch (e) {
      if (e instanceof ResponseError) {
        connection.console.log("request file tree failed: " + e);
      }
    };
    return [wsFolder.uri, undefined];
  }));

  return allDocs;
}
