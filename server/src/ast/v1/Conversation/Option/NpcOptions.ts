import { Pair, Scalar, YAMLMap } from "yaml";
import { Diagnostic } from "vscode-languageserver";

import { ConversationNpcOptionsType, ConversationTypes, Node } from "../../../node";
import { Conversation } from "./../Conversation";

export class NpcOptions implements Node<ConversationNpcOptionsType> {
  type: ConversationNpcOptionsType = 'ConversationNpcOptions';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics?: Diagnostic[];

  // Cache the parsed yaml document
  yml?: Pair<Scalar<string>, YAMLMap<Scalar<string>>>;
  options?: YAMLMap<Scalar<string>>; // TODO

  constructor(uri: string, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;

    // TODO

    // ...
  }
}