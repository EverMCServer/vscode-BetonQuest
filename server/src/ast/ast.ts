import { Pair, Scalar } from "yaml";

import { Node, NodeType } from "./node";
import { FilesResponse } from "betonquest-utils/lsp/file";

// AST structure for BetonQuest V1
export class AST {
  startOffset?: number;
  endOffset?: number;
  children?: Node<NodeType>[];

  constructor() {
  }
}

export const parse = (wsFolderUri: string, allFiles: FilesResponse) => {
  const ast: AST = new AST();

  // Classify files by versions and packages
  // Rules:
  // - V2: package.yml https://betonquest.org/2.0/Documentation/Scripting/Packages-%26-Templates/#structure
  // - V1: main.yml https://betonquest.org/1.12/User-Documentation/Reference/#packages
  const filesV2 = new Map<string, FilesResponse>();
  const filesV1 = new Map<string, FilesResponse>();

  // Find all V2 packages
  allFiles.forEach(([uri, content]) => {
    const u = new URL(uri);
    const p = u.pathname.split('/');
    if (p[p.length - 1].match(/^package\.ya?ml$/i)) {
      // Create package's base path
      const b = new URL(uri);
      b.pathname = p.slice(0, p.length - 1).join('/');
      const baseUri = b.toString();
      // Cache the package's path with a entry file.
      filesV2.set(baseUri, [[uri, content]]);
    }
  });
  // Find all V1 packages
  allFiles.forEach(([uri, content]) => {
    const u = new URL(uri);
    const p = u.pathname.split('/');
    if (p[p.length - 1].match(/^main\.ya?ml$/i)) {
      // Create package's base path
      const b = new URL(uri);
      b.pathname = p.slice(0, p.length - 1).join('/');
      const baseUri = b.toString();
      // Skip if conflict.
      // 1. Avoid conflict with V2. Skip if this main.yml is nested in V2 package
      for (const path of filesV2.keys()) {
        if (uri.startsWith(path)) {
          return;
        }
      }
      // 2. We only take the most outer "main.yml" as the package
      for (const path of filesV1.keys()) {
        // Skip if parent uri already exists
        if (uri.startsWith(path)) {
          return;
        }
        // Replace if ther is a child uri nested in this package. We keep the most outer one.
        if (path.startsWith(baseUri)) {
          filesV1.delete(path);
        }
      }
      // Cache the package's path with a entry file.
      filesV1.set(baseUri, [[uri, content]]);
    }
  });

  // Find all files by package
  // V2
  filesV2.forEach((files, baseUri) => {
    allFiles.filter(([uri, _], i, allFiles) => {
      if (!uri.startsWith(baseUri) || uri === baseUri+ '/package.yml') { // TODO: ignore case and yml/yaml
        return false;
      }
      // Make sure this file is not inside a sub-package
      const u = new URL(uri);
      const p = u.pathname.split('/');
      const b = new URL(uri);
      for (let i = p.length - 1; i >= 0; i--) {
        b.pathname = p.slice(0, i).join('/');
        const base = b.toString();
        if (base === baseUri) {
          break;
        }
        if (filesV2.has(base)) {
          return false;
        }
      }
      return true;
    }).forEach(([uri, content]) => {
      files.push([uri, content]);
    });
  });
  // V1
  filesV1.forEach((files, baseUri) => {
    allFiles.filter(([uri, _]) => uri.startsWith(baseUri)).forEach(([uri, content]) => {
      files.push([uri, content]);
    });
  });

  console.log("V1:", filesV1);
  console.log("V2:", filesV2);

  // Create AST by versions and packages

  // Parse files by versions and packages

  return ast;
};
