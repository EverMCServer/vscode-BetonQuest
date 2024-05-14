import { Scalar } from "yaml";
import { NodeV1, NodeType } from "../../node";
import { AbstractText } from "./AbstractText";

export abstract class AbstractString<T extends NodeType> extends NodeV1<T> {

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