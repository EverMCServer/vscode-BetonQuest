import { Pair, Scalar, YAMLMap } from "yaml";
import { Diagnostic } from "vscode-languageserver";

import { ConversationTypes, Node } from "../../node";
import { Conversation } from "./Conversation";
import { AbstractTextTranslations } from "./AbstractTextTranslations";

export abstract class AbstractText<NT extends ConversationTypes, TT extends AbstractTextTranslations<ConversationTypes>> implements Node<NT> {
  abstract type: NT;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics?: Diagnostic[];

  yml: Pair<Scalar<string>, unknown>;
  contentType?: 'string' | 'translations';
  contentString?: string;
  contentTranslations?: TT;

  constructor(uri: string, pair: Pair<Scalar<string>, unknown>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;

    this.yml = pair;

    // Parse YAML
    if (pair.value instanceof Scalar && typeof pair.value.value === 'string') {
      this.contentType = 'string';
      this.contentString = pair.value.value;
    } else if (pair.value instanceof YAMLMap) {
      this.contentType = 'translations';
      this.contentTranslations = this.newTranslations(uri, pair.value);
    }
  }

  abstract newTranslations(uri: string, pair: YAMLMap<Scalar<string>, Scalar<string>>): TT ;
}
