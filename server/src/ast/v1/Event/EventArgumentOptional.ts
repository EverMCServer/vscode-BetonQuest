
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import { EventArgumentType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { EventArguments } from "./EventArguments";

export class EventArgumentOptional extends AbstractNodeV1<EventArgumentType> {
  readonly type: EventArgumentType = 'EventArgument'; // TODO remove Mandatory / Optional
  offsetStart?: number;
  offsetEnd?: number;
  readonly parent: EventArguments;

  argumentStr: string;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
    parent: EventArguments,
  ) {
    super();
    this.parent = parent;

    this.offsetStart = range[0];
    this.offsetEnd = range[1];

    // Parse argumentStr
    this.argumentStr = argumentStr;

    // Check format
  }
}

