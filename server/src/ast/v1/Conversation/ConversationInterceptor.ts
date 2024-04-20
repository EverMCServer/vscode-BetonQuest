import { Pair, Scalar } from "yaml";
import { Diagnostic } from "vscode-languageserver";

import { ConversationInterceptorType, ConversationTypes, Node } from "../../node";
import { Conversation } from "./Conversation";

export class ConversationInterceptor implements Node<ConversationInterceptorType> {
  type: ConversationInterceptorType = 'ConversationInterceptor';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics?: Diagnostic[];

  // Cache the parsed yaml document
  yml?: Pair<Scalar<string>>;
  ymlValue?: Scalar<string>; // TODO

  constructor(uri: string, yml: Pair<Scalar<string>>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;

    // Check YAML value type
    this.yml = yml;
    if (yml.value instanceof Scalar && typeof yml.value.value === 'string') {
      this.ymlValue = yml.value;
    } else {
      // TODO: throw diagnostics
    }

    // ...
  }
}