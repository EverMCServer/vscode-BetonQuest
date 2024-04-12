import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveArgumentType } from "../../node";
import { ElementArgumentMandatory } from "../Element/ElementArgumentMandatory";

export class ObjectiveArgumentMandatory extends ElementArgumentMandatory<Objective> {
  type: ObjectiveArgumentType = 'ObjectiveArgument';
}
