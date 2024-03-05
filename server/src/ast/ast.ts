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

  // Find all packages
  allFiles.forEach(([uri, content]) => {
    const p = new URL(uri).pathname.split('/');
    // Get all V2 packages
    if (p[p.length - 1].match(/^package\.ya?ml$/i)) {
      // TOOD: nested packages
      // ...
      // filesV2.set(p[p.length - 2] || '', [[uri, content]]);
      filesV2.set(uri, [[uri, content]]);
    }
    // Get all V1 packages
    if (p[p.length - 1].match(/^main\.ya?ml$/i)) {
      // Skip if conflict. We only take the most outer "main.yml" as the package
      let skip = false;
      const files = Array.from(filesV1);
      for (const [path, _] of files) {
        const basePos = path.lastIndexOf('main.yml') |  path.lastIndexOf('main.yaml');
        if (basePos > 0) {
          const base = path.slice(0, basePos);
          if (uri.startsWith(base)) {
            skip = true;
            break;
          }
        }
      }
      if (skip) {
        return;
      }
      // Save package path
      // filesV1.set(p[p.length - 2] || '', [[uri, content]]);
      filesV1.set(uri, [[uri, content]]);
    }
  });

  // Find all files by package
  // TODO: V2
  // ...
  // V1
  filesV1.forEach((files, uri) => {
    allFiles.filter(([u, _]) => u.startsWith(uri)).forEach(([u, content]) => {
      files.push([u, content]);
    });
  });

  console.log(filesV1);
  console.log(filesV2);

  // Create AST by versions and packages

  // Parse files by versions and packages

  return ast;
};
