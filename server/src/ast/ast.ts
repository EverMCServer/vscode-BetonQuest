import { Position, TextDocument } from "vscode-languageserver-textdocument";

import { PackageV1 } from "./v1/Package";
import { PackageV2 } from "./v2/Package";
import { AllDocuments } from "../utils/document";
import { HoverInfo } from "../utils/hover";
import { getParentUrl } from "../utils/url";

// AST by workspace folders
export class ASTs {
  asts: [uri: string, ast?: AST][] = [];

  constructor(allDocuments: AllDocuments) {
    this.updateDocuments(allDocuments);
  }

  updateDocuments(allDocuments: AllDocuments) {
    this.asts = allDocuments.getAllDocuments().map<[string, AST?]>(([wsFolderUri, documents]) => [wsFolderUri, documents ? new AST(wsFolderUri, documents) : undefined]);
  }

  getAstByPackageUri(packageUri: string) {
    return this.asts.find(([uri]) => uri === packageUri)?.[1];
  }

  getAllAstByPackageUri(packageUri: string) {
    return this.asts.flatMap(([uri, ast]) => uri === packageUri && ast ? ast : []);
  }

  getAstByDocumentUri(documentUri: string) {
    return this.asts.find(([uri]) => documentUri.startsWith(uri))?.[1];
  }

  getAllAstByDocumentUri(documentUri: string) {
    return this.asts.flatMap(([uri, ast]) => documentUri.startsWith(uri) && ast ? ast : []);
  }

  getDiagnostics(documentUri?: string) {
    return this.asts.filter(([uri]) => documentUri ? documentUri.startsWith(uri) : true).flatMap(([, ast]) => ast?.getDiagnostics(documentUri) ?? []);
  }

  getAllCodeActions(documentUri?: string) {
    return this.asts.filter(([uri]) => documentUri ? documentUri.startsWith(uri) : true).flatMap(([, ast]) => ast?.getCodeActions(documentUri) ?? []);
  }

  /**
   * Get uri + offset / position by abstract YAML path.
   * @param yamlPath The abstract YAML path to search for.
   * @param sourceUri The URI of the document to begin searching locations from. It is used to determine which package to search on.
   */
  getLocations(yamlPath: string[], sourceUri: string) {
    return this.asts.flatMap(([, ast]) => ast?.getLocations(yamlPath, sourceUri) ?? []);
  }

}

// AST structure for BetonQuest V1 & V2
export class AST {
  readonly wsFolderUri: string; // The dir of the workspace folder
  // private packageRootUriV1: string; // The base dir of the package root
  // private packageRootUriV2: string; // The base dir of the package root
  private packagesV1: PackageV1[] = [];
  private packagesV2: PackageV2[] = [];

  constructor(wsFolderUri: string, documents: TextDocument[]) {
    this.wsFolderUri = wsFolderUri;
    const [filesV1, filesV2] = this.classifyAllDocuments(documents);

    // // Set the base dir of the package
    // this.packageRootUriV1 = wsFolderUri;
    // this.packageRootUriV2 = wsFolderUri + "QuestPackages/";

    // Create AST by versions and packages
    this.parseAllDocumentsV1(filesV1);
    this.parseAllDocumentsV2(filesV2);
  }

