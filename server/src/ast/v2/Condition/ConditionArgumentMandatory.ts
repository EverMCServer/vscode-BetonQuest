import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentMandatoryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { praseArgument } from "../Argument/praseArgument";
import { ConditionArguments } from "./ConditionArguments";

export class ConditionArgumentMandatory extends AbstractNodeV2<ConditionArgumentMandatoryType> {
  readonly type: ConditionArgumentMandatoryType = 'ConditionArgumentMandatory';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private pattern: ArgumentsPatternMandatory;

  constructor(
    argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ConditionArguments,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
    this.pattern = pattern;

    // Parse argumentStr
    praseArgument(this.argumentStr, [this.offsetStart, this.offsetEnd], this.pattern, this);
  }
}
