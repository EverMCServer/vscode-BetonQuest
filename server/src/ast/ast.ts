import { CompletionItem } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { AllDocuments } from "../utils/document";
import { HoverInfo } from "../utils/hover";
import { LocationLinkOffset } from "../utils/location";
import { getParentUrl } from "../utils/url";
import { ConversationOptionType } from "./node";
import { FirstPointer as V1FirstPointer } from "./v1/Conversation/FirstPointer";
import { Pointer as V1NpcPointer } from "./v1/Conversation/Option/Npc/Pointer";
import { NpcOption as V1NpcOption } from "./v1/Conversation/Option/NpcOption";
import { Pointer as V1PlayerPointer } from "./v1/Conversation/Option/Player/Pointer";
import { PlayerOption as V1PlayerOption } from "./v1/Conversation/Option/PlayerOption";
import { PackageV1 } from "./v1/Package";
import { FirstPointer as V2FirstPointer } from "./v2/Conversation/FirstPointer";
import { Pointer as V2NpcPointer } from "./v2/Conversation/Option/Npc/Pointer";
import { NpcOption as V2NpcOption } from "./v2/Conversation/Option/NpcOption";
import { Pointer as V2PlayerPointer } from "./v2/Conversation/Option/Player/Pointer";
import { PlayerOption as V2PlayerOption } from "./v2/Conversation/Option/PlayerOption";
import { PackageV2 } from "./v2/Package";

// AST by workspace folders
export class ASTs {
  asts: [uri: string, ast?: AST][] = [];

  constructor(allDocuments: AllDocuments) {
    this.updateDocuments(allDocuments);
  }

  updateDocuments(allDocuments: AllDocuments) {
    this.asts = allDocuments.getAllDocuments().map<[string, AST?]>(([wsFolderUri, documents]) => [wsFolderUri, documents ? new AST(wsFolderUri, documents) : undefined]);
  }

  // getAstByPackageUri(packageUri: string) {
  //   return this.asts.find(([uri]) => uri === packageUri)?.[1];
  // }

  // getAllAstByPackageUri(packageUri: string) {
  //   return this.asts.flatMap(([uri, ast]) => uri === packageUri && ast ? ast : []);
  // }

  private getAstByDocumentUri(documentUri: string) {
    return this.asts.find(([uri]) => documentUri.startsWith(uri))?.[1];
  }

  private getAllAstByDocumentUri(documentUri?: string) {
    return this.asts.flatMap(([uri, ast]) => ast && (!documentUri || documentUri.startsWith(uri)) ? ast : []);
  }

  getDiagnostics(documentUri?: string) {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast.getDiagnostics(documentUri));
  }

  getCodeActions(documentUri?: string) {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast.getCodeActions(documentUri));
  }

  getSemanticTokens(documentUri: string) {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast.getSemanticTokens(documentUri));
  }

  getHoverInfos(offset: number, documentUri: string) {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast.getHoverInfo(offset, documentUri));
  }

  /**
   * Get uri + offset / position by abstract YAML path.
   * @param yamlPath The abstract YAML path to search for.
   * @param sourceUri The URI of the document to begin searching locations from. It is used to determine which package to search on.
   */
  getLocations(yamlPath: string[], sourceUri: string) {
    return this.getAllAstByDocumentUri(sourceUri).flatMap(ast => ast.getLocations(yamlPath, sourceUri));
  }

  getDefinitions(offset: number, documentUri: string): LocationLinkOffset[] {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast.getDefinitions(offset, documentUri));
  }

  getReferences(offset: number, documentUri: string): LocationLinkOffset[] {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast.getReferences(offset, documentUri));
  }

  getCompletions(offset: number, documentUri: string): CompletionItem[] {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast.getCompletions(offset, documentUri));
  }

}

