import Event from "betonquest-utils/betonquest/Event";

import { EventArgumentType } from "../../node";
import { ElementArgumentMandatory } from "../Element/ElementArgumentMandatory";

export class EventArgumentMandatory extends ElementArgumentMandatory<Event> {
  type: EventArgumentType = 'EventArgument';
}
