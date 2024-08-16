import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { EventArgumentValueType } from "../../node";
import { AbstractValue } from "../Argument/AbstractValue";
import { EventArgumentMandatory } from "./EventArgumentMandatory";
import { EventArgumentOptional } from "./EventArgumentOptional";

export class EventArgumentValue extends AbstractValue<EventArgumentValueType, EventArgumentMandatory | EventArgumentOptional> {
  readonly type: EventArgumentValueType = "EventArgumentValue";

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