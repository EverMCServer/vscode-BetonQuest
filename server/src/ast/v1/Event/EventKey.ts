import Event from "betonquest-utils/betonquest/Event";

import { EventKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";

export class EventKey extends ElementKey<Event> {
  type: EventKeyType = "EventKey";
}
