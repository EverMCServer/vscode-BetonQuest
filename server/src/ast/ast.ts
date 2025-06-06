import { CompletionItem } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { AllDocuments } from "../utils/document";
import { HoverInfo } from "../utils/hover";
import { LocationLinkOffset } from "../utils/location";
import { getParentUrl } from "../utils/url";
import { ConversationOptionType } from "./node";
import { ConditionList as V1ConditionList } from "./v1/Condition/ConditionList";
import { FirstPointer as V1FirstPointer } from "./v1/Conversation/FirstPointer";
import { Pointer as V1NpcPointer } from "./v1/Conversation/Option/Npc/Pointer";
import { NpcOption as V1NpcOption } from "./v1/Conversation/Option/NpcOption";
import { Pointer as V1PlayerPointer } from "./v1/Conversation/Option/Player/Pointer";
import { PlayerOption as V1PlayerOption } from "./v1/Conversation/Option/PlayerOption";
import { EventList as V1EventList } from "./v1/Event/EventList";
import { ObjectiveList as V1ObjectiveList } from "./v1/Objective/ObjectiveList";
import { PackageV1 } from "./v1/Package";
import { ConditionList as V2ConditionList, ConditionListSection as V2ConditionListSection } from "./v2/Condition/ConditionList";
import { FirstPointer as V2FirstPointer } from "./v2/Conversation/FirstPointer";
import { Pointer as V2NpcPointer } from "./v2/Conversation/Option/Npc/Pointer";
import { NpcOption as V2NpcOption } from "./v2/Conversation/Option/NpcOption";
import { Pointer as V2PlayerPointer } from "./v2/Conversation/Option/Player/Pointer";
import { PlayerOption as V2PlayerOption } from "./v2/Conversation/Option/PlayerOption";
import { EventList as V2EventList, EventListSection as V2EventListSection } from "./v2/Event/EventList";
import { ObjectiveList as V2ObjectiveList, ObjectiveListSection as V2ObjectiveListSection } from "./v2/Objective/ObjectiveList";
import { PackageV2 } from "./v2/Package";

// AST by workspace folders
export class ASTs {
  asts: [uri: string, ast?: AST][] = [];

  constructor(allDocuments: AllDocuments) {
    this.updateDocuments(allDocuments);
  }

  updateDocuments(allDocuments: AllDocuments) {
    allDocuments.getAllDocuments().forEach(([wsFolderUri, documents]) => {
      const ast = this.asts.find(e => e[0] === wsFolderUri)?.[1];
      if (ast && documents) {
        ast.updatePackages(wsFolderUri, documents);
      } else {
        this.asts = this.asts.filter(([uri]) => uri !== wsFolderUri);
        this.asts.push([wsFolderUri, documents ? new AST(wsFolderUri, documents) : undefined]);
      }
    });
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

  getDiagnostics() {
    return this.getAllAstByDocumentUri().flatMap(ast => ast._getDiagnostics());
  }

  getCodeActions(documentUri?: string) {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast._getCodeActions(documentUri));
  }

