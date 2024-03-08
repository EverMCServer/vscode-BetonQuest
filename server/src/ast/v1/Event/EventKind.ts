import { Pair, Scalar } from "yaml";
import { EventEntryType, EventKindType, Node } from "../../node";

export class EventKind implements Node<EventKindType> {
  type: EventKindType = "EventKind";
  uri?: string;
  startOffset?: number;
  endOffset?: number;
  parent?: Node<EventEntryType>;

  kind: string;

  constructor(value: Scalar<string>, parent?: Node<EventEntryType>) {
    this.uri = parent?.uri;
    this.startOffset = value.range?.[0];
    this.parent = parent;

    this.kind = value.value.split(" ", 2)[0];
    this.endOffset = this.startOffset ? (this.startOffset + this.kind.length) : undefined;
  }
}