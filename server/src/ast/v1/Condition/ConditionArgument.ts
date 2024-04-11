import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionArgumentType } from "../../node";
import { ElementArgument } from "../Element/ElementArgument";

export class ConditionArgument extends ElementArgument<Condition> {
  type: ConditionArgumentType = "ConditionArgument";
}
