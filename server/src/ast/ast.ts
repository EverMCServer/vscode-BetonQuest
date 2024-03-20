import { Pair, Scalar } from "yaml";

import { PackageV1, PackageV2 } from "./Package";
import { TextDocumentsArray } from "../utils/types";

// AST structure for BetonQuest V1
export class AST {
  packagesV1: PackageV1[] = [];
  packagesV2: PackageV2[] = [];

  constructor(allDocuments: TextDocumentsArray) {
    const [filesV1, filesV2] = this.classifyAllDocuments(allDocuments);

    // Create AST by versions and packages
    this.parseAllDocumentsV1(filesV1);
  }

  // Classify files by versions and packages
  classifyAllDocuments(allDocuments: TextDocumentsArray) {
    // Rules:
    // - V2: package.yml https://betonquest.org/2.0/Documentation/Scripting/Packages-%26-Templates/#structure
    // - V1: main.yml https://betonquest.org/1.12/User-Documentation/Reference/#packages
    const filesV2 = new Map<string, TextDocumentsArray>();
    const filesV1 = new Map<string, TextDocumentsArray>();

    // Find all V2 packages
    allDocuments.forEach(([uri, content]) => {
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
    allDocuments.forEach(([uri, content]) => {
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
      allDocuments.filter(([uri, _]) => {
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
      allDocuments.filter(([uri, _]) => uri.startsWith(packageUri)).forEach(([uri, content]) => {
        files.push([uri, content]);
      });
    });

    // DEBUG print packages' file lists
    console.log("V1:", [...filesV1.entries()].map(([k, v]) => [k, v.map(([k, _]) => k)]));
    console.log("V2:", [...filesV2.entries()].map(([k, v]) => [k, v.map(([k, _]) => k)]));

    return [filesV1, filesV2];
  };

  // Parse all files by packages, v1
  parseAllDocumentsV1(allDocuments: Map<string, TextDocumentsArray>) {
    this.packagesV1 = []; // Purge all cached files
    allDocuments.forEach((filesResp, packageUri) => {
      // Create Package
      this.packagesV1.push(new PackageV1(packageUri, filesResp));
    });
  }

  // Parse all files by packages, v2
  parseAllDocumentsV2(allDocuments: Map<string, TextDocumentsArray>) {
    this.packagesV2 = []; // Purge all cached files
    allDocuments.forEach((filesResp, packageUri) => {
      // Create Package
      this.packagesV2.push(new PackageV2(packageUri, filesResp));
    });
  }

  // Get all diagnostics from parser
  getDiagnostics() {
    return [
      ...this.packagesV1.flatMap(p => p.getPublishDiagnosticsParams()),
      ...this.packagesV2.flatMap(p => p.getPublishDiagnosticsParams())
    ];
  }

  // getPos(sourcePath: string, address: string) {

  // }

  // // file path -> abstract address (version.package.category.key etc)

}
