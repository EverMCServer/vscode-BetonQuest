
import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import { ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionArgumentsType } from "../../node";
import { ElementArguments } from "../Element/ElementArguments";
import { ConditionArgumentMandatory } from "./ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./ConditionArgumentOptional";
import { ConditionEntry } from "./ConditionEntry";

export class ConditionArguments extends ElementArguments<Condition> {
  readonly type: ConditionArgumentsType = "ConditionArguments";
  readonly parent: ConditionEntry;

  constructor(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig: ElementKind<Condition>, parent: ConditionEntry) {
    super(argumentsSourceStr, range, indent, kindConfig, parent);
    this.parent = parent;
  }
  newArgumentMandatory(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternMandatory): ConditionArgumentMandatory {
    return new ConditionArgumentMandatory(argumentStr, range, pattern, this);
  }
  newArgumentOptional(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternOptional): ConditionArgumentOptional {
    return new ConditionArgumentOptional(argumentStr, range, pattern, this);
  }

}
