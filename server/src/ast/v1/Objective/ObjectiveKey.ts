import { Scalar } from "yaml";
import { ObjectiveKeyType, Node } from "../../node";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { HoverInfo } from "../../../utils/hover";

export class ObjectiveKey implements Node<ObjectiveKeyType> {
  type: ObjectiveKeyType = "ObjectiveKey";
  uri?: string | undefined;
  offsetStart?: number | undefined;
  offsetEnd?: number | undefined;
  parent?: ObjectiveEntry | undefined;

  value: string;

  constructor(key: Scalar<string>, parent: ObjectiveEntry) {
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