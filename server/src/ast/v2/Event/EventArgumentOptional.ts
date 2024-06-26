
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import { EventArgumentOptionalType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { EventArguments } from "./EventArguments";

export class EventArgumentOptional extends AbstractNodeV2<EventArgumentOptionalType> {
  readonly type: EventArgumentOptionalType = 'EventArgumentOptional'; // TODO remove Mandatory / Optional
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
