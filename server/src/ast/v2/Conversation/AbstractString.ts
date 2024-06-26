import { Scalar } from "yaml";
import { NodeType } from "../../node";
import { AbstractNodeV2 } from "../../v2";

export abstract class AbstractString<T extends NodeType> extends AbstractNodeV2<T> {
  readonly offsetStart?: number;
  readonly offsetEnd?: number;

  private yml: Scalar;

  private value?: string;

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