  // Classify files by versions and packages
  classifyAllDocuments(documents: TextDocument[]) {
    // Rules:
    // - V2: package.yml https://betonquest.org/2.0/Documentation/Scripting/Packages-%26-Templates/#structure
    // - V1: main.yml https://betonquest.org/1.12/User-Documentation/Reference/#packages
    const filesV2 = new Map<string, TextDocument[]>();
    const filesV1 = new Map<string, TextDocument[]>();

    // Find all V2 packages
    documents.forEach((document) => {
      const u = new URL(document.uri);
      const p = u.pathname.split('/');
      if (p[p.length - 1].match(/^package\.yml$/i)) {
        // Check if the file within "QuestPackages",
        // and the workspce opened the whole BetonQuest folder, not it's sub-folders
        if (!document.uri.startsWith(this.wsFolderUri)) {
          return;
        } else {
          const partialPath = document.uri.slice(this.wsFolderUri.length);
          // if (!partialPath.startsWith('QuestPackages/') || !partialPath.startsWith('BetonQuest/QuestPackages/')) {
          if (!partialPath.startsWith('QuestPackages/')) {
            return;
          }
        }

        // Create package's base path
        const packageUri = getParentUrl(document.uri);
        // Cache the package's with base path.
        filesV2.set(packageUri, [document]);
      }
    });
    // Find all V1 packages
    documents.forEach((document) => {
      const u = new URL(document.uri);
      const p = u.pathname.split('/');
      if (p[p.length - 1].match(/^main\.yml$/i)) {
        // Create package's base path
        const packageUri = getParentUrl(document.uri);
        // Skip if conflict.
        // 1. Avoid conflict with V2. Skip if this main.yml is nested in V2 package
        for (const path of filesV2.keys()) {
          if (document.uri.startsWith(path)) {
            return;
          }
        }
        // 2. We only take the most outer "main.yml" as the package
        for (const path of filesV1.keys()) {
          // Skip if parent document.uri already exists
          if (document.uri.startsWith(path)) {
            return;
          }
          // Replace if ther is a child document.uri nested in this package. We keep the most outer one.
          if (path.startsWith(packageUri)) {
            filesV1.delete(path);
          }
        }
        // Cache the package's with base path.
        filesV1.set(packageUri, [document]);
      }
    });

    // Find all files by package
    // V2
    filesV2.forEach((files, packageUri) => {
      const baseEntryFileRegex = new RegExp(`^${packageUri}/package\.yml$`);
      documents.filter((document) => {
        if (!document.uri.startsWith(packageUri) || document.uri.match(baseEntryFileRegex)) {
          return false;
        }
        // Make sure this file is not inside another sub-package
        const u = new URL(document.uri);
        const p = u.pathname.split('/');
        const b = new URL(document.uri);
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
      }).forEach((document) => {
        files.push(document);
      });
    });
    // V1
    filesV1.forEach((files, packageUri) => {
      documents.filter((document) => document.uri.startsWith(packageUri)).forEach((document) => {
        files.push(document);
      });
    });

    // DEBUG print packages' file lists
    // console.log("V1:", [...filesV1.entries()].map(([k, v]) => [k, v.map(([k, _]) => k)]));
    // console.log("V2:", [...filesV2.entries()].map(([k, v]) => [k, v.map(([k, _]) => k)]));

    return [filesV1, filesV2];
  };

  // Parse all files by packages, v1
  parseAllDocumentsV1(allDocuments: Map<string, TextDocument[]>) {
    this.packagesV1 = []; // Purge all cached files
    allDocuments.forEach((documents, packageUri) => {
      // Create Package
      this.packagesV1.push(new PackageV1(packageUri, documents, this));
    });
  }

  // Parse all files by packages, v2
  parseAllDocumentsV2(allDocuments: Map<string, TextDocument[]>) {
    this.packagesV2 = []; // Purge all cached files
    allDocuments.forEach((documents, packageUri) => {
      // Create Package
      this.packagesV2.push(new PackageV2(packageUri, documents, this));
    });
  }

  // Get all diagnostics from parser
  getDiagnostics(documentUri?: string) {
    return [
      ...this.packagesV1.filter(p => documentUri ? documentUri.startsWith(p.getUri()) : true).flatMap(p => p.getPublishDiagnosticsParams(documentUri)),
      ...this.packagesV2.filter(p => documentUri ? documentUri.startsWith(p.getUri()) : true).flatMap(p => p.getPublishDiagnosticsParams(documentUri))
    ];
  }

  // Get all CodeActions
  getCodeActions(documentUri?: string) {
    return [
      ...this.packagesV1.filter(p => documentUri ? documentUri.startsWith(p.getUri()) : true).flatMap(p => p.getCodeActions(documentUri)),
      // ...this.packagesV2.filter(p => documentUri ? documentUri.startsWith(p.getUri()) : true).flatMap(p => p.getCodeActions(documentUri))
    ];
  }

  // Get semantic tokens for embeded betonquest's instructions
  getSemanticTokens(uri: string) {
    return [
      ...this.packagesV1.flatMap(p => p.getSemanticTokens(uri)),
      ...this.packagesV2.flatMap(p => p.getSemanticTokens(uri))
    ];
  }

  // Get all hover info
  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    // TODO: return text with range
    // return ["test `hover` info", "block 2"];
    return [
      ...this.packagesV1.flatMap(p => p.getHoverInfo(uri, offset)),
      ...this.packagesV2.flatMap(p => p.getHoverInfo(uri, offset))
    ];
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return [
      ...this.packagesV1.flatMap(p => p.getLocations(yamlPath, sourceUri)),
      ...this.packagesV2.flatMap(p => p.getLocations(yamlPath, sourceUri))
    ];
  }

  getV1ConditionEntry(id: string, packageUri: string) {
    return this.packagesV1.flatMap(p => p.getConditionEntries(id, packageUri));
  }

  getV2ConditionEntry(id: string, packageUri: string) {
    return this.packagesV2.flatMap(p => p.getConditionEntries(id, packageUri));
  }

  // getPos(sourcePath: string, address: string) {

  // }

  // // file path -> abstract address (version.package.category.key etc)

}
