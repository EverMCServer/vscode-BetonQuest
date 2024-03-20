import { PublishDiagnosticsParams } from "vscode-languageserver";

import { ConditionListType, ConversationListType, EventListType, Node, ObjectiveListType, PackageTypes, PackageV1Type, PackageV2Type } from "./node";
import { EventList } from "./v1/Event/EventList";
import { TextDocumentsArray } from "../utils/types";

export abstract class Package<T extends PackageTypes> implements Node<T> {
  type: T;
  uri?: string;
  abstract offsetStart?: number;
  abstract offsetEnd?: number;

  abstract conversationList?: Node<ConversationListType>;
  abstract eventList?: Node<EventListType>;
  abstract conditionList?: Node<ConditionListType>;
  abstract objectiveList?: Node<ObjectiveListType>;

  constructor(type: T, packageUri?: string) {
    this.type = type;
    this.uri = packageUri;
  }

  abstract getPublishDiagnosticsParams(): PublishDiagnosticsParams[];
}

export class PackageV1 extends Package<PackageV1Type> {
  offsetStart?: number;
  offsetEnd?: number;

  conversationList?: Node<ConversationListType>; // TODO: Conversations[]
  eventList?: EventList;
  conditionList?: Node<ConditionListType>;
  objectiveList?: Node<ObjectiveListType>;

  constructor(packageUri: string, documents: TextDocumentsArray) {
    super("PackageV1", packageUri);

    // Parse sub Nodes by types
    documents.forEach(([fileUri, document]) => {
      const u = new URL(fileUri);
      const p = u.pathname.split('/');
      switch (p[p.length - 1]) {
        case 'main.yml':
          break;
        case 'events.yml':
          this.eventList = new EventList(fileUri, document, this);
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
    });
  }

  getPublishDiagnosticsParams(): PublishDiagnosticsParams[] {
    const diagnostics: PublishDiagnosticsParams[] = [];
    if (this.eventList) {
      diagnostics.push(this.eventList.getPublishDiagnosticsParams());
    }
    return diagnostics;
  }
}

export class PackageV2 extends Package<PackageV2Type> {
  offsetStart?: number;
  offsetEnd?: number;

  conversationList?: Node<ConversationListType>;
  eventList?: Node<EventListType>;
  conditionList?: Node<ConditionListType>;
  objectiveList?: Node<ObjectiveListType>;

  constructor(packageUri: string, documents: TextDocumentsArray) {
    super("PackageV2", packageUri);

    // ...
  }

  getPublishDiagnosticsParams(): PublishDiagnosticsParams[] {
    const diagnostics: PublishDiagnosticsParams[] = [];
    // TODO ...
    return diagnostics;
  }
}
