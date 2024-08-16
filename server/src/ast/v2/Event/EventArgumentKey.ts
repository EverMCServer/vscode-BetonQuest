import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { EventArgumentKeyType } from "../../node";
import { AbstractKey } from "../Argument/AbstractKey";
import { EventArgumentMandatory } from "./EventArgumentMandatory";
import { EventArgumentOptional } from "./EventArgumentOptional";

export class EventArgumentKey extends AbstractKey<EventArgumentKeyType, EventArgumentMandatory | EventArgumentOptional> {
  readonly type: EventArgumentKeyType = "EventArgumentKey";

  constructor(
    valueStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional | undefined,
    parent: EventArgumentMandatory | EventArgumentOptional,
  ) {
    super(
      valueStr,
      offsets,
      // isMandatory,
      pattern,
      parent);
  }

  getThis() {
    return this;
  }
}