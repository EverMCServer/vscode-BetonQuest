import { Scalar } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ConversationFirstType, Node } from "../../node";
import { Conversation } from "./Conversation";

export class ConversationFirst extends Node<ConversationFirstType> {
  type: ConversationFirstType = 'ConversationFirst';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // Cache the parsed yaml document
  yml: Scalar;
  npcOptions: string[] = []; // TODO

  constructor(uri: string, yml: Scalar, parent: Conversation) {
    super();
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}