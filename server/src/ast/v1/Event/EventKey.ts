import { Scalar } from "yaml";
import { EventKeyType, Node } from "../../node";
import { EventEntry } from "./EventEntry";
import { HoverInfo } from "../../../utils/hover";

export class EventKey implements Node<EventKeyType> {
  type: EventKeyType = "EventKey";
  uri?: string | undefined;
  offsetStart?: number | undefined;
  offsetEnd?: number | undefined;
  parent?: EventEntry | undefined;

  value: string;

  constructor(key: Scalar<string>, parent: EventEntry) {
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