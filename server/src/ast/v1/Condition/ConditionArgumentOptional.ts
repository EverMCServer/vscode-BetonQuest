import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionArgumentType } from "../../node";
import { ElementArgumentOptional } from "../Element/ElementArgumentOptional";

export class ConditionArgumentOptional extends ElementArgumentOptional<Condition> {
  type: ConditionArgumentType = 'ConditionArgument';
}

// new ConditionArgumentOptional().parent;
