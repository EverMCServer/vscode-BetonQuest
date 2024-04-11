import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";

export class ObjectiveKey extends ElementKey<Objective> {
  type: ObjectiveKeyType = "ObjectiveKey";
}
