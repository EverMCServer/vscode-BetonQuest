import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ObjectiveArgumentKeyType } from "../../node";
import { AbstractKey } from "../Argument/AbstractKey";
import { ObjectiveArgumentMandatory } from "./ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "./ObjectiveArgumentOptional";

export class ObjectiveArgumentKey extends AbstractKey<ObjectiveArgumentKeyType, ObjectiveArgumentMandatory | ObjectiveArgumentOptional> {
  readonly type: ObjectiveArgumentKeyType = "ObjectiveArgumentKey";

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