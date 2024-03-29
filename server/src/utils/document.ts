import { Connection, ResponseError, WorkspaceFolder } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { FileTreeParams, FilesResponse } from "betonquest-utils/lsp/file";

import { TextDocumentsArray } from "./types";

// All Documents by workspace
export class AllDocuments {
  private allDocuments: [string, TextDocumentsArray?][] = [];

  constructor(allDocuments: [string, TextDocumentsArray?][]) {
    this.allDocuments = allDocuments;
  }

  getAllDocuments() {
    return this.allDocuments;
  }

  insertDocument(uri: string, content: string) {
    this.allDocuments.forEach(([wsFolderUri, documents]) => {
      if (uri.startsWith(wsFolderUri)) {
        const entry: [string, TextDocument] = [uri, TextDocument.create(uri, 'yaml', 0, content)];
        const i = documents?.findIndex(([u]) => u === uri);
        if (i && i > -1) {
          documents![i] = entry;
          return;
        }
        documents?.push(entry);
      }
    });
  }

  updateDocument(document: TextDocument) {
    this.allDocuments
      .filter(([wsFolderUri, docs]) => document.uri.startsWith(wsFolderUri) && docs)
      .forEach(([_, docs]) => {
        let doc: [string, TextDocument] | undefined;
        if ((doc = docs!.find(([uri]) => uri === document.uri)) !== undefined) {
          // Update
          doc[1] = document;
        } else {
          // Create
          docs!.push([document.uri, document]);
        }
      });
  }

  updateDocumentContent(uri: string, content: string) {
    this.allDocuments.forEach(([wsFolderUri, documents]) => {
      if (uri.startsWith(wsFolderUri)) {
        documents?.forEach(([u, document], i) => {
          if (u === uri) {
            documents[i] = [uri, TextDocument.create(uri, 'yaml', document.version, content)];
          }
        });
      }
    });
  }

  removeDocument(uri: string) {
    this.allDocuments = this.allDocuments.map(([wsFolderUri, documents]) => {
      if (!uri.startsWith(wsFolderUri)) {
        return [wsFolderUri, documents];
      }
      return [wsFolderUri, documents?.filter(([u]) => u !== uri)];
    });
  }
}

export async function getAllDocuments(connection: Connection, workspaceFolders: WorkspaceFolder[] | null | undefined) {
  let allDocs: [string, TextDocumentsArray?][] = [];

  // Obtain docuemtns from client
  allDocs = await Promise.all(workspaceFolders!.flatMap(async wsFolder => {
    try {
      // Get file tree
      let a = await connection.sendRequest<string[]>('custom/file/tree', {
        uriString: wsFolder.uri,
        recursive: true,
        pattern: "\.yml$" // != \.ya?ml$ BQ does not support .yaml ext
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

  return new AllDocuments(allDocs);
}
