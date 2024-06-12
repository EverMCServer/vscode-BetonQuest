import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveArgumentType } from "../../node";
import { ElementArgumentMandatory } from "../Element/ElementArgumentMandatory";
import { ObjectiveArguments } from "./ObjectiveArguments";
import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

export class ObjectiveArgumentMandatory extends ElementArgumentMandatory<Objective> {
  readonly type: ObjectiveArgumentType = 'ObjectiveArgument';
  readonly parent: ObjectiveArguments;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ObjectiveArguments,
  ) {
    super(argumentStr, range, pattern, parent);
    this.parent = parent;
  }
}
