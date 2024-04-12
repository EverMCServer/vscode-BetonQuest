import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v2/Element";
import Event from "betonquest-utils/betonquest/Event";

import { EventKindType } from "../../node";
import { ElementKind } from "../Element/ElementKind";

export class EventKind extends ElementKind<Event> {
  type: EventKindType = "EventKind";
}
