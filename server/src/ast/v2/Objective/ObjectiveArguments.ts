
import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveArgumentsType } from "../../node";
import { ElementArguments } from "../Element/ElementArguments";
import { ObjectiveArgumentMandatory } from "./ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "./ObjectiveArgumentOptional";

export class ObjectiveArguments extends ElementArguments<Objective> {
  type: ObjectiveArgumentsType = "ObjectiveArguments";

  newArgumentMandatory(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternMandatory): ObjectiveArgumentMandatory {
    return new ObjectiveArgumentMandatory(argumentStr, range, pattern, this);
  }
  newArgumentOptional(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternOptional): ObjectiveArgumentOptional {
    return new ObjectiveArgumentOptional(argumentStr, range, pattern, this);
  }

}
