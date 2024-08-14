import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentKeyType } from "../../node";
import { AbstractKey } from "../Argument/AbstractKey";
import { ConditionArgumentMandatory } from "./ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./ConditionArgumentOptional";

export class ConditionArgumentKey extends AbstractKey<ConditionArgumentKeyType, ConditionArgumentMandatory | ConditionArgumentOptional> {
  readonly type: ConditionArgumentKeyType = "ConditionArgumentKey";

  constructor(
    valueStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional | undefined,
    parent: ConditionArgumentMandatory | ConditionArgumentOptional,
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