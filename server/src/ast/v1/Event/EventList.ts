import { Pair, Scalar } from "yaml";

import Event from "betonquest-utils/betonquest/Event";

import { EventListType } from "../../node";
import { EventEntry } from "./EventEntry";
import { ElementList } from "../Element/ElementList";

export class EventList extends ElementList<Event> {
  type: EventListType = "EventList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): EventEntry {
    return new EventEntry(pair, this);
  }

}
