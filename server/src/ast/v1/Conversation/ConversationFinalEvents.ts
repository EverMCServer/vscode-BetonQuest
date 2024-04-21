import { Pair, Scalar } from "yaml";
import { Diagnostic } from "vscode-languageserver";

import { ConversationFinalEventsType, Node } from "../../node";
import { Conversation } from "./Conversation";

export class ConversationFinalEvents implements Node<ConversationFinalEventsType> {
  type: ConversationFinalEventsType = 'ConversationFinalEvents';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics?: Diagnostic[];

  // Cache the parsed yaml document
  yml: Pair<Scalar<string>, Scalar<string>>;
  events: string[] = [];

  constructor(uri: string, yml: Pair<Scalar<string>, Scalar<string>>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}