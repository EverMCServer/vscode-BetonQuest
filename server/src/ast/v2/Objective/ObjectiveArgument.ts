import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveArgumentType } from "../../node";
import { ElementArgument } from "../Element/ElementArgument";

export abstract class ObjectiveArgument extends ElementArgument<Objective> {
  type: ObjectiveArgumentType = "ObjectiveArgument";
}