// AST structure for BetonQuest V1 & V2
export class AST {
  readonly wsFolderUri: string; // The dir of the workspace folder
  readonly packageRootUriV1: string; // The base dir of the package root
  readonly packageRootUriV2: string; // The base dir of the package root
  private packagesV1: PackageV1[] = [];
  private packagesV2: PackageV2[] = [];

  constructor(wsFolderUri: string, documents: TextDocument[]) {
    this.wsFolderUri = wsFolderUri;
    const [filesV1, filesV2] = this.classifyAllDocuments(documents);

    // // Set the base dir of the package
    this.packageRootUriV1 = wsFolderUri;
    this.packageRootUriV2 = wsFolderUri + "QuestPackages/";

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
        if (!document.uri.startsWith(this.wsFolderUri)) {
          return;
        } else {
          // To ensure the extension could resolve all package paths correctely,
          // check if the file within "QuestPackages",
          // and the workspce opened the whole BetonQuest folder, not it's sub-folders.
          const partialPath = document.uri.slice(this.wsFolderUri.length);
          // if (!document.uri.match(/\/QuestPackages\//)) {
          // if (!partialPath.match(/^\/?QuestPackages\//m) || !partialPath.match(/^\/?BetonQuest\/QuestPackages\//m)) {
          // if (!partialPath.match(/^\/?QuestPackages\//m)) {
          if (!partialPath.match(/(?:^|\/)QuestPackages\//m)) {
            return;
          }
        }

        // Create package's base path
        const packageUri = getParentUrl(document.uri);
        // Cache the package's with base path.
        filesV2.set(packageUri, []);
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
        // 1. Avoid conflict with V2. Skip if this main.yml is nested in a V2 package
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
        filesV1.set(packageUri, []);
      }
    });

    // Find all files by package
    // V2
    const packageUrisV2 = Array.from(filesV2, ([k]) => k);
    filesV2.forEach((files, packageUri) => {
      documents.filter((document) => {
        if (!document.uri.startsWith(packageUri)) {
          return false;
        }
        // Make sure this file is not inside another sub-package
        return !packageUrisV2.some(uri => uri.length > packageUri.length && uri.startsWith(packageUri) && document.uri.startsWith(uri));
      }).forEach((document) => {
        files.push(document);
      });
    });
    // V1
    filesV1.forEach((files, packageUri) => {
      documents.filter((document) => document.uri.startsWith(packageUri)).forEach((document) => {
        // Load BetonQuest's files only
        const partialPath = document.uri.slice(packageUri.length);
        if (
          [
            "main.yml",
            "conditions.yml",
            "events.yml",
            "objectives.yml",
            "journal.yml",
            "items.yml",
            "custom.yml",
          ].includes(partialPath)
          ||
          partialPath.match(/^\/?conversations\//m)
        ) {
          files.push(document);
        }
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
      ...this.packagesV1.filter(p => !documentUri || documentUri.startsWith(p.uri)).flatMap(p => p.getPublishDiagnosticsParams(documentUri)),
      ...this.packagesV2.filter(p => !documentUri || documentUri.startsWith(p.uri)).flatMap(p => p.getPublishDiagnosticsParams(documentUri))
    ];
  }

  // Get all CodeActions
  getCodeActions(documentUri?: string) {
    return [
      ...this.packagesV1.filter(p => !documentUri || documentUri.startsWith(p.uri)).flatMap(p => p.getCodeActions(documentUri)),
      ...this.packagesV2.filter(p => !documentUri || documentUri.startsWith(p.uri)).flatMap(p => p.getCodeActions(documentUri))
    ];
  }

  // Get semantic tokens for embeded betonquest's instructions
  getSemanticTokens(documentUri: string) {
    return [
      ...this.packagesV1.filter(p => documentUri.startsWith(p.uri)).flatMap(p => p.getSemanticTokens(documentUri)),
      ...this.packagesV2.filter(p => documentUri.startsWith(p.uri)).flatMap(p => p.getSemanticTokens(documentUri))
    ];
  }

  // Get all hover info
  getHoverInfo(offset: number, documentUri: string): HoverInfo[] {
    return [
      ...this.packagesV1.flatMap(p => p.getHoverInfo(offset, documentUri)),
      ...this.packagesV2.flatMap(p => p.getHoverInfo(offset, documentUri))
    ];
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return [
      ...this.packagesV1.flatMap(p => p.getLocations(yamlPath, sourceUri)),
      ...this.packagesV2.flatMap(p => p.getLocations(yamlPath, sourceUri))
    ];
  }

  getDefinitions(offset: number, uri: string): LocationLinkOffset[] {
    return [
      ...this.packagesV1.flatMap(pkg => pkg.getDefinitions(offset, uri)),
      ...this.packagesV2.flatMap(pkg => pkg.getDefinitions(offset, uri))
    ];
  }

  getReferences(offset: number, uri: string): LocationLinkOffset[] {
    return [
      ...this.packagesV1.flatMap(pkg => pkg.getReferences(offset, uri)),
      ...this.packagesV2.flatMap(pkg => pkg.getReferences(offset, uri))
    ];
  }

  getCompletions(offset: number, uri: string): CompletionItem[] {
    return [
      ...this.packagesV1.flatMap(pkg => pkg.getCompletions(offset, uri)),
      ...this.packagesV2.flatMap(pkg => pkg.getCompletions(offset, uri))
    ];
  }

  getV1Packages(packageUri?: string) {
    return this.packagesV1.filter(pkg => !packageUri || pkg.isPackageUri(packageUri));
  }

  getV1ConditionEntry(id: string, packageUri: string) {
    return this.packagesV1.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getConditionEntries(id, packageUri));
  }

  getV1EventEntry(id: string, packageUri: string) {
    return this.packagesV1.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getEventEntries(id, packageUri));
  }

  getV1ObjectiveEntry(id: string, packageUri: string) {
    return this.packagesV1.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getObjectiveEntries(id, packageUri));
  }

  getV1ConversationOptions<T extends ConversationOptionType>(type: T, optionID?: string, conversationID?: string, packageUri?: string) {
    return this.packagesV1.filter(pkg => !packageUri || pkg.isPackageUri(packageUri)).flatMap(p => p.getConversationOptions<T>(type, optionID, conversationID, packageUri).flat()) as V1NpcOption[] | V1PlayerOption[];
  }

  getV1ConversationOptionPointers(type: ConversationOptionType, optionID: string, conversationID?: string, packageUri?: string) {
    return this.packagesV1.filter(pkg => !packageUri || pkg.isPackageUri(packageUri))
      .flatMap(p => p.getConversations()
        .flatMap(c => {
          const pointers: (V1FirstPointer | V1NpcPointer | V1PlayerPointer)[] = [];
          switch (type) {
            case 'ConversationNpcOption':
              // Search conversation first pointers
              c.getFirst().forEach(f => f.getFirstPointers(optionID, conversationID).forEach(p => pointers.push(p)));
              // Search pointers from conversation Player Options
              c.getConversationOptions('ConversationPlayerOption')
                .forEach(o => o.getPointers()
                  .forEach(ps => pointers.push(...ps.getPointers(optionID, conversationID)))
                );
              break;
            case 'ConversationPlayerOption':
              // Search pointers from conversation NPC Options
              c.getConversationOptions('ConversationNpcOption')
                .forEach(o => o.getPointers()
                  .forEach(ps => pointers.push(...ps.getPointers(optionID, conversationID)))
                );
              break;
          }
          return pointers;
        })
      );
  }

  getV1ConversationConditionPointers(conditionID?: string, packageUri?: string) {
    return this.packagesV1
      .flatMap(p => p.getConversations()
        .flatMap(c => c.getConversationAllOptions()
          .flatMap(o => o.getConditions()
            .flatMap(c => c.getConditions(conditionID, packageUri).flat())
          )
        )
      );
  }

  getV1ConversationEventPointers(eventID?: string, packageUri?: string) {
    return this.packagesV1
      .flatMap(p => p.getConversations()
        .flatMap(c => [
          ...c.getConversationAllOptions()
            .flatMap(o => o.getEvents()
              .flatMap(c => c.getEvents(eventID, packageUri).flat())
            ),
          ...c.getFinalEvents()
            .flatMap(f => f.getFinalEvents(eventID, packageUri))
        ])
      );
  }

  getV2Packages(packageUri?: string) {
    return this.packagesV2.filter(pkg => !packageUri || pkg.isPackageUri(packageUri));
  }

  getV2ConditionEntry(id: string, packageUri: string) {
    return this.packagesV2.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getConditionEntries(id, packageUri));
  }

  getV2EventEntry(id: string, packageUri: string) {
    return this.packagesV2.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getEventEntries(id, packageUri));
  }

  getV2ObjectiveEntry(id: string, packageUri: string) {
    return this.packagesV2.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getObjectiveEntries(id, packageUri));
  }

  getV2ConversationOptions<T extends ConversationOptionType>(type: T, optionID?: string, conversationID?: string, packageUri?: string) {
    return this.packagesV2.filter(pkg => !packageUri || pkg.isPackageUri(packageUri))
      .flatMap(p => p.getConversations(conversationID)
        .flatMap(c => c.getConversationSections()
          .flatMap(c => {
            switch (type) {
              case 'ConversationNpcOption':
                return c.getNpcOptions(optionID).flat();
              case 'ConversationPlayerOption':
                return c.getPlayerOptions(optionID).flat();
            }
            return [] as (V2NpcOption | V2PlayerOption)[];
          })
        )
      );
  }

  getV2ConversationOptionPointers(type: ConversationOptionType, optionID: string, conversationID?: string, packageUri?: string) {
    return this.packagesV2
      .flatMap(p => p.getConversations()
        .flatMap(c => c.getConversationSections()
          .flatMap(c => {
            const pointers: (V2FirstPointer | V2NpcPointer | V2PlayerPointer)[] = [];
            switch (type) {
              case 'ConversationNpcOption':
                // Search conversation first pointers
                c.getFirst().forEach(f => f.getFirstPointers(optionID, conversationID, packageUri).forEach(p => pointers.push(p)));
                // Search pointers from conversation Player Options
                c.getConversationOptions('ConversationPlayerOption')
                  .forEach(o => o.getPointers()
                    .forEach(ps => pointers.push(...ps.getPointers(optionID, conversationID, packageUri)))
                  );
                break;
              case 'ConversationPlayerOption':
                // Search pointers from conversation NPC Options
                c.getConversationOptions('ConversationNpcOption')
                  .forEach(o => o.getPointers()
                    .forEach(ps => pointers.push(...ps.getPointers(optionID, conversationID, packageUri)))
                  );
                break;
            }
            return pointers;
          })
        )
      );
  }

  getV2ConversationConditionPointers(conditionID?: string, packageUri?: string) {
    return this.packagesV2
      .flatMap(p => p.getConversations()
        .flatMap(c => c.getConversationSections()
          .flatMap(c => c.getConversationAllOptions()
            .flatMap(o => o.getConditions()
              .flatMap(c => c.getConditions(conditionID, packageUri).flat())
            )
          )
        )
      );
  }

  getV2ConversationEventPointers(eventID?: string, packageUri?: string) {
    return this.packagesV2
      .flatMap(p => p.getConversations()
        .flatMap(c => c.getConversationSections()
          .flatMap(c => [
            ...c.getConversationAllOptions()
              .flatMap(o => o.getEvents()
                .flatMap(c => c.getEvents(eventID, packageUri).flat())
              ),
            ...c.getFinalEvents()
              .flatMap(f => f.getFinalEvents(eventID, packageUri))
          ])
        )
      );
  }

}
