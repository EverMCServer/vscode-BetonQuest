import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v2/Element";
import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveKindType } from "../../node";
import { ElementKind } from "../Element/ElementKind";

export class ObjectiveKind extends ElementKind<Objective> {
  type: ObjectiveKindType = "ObjectiveKind";
}
