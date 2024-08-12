import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import { ConditionArgumentValueType } from "../../node";
import { AbstractValue } from "../Argument/AbstractValue";
import { ConditionArgumentMandatory } from "./ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./ConditionArgumentOptional";

export class ConditionArgumentValue extends AbstractValue<ConditionArgumentValueType, ConditionArgumentMandatory | ConditionArgumentOptional> {
  readonly type: ConditionArgumentValueType = "ConditionArgumentValue";

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