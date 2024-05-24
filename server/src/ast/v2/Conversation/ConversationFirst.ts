import { Scalar } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ConversationFirstType, NodeV2 } from "../../node";
import { ConversationSection } from "./Conversation";

export class ConversationFirst extends NodeV2<ConversationFirstType> {
  type: ConversationFirstType = 'ConversationFirst';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: ConversationSection;

  // Cache the parsed yaml document
  yml: Scalar;
  npcOptions: string[] = []; // TODO

  constructor(yml: Scalar, parent: ConversationSection) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}