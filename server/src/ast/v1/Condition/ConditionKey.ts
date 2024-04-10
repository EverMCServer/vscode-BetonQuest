import { Scalar } from "yaml";
import { ConditionKeyType, Node } from "../../node";
import { ConditionEntry } from "./ConditionEntry";
import { HoverInfo } from "../../../utils/hover";

export class ConditionKey implements Node<ConditionKeyType> {
  type: ConditionKeyType = "ConditionKey";
  uri?: string | undefined;
  offsetStart?: number | undefined;
  offsetEnd?: number | undefined;
  parent?: ConditionEntry | undefined;

  value: string;

  constructor(key: Scalar<string>, parent: ConditionEntry) {
    this.uri = parent.uri;
    this.offsetStart = key.range?.[0];
    this.offsetEnd = key.range?.[1];
    this.parent = parent;

    this.value = key.value;
  }

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return [
        {
          content: "(full path: " + this.value + ")",
          offset: [this.offsetStart, this.offsetEnd]
        },
      ];
    }
    return [];
  }
}