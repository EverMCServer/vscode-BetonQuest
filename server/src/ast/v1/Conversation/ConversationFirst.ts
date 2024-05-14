import { Scalar } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ConversationFirstType, NodeV1 } from "../../node";
import { Conversation } from "./Conversation";

export class ConversationFirst extends NodeV1<ConversationFirstType> {
  type: ConversationFirstType = 'ConversationFirst';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: Conversation;

  // Cache the parsed yaml document
  yml: Scalar;
  npcOptions: string[] = []; // TODO

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}