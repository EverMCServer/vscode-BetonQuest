import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionKindType } from "../../node";
import { ElementKind } from "../Element/ElementKind";

export class ConditionKind extends ElementKind<Condition> {
  type: ConditionKindType = "ConditionKind";
}
