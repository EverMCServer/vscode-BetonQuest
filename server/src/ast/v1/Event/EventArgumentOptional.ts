import Event from "betonquest-utils/betonquest/Event";

import { EventArgumentType } from "../../node";
import { ElementArgumentOptional } from "../Element/ElementArgumentOptional";

export class EventArgumentOptional extends ElementArgumentOptional<Event> {
  type: EventArgumentType = 'EventArgument';
}

// new EventArgumentOptional().parent;
