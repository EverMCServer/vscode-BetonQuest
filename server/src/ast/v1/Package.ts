import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";

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
import { LocationLinkOffset } from "../../utils/location";

export class PackageV1 extends AbstractNodeV1<PackageV1Type> {
  readonly type: PackageV1Type = "PackageV1";
  readonly uri: string;
  readonly parent: PackageV1 = this;
  readonly parentAst: AST;
  readonly packagePath: string[];

  constructor(packageUri: string, documents: TextDocument[], parent: AST) {
    super();
    this.uri = packageUri;
    this.parentAst = parent;

    // Calculate package's path
    this.packagePath = this.uri.slice(this.parentAst.wsFolderUri.length).replace(/(?:\/)$/m, "").split('/');

    // Parse sub Nodes by types
    documents.forEach((document) => {
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
  }

  // Calculate the target package's uri by absolute / relative package path
  getPackageUri(targetPackagePath?: string) {
    let packageUri = this.uri;
    // Empty
    if (!targetPackagePath || targetPackagePath.length === 0) {
      return packageUri;
    }
    const packagePathArray = targetPackagePath.split("-");
    // Handle relative path
    if (packagePathArray[0] === '_') {
      packagePathArray.forEach(p => {
        if (p === '_') {
          packageUri = getParentUrl(packageUri);
        } else {
          packageUri += p + '/';
        }
      });
      return packageUri;
    }
    // Handle absolute path
    packageUri = this.parentAst.wsFolderUri + packagePathArray.join('/') + '/';
    return packageUri;
  }

  isPackageUri(packageUri: string) {
    return this.uri === packageUri;
  }

  // Get Condition entries from child or parent
  getConditionEntries(id: string, packageUri: string): ConditionEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.getChild('ConditionList')?.getConditionEntries(id, packageUri) ?? [];
    } else {
      return this.parentAst.getV1ConditionEntry(id, packageUri);
    }
  }

  // Get Event entries from child or parent
  getEventEntries(id: string, packageUri: string): EventEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.getChild('EventList')?.getEventEntries(id, packageUri) ?? [];
    } else {
      return this.parentAst.getV1EventEntry(id, packageUri);
    }
  }

  // Get Objective entries from child or parent
  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] {
    if (this.isPackageUri(packageUri)) {
      const t = this.getChild<ObjectiveList>('ObjectiveList');
      return this.getChild('ObjectiveList')?.getObjectiveEntries(id, packageUri) ?? [];
    } else {
      return this.parentAst.getV1ObjectiveEntry(id, packageUri);
    }
  }

  getConversation(conversationID?: string) {
    return this.getChild<Conversation>('Conversation', c => !conversationID || c.conversationID === conversationID);
  }

  getConversations(conversationID?: string) {
    return this.getChildren<Conversation>('Conversation', c => !conversationID || c.conversationID === conversationID);
  }

  getConversationOptions<T extends ConversationOptionType>(type: T, optionID: string, conversationID?: string, packageUri?: string): NpcOption[] | PlayerOption[] {
    if (packageUri && this.isPackageUri(packageUri)) {
      return this.getConversations(conversationID).flatMap(c => c.getConversationOptions<T>(type, optionID).flat()) as NpcOption[] | PlayerOption[];
    }
    return this.parentAst.getV1ConversationOptions<T>(type, optionID, conversationID, packageUri);
  }

  getConversationPointers(type: ConversationOptionType, optionID: string, conversationID?: string, packageUri?: string) {
    return this.parentAst.getV1ConversationPointers(type, optionID, conversationID, packageUri);
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    return this.children.filter(c => !documentUri || c.getUri() === documentUri).flatMap(c => {
      return {
        uri: c.getUri(),
        diagnostics: c.getDiagnostics()
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
      locations.push(...this.getChild<ConditionList>('ConditionList')?.getLocations(yamlPath, sourceUri) || []);
    }
    if (yamlPath[0] === '@events') {
      locations.push(...this.getChild<EventList>('EventList')?.getLocations(yamlPath, sourceUri) || []);
    }
    if (yamlPath[0] === '@objectives') {
      locations.push(...this.getChild<ObjectiveList>('ObjectiveList')?.getLocations(yamlPath, sourceUri) || []);
    }
    return locations;
  }

  getDefinitions(offset: number, uri?: string): LocationLinkOffset[] {
    if (uri && !uri.startsWith(this.uri)) {
      return [];
    }

    return super.getDefinitions(offset, uri);
  }

  getReferences(offset: number, uri?: string): LocationLinkOffset[] {
    if (uri && !uri.startsWith(this.uri)) {
      return [];
    }

    return super.getReferences(offset, uri);
  }
}