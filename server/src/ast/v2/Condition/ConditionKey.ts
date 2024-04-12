import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";

export class ConditionKey extends ElementKey<Condition> {
  type: ConditionKeyType = "ConditionKey";
}
