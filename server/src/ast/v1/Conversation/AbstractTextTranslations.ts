import { Scalar, YAMLMap } from "yaml";
import { Diagnostic } from "vscode-languageserver";

import { ConversationTypes, Node } from "../../node";

export abstract class AbstractTextTranslations<N extends ConversationTypes> implements Node<N> {
  abstract type: N;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Node<ConversationTypes>;
  diagnostics?: Diagnostic[];

  yml: YAMLMap<Scalar<string>, Scalar<string>>;

  constructor(uri: string, yml: YAMLMap<Scalar<string>, Scalar<string>>, parent: Node<ConversationTypes>) {
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;
  }
}
