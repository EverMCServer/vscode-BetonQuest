import { Connection, Position, Range, ResponseError, WorkspaceFolder } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { FileTreeParams, FilesResponse } from "betonquest-utils/lsp/file";

// All Documents by workspace
export class AllDocuments {
  private allDocuments: [wsUri: string, documents?: TextDocument[]][] = [];

  constructor(allDocuments: [wsUri: string, documents?: TextDocument[]][]) {
    this.allDocuments = allDocuments;
  }

  getAllDocuments() {
    return this.allDocuments;
  }

  insertDocument(uri: string, content: string) {
    this.allDocuments.forEach(([wsFolderUri, documents]) => {
      if (uri.startsWith(wsFolderUri)) {
        const doc: TextDocument = TextDocument.create(uri, 'yaml', 0, content);
        const i = documents?.findIndex((d) => d.uri === uri);
        if (i && i > -1) {
          documents![i] = doc;
          return;
        }
        documents?.push(doc);
      }
    });
  }

  updateDocument(document: TextDocument) {
    this.allDocuments
      .filter(([wsFolderUri, docs]) => document.uri.startsWith(wsFolderUri) && docs)
      .forEach(([_, docs]) => {
        let i: number;
        if ((i = docs!.findIndex((doc) => doc.uri === document.uri)) > -1) {
          // Update
          docs![i] = document;
        } else {
          // Create
          docs!.push(document);
        }
      });
  }

  updateDocumentContent(uri: string, content: string) {
    this.allDocuments.forEach(([wsFolderUri, documents]) => {
      if (uri.startsWith(wsFolderUri)) {
        documents?.forEach((document, i) => {
          if (document.uri === uri) {
            documents[i] = TextDocument.create(uri, 'yaml', document.version, content);
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
      return [wsFolderUri, documents?.filter((d) => d.uri !== uri)];
    });
  }

  getOffsetByPosition(uri: string, position: Position) {
    return this.allDocuments.
      find(([u]) => uri.startsWith(u))?.[1]?.
      find((d) => d.uri === uri)?.
      offsetAt(position) ?? 0;
  }

  getOffsetByRange(uri: string, range: Range) {
    const doc = this.allDocuments.
      find(([u]) => uri.startsWith(u))?.[1]?.
      find((d) => d.uri === uri);

    if (doc) {
      const start = doc.offsetAt(range.start);
      const end = doc.offsetAt(range.end);
      return [start, end];
    }
    return [0, 0];
  }

  getPositionByOffset(uri: string, offset: number) {
    const doc = this.allDocuments.
      find(([u]) => uri.startsWith(u))?.[1]?.
      find((d) => d.uri === uri);

    if (doc) {
      return doc.positionAt(offset);
    }
    return Position.create(0, 0);
  }

  getRangeByOffsets(uri: string, range: [start: number, end: number]) {
    const [start, end] = range;
    const doc = this.allDocuments.
      find(([u]) => uri.startsWith(u))?.[1]?.
      find((d) => d.uri === uri);

    if (doc) {
      const s = doc.positionAt(start);
      const e = doc.positionAt(end);
      return Range.create(s.line, s.character, e.line, e.character);
    }
    return Range.create(0, 0, 0, 0);
  }
}

export async function getAllDocuments(connection: Connection, workspaceFolders: WorkspaceFolder[] | null | undefined) {
  let allDocs: [string, TextDocument[]?][] = [];

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
      const documents: TextDocument[] = files.map(([uri, content]) => {
        // connection.console.log("file: " + uri + " size: " + content.length + " content: " + content);
        return TextDocument.create(uri, 'yaml', 0, content);
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
