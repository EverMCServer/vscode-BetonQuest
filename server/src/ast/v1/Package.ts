import { CompletionItem, PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { HoverInfo } from "../../utils/hover";
import { LocationLinkOffset } from "../../utils/location";
import { getParentUrl } from "../../utils/url";
import { AST } from "../ast";
import { ConversationOptionType, PackageV1Type } from "../node";
import { AbstractNodeV1 } from "../v1";
import { ConditionEntry } from "./Condition/ConditionEntry";
import { ConditionList } from "./Condition/ConditionList";
import { Conversation } from "./Conversation/Conversation";
import { NpcOption } from "./Conversation/Option/NpcOption";
import { PlayerOption } from "./Conversation/Option/PlayerOption";
import { EventEntry } from "./Event/EventEntry";
import { EventList } from "./Event/EventList";
import { ObjectiveEntry } from "./Objective/ObjectiveEntry";
import { ObjectiveList } from "./Objective/ObjectiveList";

export class PackageV1 extends AbstractNodeV1<PackageV1Type> {
  readonly type: PackageV1Type = "PackageV1";
  readonly uri: string;
  readonly parent: PackageV1 = this;
  readonly parentAst: AST;
  readonly packagePath: string[];

  private documentVersions: Map<string, number | undefined> = new Map();

  constructor(packageUri: string, documents: TextDocument[], parent: AST) {
    super();
    this.uri = packageUri;
    this.parentAst = parent;

    // Calculate package's path
    this.packagePath = decodeURI(this.uri).slice(this.parentAst.wsFolderUri.length).replace(/^\/?|\/?$/gm, "").split('/');

    this.update(documents);
  }

  // Update package with documents
  update(documents: TextDocument[]) {
    // Get documents that need to be updated / created
    const newDocs = documents.filter(newDoc => newDoc.version !== this.documentVersions.get(newDoc.uri));
    // Remove missing / outdated documents from AST
    const oldDocUris = [...this.documentVersions.keys()].filter(o => !newDocs.some(n => n.uri === o));
    this.children = this.children.filter(e => oldDocUris.includes(e.getUri()));

    // Iterate all files and create missing nodes.
    newDocs.forEach((document) => {
      const u = new URL(document.uri);
      const p = u.pathname.split('/');
      switch (p[p.length - 1]) {
        case 'main.yml':
          break;
        case 'conditions.yml':
          this.addChild(new ConditionList(document.uri, document, this));
          break;
        case 'events.yml':
          this.addChild(new EventList(document.uri, document, this));
          break;
        case 'objectives.yml':
          this.addChild(new ObjectiveList(document.uri, document, this));
          break;
        case 'journal.yml':
          break;
        case 'items.yml':
          break;
        case 'custom.yml':
          break;
        default:
          if (p[p.length - 2] === 'conversations') {
            this.addChild(new Conversation(document.uri, document, this));
          }
          break;
      }
    });

    // Update file versions
    this.documentVersions = new Map();
    documents.forEach(newDoc => this.documentVersions.set(newDoc.uri, newDoc.version));
  }

  // Get absolute Package path
  getPackagePath() {
    return this.packagePath;
  }

  getConditionList() {
    return this.getChild<ConditionList>('ConditionList');
  }

  getEventList() {
    return this.getChild<EventList>('EventList');
  }

  getObjectiveList() {
    return this.getChild<ObjectiveList>('ObjectiveList');
  }

  getConversations(conversationID?: string) {
    return this.getChildren<Conversation>('Conversation', c => !conversationID || c.conversationID === conversationID);
  }

  // Calculate the target package's uri by absolute / relative package path
  getPackageUri(targetPackagePath?: string) {
    let packageUri = this.uri;
    // Empty
    if (!targetPackagePath || targetPackagePath.length === 0) {
      return packageUri;
    }
    const packagePathArray = targetPackagePath.split("-");
    if (packagePathArray[0] === '_') {
      // Relative path going up
      for (let i = 0; i < packagePathArray.length; i++) {
        if (packagePathArray[i] === '_') {
          packageUri = getParentUrl(packageUri);
        } else {
          packageUri += packagePathArray.slice(i).join('/') + '/';
          break;
        }
      }
    } else {
      // Absolute path
      packageUri = this.parentAst.packageRootUriV1 + packagePathArray.join('/') + '/';
    }
    return packageUri;
  }

  isPackageUri(packageUri: string) {
    return this.uri === packageUri;
  }

  // Get Condition entries from child or parent
  getConditionEntries(id?: string, packageUri?: string): ConditionEntry[] {
    if (!id) {
      return this.getConditionList()?.getChildren<ConditionEntry>("ConditionEntry") || [];
    } else if (!packageUri || this.isPackageUri(packageUri)) {
      return this.getChild('ConditionList')?.getConditionEntries(id, packageUri) ?? [];
    } else {
      return this.parentAst.getV1ConditionEntry(id, packageUri);
    }
  }
  getAllConditionEntries(): ConditionEntry[] {
    return this.parentAst.getV1AllConditionEntries();
  }

  // Get Event entries from child or parent
  getEventEntries(id?: string, packageUri?: string): EventEntry[] {
    if (!id) {
      return this.getEventList()?.getChildren<EventEntry>("EventEntry") || [];
    } else if (!packageUri || this.isPackageUri(packageUri)) {
      return this.getChild('EventList')?.getEventEntries(id, packageUri) ?? [];
    } else {
      return this.parentAst.getV1EventEntry(id, packageUri);
    }
  }
  getAllEventEntries(): EventEntry[] {
    return this.parentAst.getV1AllEventEntries();
  }

  // Get Objective entries from child or parent
  getObjectiveEntries(id?: string, packageUri?: string): ObjectiveEntry[] {
    if (!id) {
      return this.getObjectiveList()?.getChildren<ObjectiveEntry>("ObjectiveEntry") || [];
    } else if (!packageUri || this.isPackageUri(packageUri)) {
      const t = this.getChild<ObjectiveList>('ObjectiveList');
      return this.getChild('ObjectiveList')?.getObjectiveEntries(id, packageUri) ?? [];
    } else {
      return this.parentAst.getV1ObjectiveEntry(id, packageUri);
    }
  }
  getAllObjectiveEntries(): ObjectiveEntry[] {
    return this.parentAst.getV1AllObjectiveEntries();
  }


  getConversationOptions<T extends ConversationOptionType>(type: T, optionID?: string, conversationID?: string, packageUri?: string): NpcOption[] | PlayerOption[] {
    if (packageUri && this.isPackageUri(packageUri)) {
      return this.getConversations(conversationID).flatMap(c => c.getConversationOptions<T>(type, optionID).flat()) as NpcOption[] | PlayerOption[];
    }
    return this.parentAst.getV1ConversationOptions<T>(type, optionID, conversationID, packageUri);
  }

  getConversationOptionPointers(type: ConversationOptionType, optionID: string, conversationID?: string, packageUri?: string) {
    return this.parentAst.getV1ConversationOptionPointers(type, optionID, conversationID, packageUri);
  }

  getConversationConditionPointers(conditionID?: string, packageUri?: string) {
    return this.parentAst.getV1ConversationConditionPointers(conditionID, packageUri);
  }

  getConversationEventPointers(eventID?: string, packageUri?: string) {
    return this.parentAst.getV1ConversationEventPointers(eventID, packageUri);
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    return this.children.filter(c => !documentUri || c.getUri() === documentUri).flatMap(c => {
      return {
        uri: c.getUri(),
        diagnostics: c._getDiagnostics()
      };
    });
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const locations: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return locations;
    }
    // switch (yamlPath[0]) {
    //   case '@conditions':
    //     locations.push
    // }
    if (yamlPath[0] === '@conditions') {
      locations.push(...this.getConditionList()?.getLocations(yamlPath, sourceUri) || []);
    }
    if (yamlPath[0] === '@events') {
      locations.push(...this.getEventList()?.getLocations(yamlPath, sourceUri) || []);
    }
    if (yamlPath[0] === '@objectives') {
      locations.push(...this.getObjectiveList()?.getLocations(yamlPath, sourceUri) || []);
    }
    return locations;
  }

  _getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    if (documentUri && !documentUri.startsWith(this.uri)) {
      return [];
    }
    return this.children
      .flatMap(c => c._getHoverInfo(offset, documentUri));
  }

  _getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    if (documentUri && !documentUri.startsWith(this.uri)) {
      return [];
    }
    return this.children
      .flatMap(c => c._getDefinitions(offset, documentUri));
  }

  _getReferences(offset: number, documentUri?: string): LocationLinkOffset[] {
    if (documentUri && !documentUri.startsWith(this.uri)) {
      return [];
    }
    return this.children
      .flatMap(c => c._getReferences(offset, documentUri));
  }

  _getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    if (documentUri && !documentUri.startsWith(this.uri)) {
      return [];
    }
    return this.children
      .flatMap(c => c._getCompletions(offset, documentUri));
  }
}