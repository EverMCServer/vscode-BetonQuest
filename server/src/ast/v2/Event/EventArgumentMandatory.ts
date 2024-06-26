
import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";
import { EventArgumentMandatoryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { EventArguments } from "./EventArguments";

export class EventArgumentMandatory extends AbstractNodeV2<EventArgumentMandatoryType> {
  readonly type: EventArgumentMandatoryType = 'EventArgumentMandatory'; // TODO remove Mandatory / Optional
  offsetStart?: number;
  offsetEnd?: number;
  readonly parent: EventArguments;

  argumentStr: string;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
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
