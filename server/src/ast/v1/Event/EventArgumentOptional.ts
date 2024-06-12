import Event from "betonquest-utils/betonquest/Event";

import { EventArgumentType } from "../../node";
import { ElementArgumentOptional } from "../Element/ElementArgumentOptional";
import { EventArguments } from "./EventArguments";
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

export class EventArgumentOptional extends ElementArgumentOptional<Event> {
  readonly type: EventArgumentType = 'EventArgument';
  readonly parent: EventArguments;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
    parent: EventArguments,
  ) {
    super(argumentStr, range, pattern, parent);
    this.parent = parent;
  }
}

// new EventArgumentOptional().parent;
