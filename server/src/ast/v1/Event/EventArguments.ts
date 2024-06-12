
import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import { ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Event from "betonquest-utils/betonquest/Event";

import { EventArgumentsType } from "../../node";
import { ElementArguments } from "../Element/ElementArguments";
import { EventArgumentMandatory } from "./EventArgumentMandatory";
import { EventArgumentOptional } from "./EventArgumentOptional";
import { EventEntry } from "./EventEntry";

export class EventArguments extends ElementArguments<Event> {
  readonly type: EventArgumentsType = "EventArguments";
  readonly parent: EventEntry;

  constructor(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig: ElementKind<Event>, parent: EventEntry) {
    super(argumentsSourceStr, range, indent, kindConfig, parent);
    this.parent = parent;
  }
  newArgumentMandatory(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternMandatory): EventArgumentMandatory {
    return new EventArgumentMandatory(argumentStr, range, pattern, this);
  }
  newArgumentOptional(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternOptional): EventArgumentOptional {
    return new EventArgumentOptional(argumentStr, range, pattern, this);
  }

}
