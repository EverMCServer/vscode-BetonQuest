import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveArgumentType } from "../../node";
import { ElementArgumentOptional } from "../Element/ElementArgumentOptional";

export class ObjectiveArgumentOptional extends ElementArgumentOptional<Objective> {
  type: ObjectiveArgumentType = 'ObjectiveArgument';
}

// new ObjectiveArgumentOptional().parent;
