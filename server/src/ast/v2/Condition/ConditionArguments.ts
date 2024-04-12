
import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionArgumentsType } from "../../node";
import { ElementArguments } from "../Element/ElementArguments";
import { ConditionArgumentMandatory } from "./ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./ConditionArgumentOptional";

export class ConditionArguments extends ElementArguments<Condition> {
  type: ConditionArgumentsType = "ConditionArguments";

  newArgumentMandatory(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternMandatory): ConditionArgumentMandatory {
    return new ConditionArgumentMandatory(argumentStr, range, pattern, this);
  }
  newArgumentOptional(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternOptional): ConditionArgumentOptional {
    return new ConditionArgumentOptional(argumentStr, range, pattern, this);
  }

}
