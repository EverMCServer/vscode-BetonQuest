import { Scalar } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ConversationInterceptorType, Node } from "../../node";
import { Conversation } from "./Conversation";

export class ConversationInterceptor extends Node<ConversationInterceptorType> {
  type: ConversationInterceptorType = 'ConversationInterceptor';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // Cache the parsed yaml document
  yml: Scalar;
  interceptors: string[] = [];

  constructor(uri: string, yml: Scalar, parent: Conversation) {
    super();
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}