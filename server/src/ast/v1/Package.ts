import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { Package } from "../Package";
import { ConditionListType, ConversationListType, EventListType, Node, ObjectiveListType, PackageTypes, PackageV1Type, PackageV2Type } from "../node";
import { HoverInfo } from "../../utils/hover";
import { ConditionList } from "./Condition/ConditionList";
import { EventList } from "./Event/EventList";
import { ObjectiveList } from "./Objective/ObjectiveList";

export class PackageV1 extends Package<PackageV1Type> {
  offsetStart?: number;
  offsetEnd?: number;

  conversationList?: Node<ConversationListType>; // TODO: Conversations[]
  eventList?: EventList;
  conditionList?: ConditionList;
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
    if (this.eventList) {
      diagnostics.push(this.eventList.getPublishDiagnosticsParams());
    }
    return diagnostics;
  }

  getHoverInfo(uri: string, offset: number) {
    let result = [];
    if (this.conditionList) {
      result.push(...this.conditionList.getHoverInfo(uri, offset));
    }
    if (this.eventList) {
      result.push(...this.eventList.getHoverInfo(uri, offset));
    }
    if (this.objectiveList) {
      result.push(...this.objectiveList.getHoverInfo(uri, offset));
    }
    return result;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return result;
    }
    if (yamlPath[0] === '@conditions' && this.conditionList) {
      result.push(...this.conditionList.getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === '@events' && this.eventList) {
      result.push(...this.eventList.getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === '@objectives' && this.objectiveList) {
      result.push(...this.objectiveList.getLocations(yamlPath, sourceUri));
    }
    return result;
  }
}