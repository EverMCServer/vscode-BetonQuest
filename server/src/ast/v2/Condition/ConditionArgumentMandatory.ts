import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentMandatoryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { parseArgument } from "../Argument/parseArgument";
import { ConditionArguments } from "./ConditionArguments";

export class ConditionArgumentMandatory extends AbstractNodeV2<ConditionArgumentMandatoryType> {
  readonly type: ConditionArgumentMandatoryType = 'ConditionArgumentMandatory';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private pattern: ArgumentsPatternMandatory;

  constructor(
    argumentStr: string,
    range: [offsetStart: number, stringStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ConditionArguments,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[2];
    this.parent = parent;

    this.argumentStr = argumentStr;
    this.pattern = pattern;

    // Parse argumentStr
    parseArgument(this.argumentStr, range, this.pattern, this);
  }
}
