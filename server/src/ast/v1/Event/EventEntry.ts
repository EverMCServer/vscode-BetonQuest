import { Pair, Scalar } from "yaml";

import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";
import { kinds } from "betonquest-utils/betonquest/v1/Events";
import Event from "betonquest-utils/betonquest/Event";

import { EventEntryType } from "../../node";
import { EventKind } from "./EventKind";
import { EventKey } from "./EventKey";
import { EventArguments } from "./EventArguments";
import { EventList } from "./EventList";
import { ElementEntry } from "../Element/ElementEntry";

export class EventEntry extends ElementEntry<Event> {
  type: EventEntryType = "EventEntry";

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: EventList) {
    super(pair, kinds, parent);
  }

  newKey(key: Scalar<string>): EventKey {
    return new EventKey(key, this);
  }

  newKind(value: string, range: [number?, number?], kindConfig?: _ElementKind<Event>): EventKind {
    return new EventKind(value, range, kindConfig, this);
  }

  newArguments(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig?: _ElementKind<Event>): EventArguments {
    return new EventArguments(argumentsSourceStr, range, indent, kindConfig, this);
  }
}