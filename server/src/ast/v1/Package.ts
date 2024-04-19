import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { Package } from "../Package";
import { ConversationListType, Node, PackageV1Type } from "../node";
import { ConditionList } from "./Condition/ConditionList";
import { EventList } from "./Event/EventList";
import { ObjectiveList } from "./Objective/ObjectiveList";
import { HoverInfo } from "../../utils/hover";
import { SemanticToken } from "../../service/semanticTokens";

export class PackageV1 extends Package<PackageV1Type> {
  offsetStart?: number;
  offsetEnd?: number;

  conversationList?: Node<ConversationListType>; // TODO: Conversations[]
  conditionList?: ConditionList;
  eventList?: EventList;
  objectiveList?: ObjectiveList;

  constructor(packageUri: string, documents: TextDocument[]) {
    super("PackageV1", packageUri);

    // Parse sub Nodes by types
    documents.forEach((document) => {
      const u = new URL(document.uri);
      const p = u.pathname.split('/');
      switch (p[p.length - 1]) {
        case 'main.yml':
          break;
        case 'conditions.yml':
          this.conditionList = new ConditionList(document.uri, document, this);
          break;
        case 'events.yml':
          this.eventList = new EventList(document.uri, document, this);
          break;
        case 'objectives.yml':
          this.objectiveList = new ObjectiveList(document.uri, document, this);
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
    });
  }

  getPublishDiagnosticsParams(): PublishDiagnosticsParams[] {
    const diagnostics: PublishDiagnosticsParams[] = [];
    if (this.conditionList) {
      diagnostics.push(this.conditionList.getPublishDiagnosticsParams());
    }
    if (this.eventList) {
      diagnostics.push(this.eventList.getPublishDiagnosticsParams());
    }
    if (this.objectiveList) {
      diagnostics.push(this.objectiveList.getPublishDiagnosticsParams());
    }
    return diagnostics;
  }

  getSemanticTokens(uri: string) {
    const semanticTokens: SemanticToken[] = [];
    if (!uri.startsWith(this.uri)) {
      return semanticTokens;
    }
    if (this.conditionList) {
      semanticTokens.push(...this.conditionList.getSemanticTokens(uri));
    }
    if (this.eventList) {
      semanticTokens.push(...this.eventList.getSemanticTokens(uri));
    }
    if (this.objectiveList) {
      semanticTokens.push(...this.objectiveList.getSemanticTokens(uri));
    }
    return semanticTokens;
  }

  getHoverInfo(uri: string, offset: number) {
    const hoverInfo: HoverInfo[] = [];
    if (!uri.startsWith(this.uri)) {
      return hoverInfo;
    }
    if (this.conditionList) {
      hoverInfo.push(...this.conditionList.getHoverInfo(uri, offset));
    }
    if (this.eventList) {
      hoverInfo.push(...this.eventList.getHoverInfo(uri, offset));
    }
    if (this.objectiveList) {
      hoverInfo.push(...this.objectiveList.getHoverInfo(uri, offset));
    }
    return hoverInfo;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const locations: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return locations;
    }
    if (yamlPath[0] === '@conditions' && this.conditionList) {
      locations.push(...this.conditionList.getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === '@events' && this.eventList) {
      locations.push(...this.eventList.getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === '@objectives' && this.objectiveList) {
      locations.push(...this.objectiveList.getLocations(yamlPath, sourceUri));
    }
    return locations;
  }
}