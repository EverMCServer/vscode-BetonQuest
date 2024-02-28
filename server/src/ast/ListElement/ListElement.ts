import { Node, NodeType } from "../node";

export abstract class ListElement<T extends NodeType> implements Node<T> {
  type: T;
  uri?: string;
  abstract startOffset?: number;
  abstract endOffset?: number;
  parent?: Node<NodeType>;
  abstract children?: Node<NodeType>[];

  constructor(kind: T, parent?: Node<NodeType>, ) {
    this.type = kind;
    this.parent = parent;
    this.uri = parent?.uri;
  }
};
