import { Pair, Scalar } from "yaml";

import { EventEntryType, Node } from "../../node";
import { EventKind } from "./EventKind";
import { EventKey } from "./EventKey";
import { EventOptions } from "./EventOptions";
import { EventList } from "./EventList";

export class EventEntry implements Node<EventEntryType> {
  type: EventEntryType = "EventEntry";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventList;

  yaml: Pair<Scalar<string>, Scalar<string>>;

  eventKey: EventKey;
  eventKind?: EventKind;
  eventOptions?: EventOptions;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: EventList) {
    this.uri = parent.uri;
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yaml = pair;

    // Parse YAML key
    this.eventKey = new EventKey(pair.key, this);

    // Parse value
    const pos = pair.value?.value.indexOf(" ") ?? -1;
    const kindStr = pair.value?.value.slice(0, pos);
    const optionsStr = pair.value?.value.slice(pos + 1, pair.value?.value.length);
    if (kindStr) {

      // Parse Kind
      const offsetKindStart = pair.value?.range?.[0];
      const offsetKindEnd = offsetKindStart ? offsetKindStart + kindStr.length : undefined;
      this.eventKind = new EventKind(kindStr, [offsetKindStart, offsetKindEnd], this);
    
      // Parse Options
      if (optionsStr) {
        const offsetOptionsStart = offsetKindEnd ? offsetKindEnd + 1 : undefined;
        const offsetOptionsEnd = this.offsetEnd;
        this.eventOptions = new EventOptions(optionsStr, [offsetOptionsStart, offsetOptionsEnd], kindStr, this);
      }
    }

  }
}