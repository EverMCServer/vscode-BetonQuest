import { Pair, Scalar, YAMLMap } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ConversationNpcOptionsType, ConversationTypes, Node } from "../../../node";
import { Conversation } from "./../Conversation";

export class NpcOptions extends Node<ConversationNpcOptionsType> {
  type: ConversationNpcOptionsType = 'ConversationNpcOptions';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // Cache the parsed yaml document
  yml?: Pair<Scalar<string>, YAMLMap<Scalar<string>>>;
  options?: YAMLMap<Scalar<string>>; // TODO

  constructor(uri: string, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>, parent: Conversation) {
    super();
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}