import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveKindType } from "../../node";
import { ElementKind } from "../Element/ElementKind";

export class ObjectiveKind extends ElementKind<Objective> {
  type: ObjectiveKindType = "ObjectiveKind";
}
