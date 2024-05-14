import { CodeAction, Diagnostic } from "vscode-languageserver";
import { ConversationEventType, ConversationTypes, NodeV1 } from "../../node";

export abstract class AbstractEvent<P extends NodeV1<ConversationTypes>> extends NodeV1<ConversationEventType> {
  type: ConversationEventType = "ConversationEvent";
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: P;

  event: string;

  constructor(uri: string, event: string, range: [offsetStart: number, offsetEnd?: number], parent: P) {
    super();
    this.uri = uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    this.event = event;
  }
}