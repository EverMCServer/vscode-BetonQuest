
import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import Event from "betonquest-utils/betonquest/Event";

import { EventArgumentsType } from "../../node";
import { ElementArguments } from "../Element/ElementArguments";
import { EventArgumentMandatory } from "./EventArgumentMandatory";
import { EventArgumentOptional } from "./EventArgumentOptional";

export class EventArguments extends ElementArguments<Event> {
  type: EventArgumentsType = "EventArguments";

  newArgumentMandatory(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternMandatory): EventArgumentMandatory {
    return new EventArgumentMandatory(argumentStr, range, pattern, this);
  }
  newArgumentOptional(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternOptional): EventArgumentOptional {
    return new EventArgumentOptional(argumentStr, range, pattern, this);
  }

}
