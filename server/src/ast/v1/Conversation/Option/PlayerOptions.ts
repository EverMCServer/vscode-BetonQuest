import { Pair, Scalar, YAMLMap } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ConversationPlayerOptionsType, ConversationTypes, Node } from "../../../node";
import { Conversation } from "./../Conversation";

export class PlayerOptions extends Node<ConversationPlayerOptionsType> {
  type: ConversationPlayerOptionsType = 'ConversationPlayerOptions';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // Cache the parsed yaml document
  yml?: Pair<Scalar<string>, YAMLMap<Scalar<string>>>;
  options?: YAMLMap<Scalar<string>>; // TODO

  constructor(yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>, parent: Conversation) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}