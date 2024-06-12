import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveArgumentType } from "../../node";
import { ElementArgumentOptional } from "../Element/ElementArgumentOptional";
import { ObjectiveArguments } from "./ObjectiveArguments";
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

export class ObjectiveArgumentOptional extends ElementArgumentOptional<Objective> {
  readonly type: ObjectiveArgumentType = 'ObjectiveArgument';
  readonly parent: ObjectiveArguments;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
    parent: ObjectiveArguments,
  ) {
    super(argumentStr, range, pattern, parent);
    this.parent = parent;
  }
}

// new ObjectiveArgumentOptional().parent;
