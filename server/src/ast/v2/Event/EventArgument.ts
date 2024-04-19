import Event from "betonquest-utils/betonquest/Event";

import { EventArgumentType } from "../../node";
import { ElementArgument } from "../Element/ElementArgument";

export abstract class EventArgument extends ElementArgument<Event> {
  type: EventArgumentType = "EventArgument";
}
