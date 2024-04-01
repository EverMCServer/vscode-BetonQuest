import { Scalar } from "yaml";
import { EventKeyType, Node } from "../../node";
import { EventEntry } from "./EventEntry";

export class EventKey implements Node<EventKeyType> {
  type: "EventKey" = "EventKey";
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

  getHoverInfo(uri: string, offset: number): string[] {
    if (this.offsetStart && this.offsetEnd && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return ["(full path: " + this.value + ")"];
    }
    return [];
  }
}