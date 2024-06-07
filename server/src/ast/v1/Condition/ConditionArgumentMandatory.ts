import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionArgumentType } from "../../node";
import { ElementArgumentMandatory } from "../Element/ElementArgumentMandatory";
import { ConditionArguments } from "./ConditionArguments";
import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

export class ConditionArgumentMandatory extends ElementArgumentMandatory<Condition> {
  readonly type: ConditionArgumentType = 'ConditionArgument';
  readonly parent: ConditionArguments;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ConditionArguments,
  ) {
    super(argumentStr, range, pattern, parent);
    this.parent = parent;
  }
}
