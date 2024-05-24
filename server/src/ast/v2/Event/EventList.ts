import { Pair, Scalar, YAMLMap } from "yaml";

import Event from "betonquest-utils/betonquest/Event";

import { EventListType } from "../../node";
import { EventEntry } from "./EventEntry";
import { ElementList, ElementListSection } from "../Element/ElementList";
import { TextDocument } from "vscode-languageserver-textdocument";

export class EventList extends ElementList<Event> {
  type: EventListType = "EventList";

  addSection(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>, unknown>): void {
    this.entriesSections.push(new EventListSection(uri, document, yml, this));
  }

  getEventEntries(id: string, packageUri: string): EventEntry[] {
    return this.entriesSections.flatMap(section => section.getEventEntries(id, packageUri));
  }
}

export class EventListSection extends ElementListSection<Event> {
  type: EventListType = "EventList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): EventEntry {
    return new EventEntry(pair, this);
  }

}
