import { Diagnostic } from "vscode-languageserver";
import { ConversationEventType, ConversationTypes, Node } from "../../node";

export abstract class AbstractEvent<P extends Node<ConversationTypes>> implements Node<ConversationEventType> {
  type: ConversationEventType = "ConversationEvent";
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: P;
  diagnostics?: Diagnostic[] = [];

  event: string;

  constructor(uri: string, event: string, range: [offsetStart: number, offsetEnd?: number], parent: P) {
    this.uri = uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    this.event = event;
  }
}