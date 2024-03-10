import { Pair, Scalar } from "yaml";

import { Node, NodeType } from "../node";

export abstract class ListElement<T extends NodeType> implements Node<T> {
  type: T;
  uri?: string;
  abstract offsetStart?: number;
  abstract offsetEnd?: number;
  parent?: Node<NodeType>;
  abstract options?: Node<NodeType>[];
  yaml?: Pair<Scalar<string>, Scalar<string>>;

  constructor(type: T, parent?: Node<NodeType>, ) {
    this.type = type;
    this.parent = parent;
    this.uri = parent?.uri;
  }
};
