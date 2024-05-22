import { Pair, Scalar } from "yaml";

import Event from "betonquest-utils/betonquest/Event";

import { EventListType } from "../../node";
import { EventEntry } from "./EventEntry";
import { ElementList } from "../Element/ElementList";

export class EventList extends ElementList<Event, EventEntry> {
  type: EventListType = "EventList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): EventEntry {
    return new EventEntry(pair, this);
  }

  getEventEntries(id: string, packageUri: string): EventEntry[] {
    if (this.parent.isPackageUri(packageUri)) {
      return this.entries.filter(entry => entry.elementKey.value === id);
    } else {
      return this.parent.getEventEntries(id, packageUri);
    }
  }

}
