import { Pair, Scalar } from "yaml";
import { Diagnostic } from "vscode-languageserver";

import { ConversationFirstType, Node } from "../../node";
import { Conversation } from "./Conversation";

export class ConversationFirst implements Node<ConversationFirstType> {
  type: ConversationFirstType = 'ConversationFirst';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics?: Diagnostic[];

  // Cache the parsed yaml document
  yml: Pair<Scalar<string>, Scalar<string>>;
  npcOptions: string[] = [];

  constructor(uri: string, yml: Pair<Scalar<string>, Scalar<string>>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}