import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ObjectiveArgumentValueType } from "../../node";
import { AbstractValue } from "../Argument/AbstractValue";
import { ObjectiveArgumentMandatory } from "./ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "./ObjectiveArgumentOptional";

export class ObjectiveArgumentValue extends AbstractValue<ObjectiveArgumentValueType, ObjectiveArgumentMandatory | ObjectiveArgumentOptional> {
  readonly type: ObjectiveArgumentValueType = "ObjectiveArgumentValue";

  constructor(
    valueStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional | undefined,
    parent: ObjectiveArgumentMandatory | ObjectiveArgumentOptional,
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