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
  yml?: Pair<Scalar<string>>;
  ymlValue?: YAMLMap<Scalar<string>>; // TODO

  constructor(uri: string, yml: Pair<Scalar<string>>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;

    // Check YAML value type
    this.yml = yml;
    if (yml.value instanceof YAMLMap) {
      this.ymlValue = yml.value;
    } else {
      // TODO: throw diagnostics
    }

    // ...
  }
}