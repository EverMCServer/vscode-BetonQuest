import { Pair, Scalar } from "yaml";
import { Diagnostic } from "vscode-languageserver";

import { ConversationStopType, Node } from "../../node";
import { Conversation } from "./Conversation";

export class ConversationStop implements Node<ConversationStopType> {
  type: ConversationStopType = 'ConversationStop';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics?: Diagnostic[];

  // Cache the parsed yaml document
  yml?: Scalar<string>;
  value?: boolean;

  constructor(uri: string, yml: Scalar<string>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;

    this.offsetStart = yml.range?.[0];
    this.offsetEnd = yml.range?.[1];

    // Check YAML value type
    this.yml = yml;

    // Parse value
    switch (this.yml.value.trim().toLowerCase()) {
      case 'true':
        this.value = true;
        break;
      case 'false':
        this.value = false;
        break;
      case '':
        // Not set, keep it undefined
        break;
      default:
        // TODO: Incorecct value, throw diagnostics warning + quick actions
        break;
    }

    // ...
  }
}