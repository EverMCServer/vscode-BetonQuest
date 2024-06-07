import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionArgumentType } from "../../node";
import { ElementArgumentOptional } from "../Element/ElementArgumentOptional";
import { ConditionArguments } from "./ConditionArguments";
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

export class ConditionArgumentOptional extends ElementArgumentOptional<Condition> {
  readonly type: ConditionArgumentType = 'ConditionArgument';
  readonly parent: ConditionArguments;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
    parent: ConditionArguments,
  ) {
    super(argumentStr, range, pattern, parent);
    this.parent = parent;
  }
}

// new ConditionArgumentOptional().parent;
