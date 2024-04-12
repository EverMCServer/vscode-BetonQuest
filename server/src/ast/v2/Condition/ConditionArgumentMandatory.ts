import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionArgumentType } from "../../node";
import { ElementArgumentMandatory } from "../Element/ElementArgumentMandatory";

export class ConditionArgumentMandatory extends ElementArgumentMandatory<Condition> {
  type: ConditionArgumentType = 'ConditionArgument';
}
