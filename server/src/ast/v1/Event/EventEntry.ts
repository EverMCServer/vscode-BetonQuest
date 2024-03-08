import { Pair, Scalar } from "yaml";
import { EventEntryType, EventListType, Node, NodeType } from "../../node";
import { EventKind } from "./EventKind";

export class EventEntry implements Node<EventEntryType> {
  type: EventEntryType = "EventEntry";
  uri?: string;
  startOffset?: number;
  endOffset?: number;
  parent?: Node<NodeType>;

  // yamlKey: Scalar<string>; // a.k.a EventKey
  eventKind: EventKind;
  // eventOptions: Scalar<string>;
  
  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: Node<EventListType>) {
    this.uri = parent.uri;
    this.startOffset = pair.key?.range?.[0];
    this.endOffset = pair.value?.range?.[1];
    this.parent = parent;

    this.eventKind = new EventKind(pair.value!, this);
  }
}