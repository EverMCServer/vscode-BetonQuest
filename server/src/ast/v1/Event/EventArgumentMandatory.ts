import Event from "betonquest-utils/betonquest/Event";

import { EventArgumentType } from "../../node";
import { ElementArgumentMandatory } from "../Element/ElementArgumentMandatory";
import { EventArguments } from "./EventArguments";
import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

export class EventArgumentMandatory extends ElementArgumentMandatory<Event> {
  readonly type: EventArgumentType = 'EventArgument';
  readonly parent: EventArguments;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: EventArguments,
  ) {
    super(argumentStr, range, pattern, parent);
    this.parent = parent;
  }
}
