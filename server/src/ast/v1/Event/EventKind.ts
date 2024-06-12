import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Event from "betonquest-utils/betonquest/Event";

import { EventKindType } from "../../node";
import { ElementKind } from "../Element/ElementKind";
import { EventEntry } from "./EventEntry";

export class EventKind extends ElementKind<Event> {
  readonly type: EventKindType = "EventKind";
  readonly parent: EventEntry;

  constructor(value: string, range: [number?, number?], kindConfig: _ElementKind<Event>, parent: EventEntry) {
    super(value, range, kindConfig, parent);
    this.parent = parent;
  }
}
