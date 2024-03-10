import { EventKindType, Node } from "../../node";
import { EventEntry } from "./EventEntry";

export class EventKind implements Node<EventKindType> {
  type: EventKindType = "EventKind";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventEntry;

  value: string;

  constructor(value: string, range: [number?, number?], parent?: EventEntry) {
    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    this.value = value;
  }
}