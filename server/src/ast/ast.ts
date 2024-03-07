import { Pair, Scalar } from "yaml";

import { Node, NodeType } from "./node";
import { FilesResponse } from "betonquest-utils/lsp/file";

// AST structure for BetonQuest V1
export class AST {
  v1?: Node<NodeType>[];
  v2?: Node<NodeType>[];

  constructor(allFiles: FilesResponse) {
    const [filesV1, filesV2] = this.classifyAllFiles(allFiles);

    // Create AST by versions and packages
    // ...

    // Parse files by versions and packages
    // ...
  }

  // Classify files by versions and packages
  classifyAllFiles(allFiles: FilesResponse) {
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
        const packageUri = b.toString();
        // Cache the package's path with a entry file.
        filesV2.set(packageUri, [[uri, content]]);
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
        const packageUri = b.toString();
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
          if (path.startsWith(packageUri)) {
            filesV1.delete(path);
          }
        }
        // Cache the package's path with a entry file.
        filesV1.set(packageUri, [[uri, content]]);
      }
    });

    // Find all files by package
    // V2
    filesV2.forEach((files, packageUri) => {
      const baseEntryFileRegex = new RegExp(`^${packageUri}/package\.ya?ml$`);
      allFiles.filter(([uri, _]) => {
        if (!uri.startsWith(packageUri) || uri.match(baseEntryFileRegex)) {
          return false;
        }
        // Make sure this file is not inside another sub-package
        const u = new URL(uri);
        const p = u.pathname.split('/');
        const b = new URL(uri);
        for (let i = p.length - 1; i > -1; i--) {
          b.pathname = p.slice(0, i).join('/');
          const base = b.toString();
          if (base === packageUri) {
            // It belongs to this package only, skip check.
            break;
          }
          if (filesV2.has(base)) {
            // It belongs to another package, skip this file.
            return false;
          }
        }
        return true;
      }).forEach(([uri, content]) => {
        files.push([uri, content]);
      });
    });
    // V1
    filesV1.forEach((files, packageUri) => {
      allFiles.filter(([uri, _]) => uri.startsWith(packageUri)).forEach(([uri, content]) => {
        files.push([uri, content]);
      });
    });

    // DEBUG print packages' file lists
    console.log("V1:", [...filesV1.entries()].map(([k, v]) => [k, v.map(([k, _]) => k)]));
    console.log("V2:", [...filesV2.entries()].map(([k, v]) => [k, v.map(([k, _]) => k)]));

    return [filesV1, filesV2];
  };

  parseAllFilesV1(allFiles: Map<string, FilesResponse>) {
    allFiles.forEach((filesResp, packageUri) => filesResp.forEach(([fileUri, fileContent]) => {
      const u = new URL(fileUri);
      const p = u.pathname.split('/');
      switch (p[p.length - 1]) {
        case 'main.yml':
          break;
        case 'events.yml':
          break;
        case 'conditions.yml':
          break;
        case 'objectives.yml':
          break;
        case 'journal.yml':
          break;
        case 'items.yml':
          break;
        case 'custom.yml':
          break;
        default:
          if (p[p.length - 2] === 'conversations') { }
          break;
      }
    })
    );
  }

  // getPos(sourcePath: string, address: string) {

  // }

  // // file path -> abstract address (version.package.category.key etc)

}