  getSemanticTokens(documentUri: string) {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast._getSemanticTokens(documentUri));
  }

  getHoverInfos(offset: number, documentUri: string) {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast._getHoverInfo(offset, documentUri));
  }

  getDefinitions(offset: number, documentUri: string): LocationLinkOffset[] {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast._getDefinitions(offset, documentUri));
  }

  getReferences(offset: number, documentUri: string): LocationLinkOffset[] {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast._getReferences(offset, documentUri));
  }

  getCompletions(offset: number, documentUri: string): CompletionItem[] {
    return this.getAllAstByDocumentUri(documentUri).flatMap(ast => ast._getCompletions(offset, documentUri));
  }

  /**
   * Get uri + offset / position by abstract YAML path.
   * @param yamlPath The abstract YAML path to search for.
   * @param sourceUri The URI of the document to begin searching locations from. It is used to determine which package to search on.
   */
  getLocations(yamlPath: string[], sourceUri: string) {
    return this.getAllAstByDocumentUri(sourceUri).flatMap(ast => ast.getLocations(yamlPath, sourceUri));
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

    // Set the base dir of the package
    this.packageRootUriV1 = this.wsFolderUri;
    this.packageRootUriV2 = this.wsFolderUri + "QuestPackages/";

    // Parse AST and cache file structure
    this.updatePackages(this.wsFolderUri, documents);
  }

  updatePackages(wsFolderUri: string, documents: TextDocument[]): [filesV1: Map<string, TextDocument[]>, filesV2: Map<string, TextDocument[]>] {
    // Classify files
    const [filesV1, filesV2] = this.classifyAllDocuments(documents);

    // Create AST by versions and packages
    this.parseAllDocumentsV1(filesV1);
    this.parseAllDocumentsV2(filesV2);

    return [filesV1, filesV2];
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
    // Remove packages which are gone
    this.packagesV1 = this.packagesV1.filter(oldPackage => [...allDocuments.keys()].includes(oldPackage.uri));

    // Create new package / Update changed package
    allDocuments.forEach((documents, packageUri) => {
      const oldPkg = this.packagesV1.find(p => p.uri === packageUri);
      if (!oldPkg) {
        // Create Package
        this.packagesV1.push(new PackageV1(packageUri, documents, this));
      } else {
        oldPkg.update(documents);
      }
    });
  }

  // Parse all files by packages, v2
  parseAllDocumentsV2(allDocuments: Map<string, TextDocument[]>) {
    // Remove packages which are gone
    this.packagesV2 = this.packagesV2.filter(oldPackage => [...allDocuments.keys()].includes(oldPackage.uri));

    // Create new package / Update changed package
    allDocuments.forEach((documents, packageUri) => {
      const oldPkg = this.packagesV2.find(p => p.uri === packageUri);
      if (!oldPkg) {
        // Create Package
        this.packagesV2.push(new PackageV2(packageUri, documents, this));
      } else {
        oldPkg.update(documents);
      }
    });
  }

  // Get all diagnostics from parser
  _getDiagnostics() {
    return [
      ...this.packagesV1.flatMap(p => p.getPublishDiagnosticsParams()),
      ...this.packagesV2.flatMap(p => p.getPublishDiagnosticsParams())
    ];
  }

  // Get all CodeActions
  _getCodeActions(documentUri?: string) {
    return [
      ...this.packagesV1.filter(p => !documentUri || documentUri.startsWith(p.uri)).flatMap(p => p._getCodeActions(documentUri)),
      ...this.packagesV2.filter(p => !documentUri || documentUri.startsWith(p.uri)).flatMap(p => p._getCodeActions(documentUri))
    ];
  }

  // Get semantic tokens for embeded betonquest's instructions
  _getSemanticTokens(documentUri: string) {
    return [
      ...this.packagesV1.filter(p => documentUri.startsWith(p.uri)).flatMap(p => p._getSemanticTokens(documentUri)),
      ...this.packagesV2.filter(p => documentUri.startsWith(p.uri)).flatMap(p => p._getSemanticTokens(documentUri))
    ];
  }

  // Get all hover info
  _getHoverInfo(offset: number, documentUri: string): HoverInfo[] {
    return [
      ...this.packagesV1.flatMap(p => p._getHoverInfo(offset, documentUri)),
      ...this.packagesV2.flatMap(p => p._getHoverInfo(offset, documentUri))
    ];
  }

  _getDefinitions(offset: number, uri: string): LocationLinkOffset[] {
    return [
      ...this.packagesV1.flatMap(pkg => pkg._getDefinitions(offset, uri)),
      ...this.packagesV2.flatMap(pkg => pkg._getDefinitions(offset, uri))
    ];
  }

  _getReferences(offset: number, uri: string): LocationLinkOffset[] {
    return [
      ...this.packagesV1.flatMap(pkg => pkg._getReferences(offset, uri)),
      ...this.packagesV2.flatMap(pkg => pkg._getReferences(offset, uri))
    ];
  }

  _getCompletions(offset: number, uri: string): CompletionItem[] {
    return [
      ...this.packagesV1.flatMap(pkg => pkg._getCompletions(offset, uri)),
      ...this.packagesV2.flatMap(pkg => pkg._getCompletions(offset, uri))
    ];
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return [
      ...this.packagesV1.flatMap(p => p.getLocations(yamlPath, sourceUri)),
      ...this.packagesV2.flatMap(p => p.getLocations(yamlPath, sourceUri))
    ];
  }

  getV1Packages(packageUri?: string) {
    return this.packagesV1.filter(pkg => !packageUri || pkg.isPackageUri(packageUri));
  }

  getV1ConditionEntry(id: string, packageUri: string) {
    return this.packagesV1.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getConditionEntries(id, packageUri));
  }
  getV1AllConditionEntries() {
    return this.packagesV1.flatMap(p =>
      p.getChildren<V1ConditionList>("ConditionList").flatMap(c =>
        c._getConditionEntries()
      )
    );
  }

  getV1EventEntry(id: string, packageUri: string) {
    return this.packagesV1.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getEventEntries(id, packageUri));
  }
  getV1AllEventEntries() {
    return this.packagesV1.flatMap(p =>
      p.getChildren<V1EventList>("EventList").flatMap(c =>
        c._getEventEntries()
      )
    );
  }

  getV1ObjectiveEntry(id: string, packageUri: string) {
    return this.packagesV1.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getObjectiveEntries(id, packageUri));
  }
  getV1AllObjectiveEntries() {
    return this.packagesV1.flatMap(p =>
      p.getChildren<V1ObjectiveList>("ObjectiveList").flatMap(c =>
        c._getObjectiveEntries()
      )
    );
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
  getV2AllConditionEntries() {
    return this.packagesV2.flatMap(p =>
      p.getChildren<V2ConditionList>("ConditionList").flatMap(c =>
        c.getChildren<V2ConditionListSection>("ConditionListSection").flatMap(c =>
          c._getConditionEntries()
        )
      )
    );
  }

  getV2EventEntry(id: string, packageUri: string) {
    return this.packagesV2.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getEventEntries(id, packageUri));
  }
  getV2AllEventEntries() {
    return this.packagesV2.flatMap(p =>
      p.getChildren<V2EventList>("EventList").flatMap(c =>
        c.getChildren<V2EventListSection>("EventListSection").flatMap(c =>
          c._getEventEntries()
        )
      )
    );
  }

  getV2ObjectiveEntry(id: string, packageUri: string) {
    return this.packagesV2.filter(pkg => pkg.isPackageUri(packageUri)).flatMap(p => p.getObjectiveEntries(id, packageUri));
  }
  getV2AllObjectiveEntries() {
    return this.packagesV2.flatMap(p =>
      p.getChildren<V2ObjectiveList>("ObjectiveList").flatMap(c =>
        c.getChildren<V2ObjectiveListSection>("ObjectiveListSection").flatMap(c =>
          c._getObjectiveEntries()
        )
      )
    );
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
