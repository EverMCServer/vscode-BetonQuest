import { Scalar } from "yaml";
import { Node, NodeType } from "../../node";
import { AbstractText } from "./AbstractText";

export abstract class AbstractString<T extends NodeType> extends Node<T> {

  yml: Scalar;

  value?: string;

  constructor(yml: Scalar, parent: string) {
    super();
    this.yml = yml;
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];

    if (typeof yml.value === "string") {
      this.value = yml.value;
    }
  }
}