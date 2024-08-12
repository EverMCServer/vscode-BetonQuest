import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentMandatoryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArguments } from "./ConditionArguments";
import { ConditionArgumentValue } from "./ConditionArgumentValue";

export class ConditionArgumentMandatory extends AbstractNodeV2<ConditionArgumentMandatoryType> {
  readonly type: ConditionArgumentMandatoryType = 'ConditionArgumentMandatory';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private offsets: [offsetStart: number, stringStart: number, offsetEnd: number];
  private pattern: ArgumentsPatternMandatory;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ConditionArguments,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[2];
    this.parent = parent;

    this.argumentStr = argumentStr;
    this.offsets = offsets;
    this.pattern = pattern;

    // Parse argumentStr

    // Parse key
    if (this.pattern.key) {
      // TODO
    }

    // Parse value
    this.addChild(new ConditionArgumentValue(this.argumentStr, [this.offsets[1], this.offsets[2]], this.pattern, this));
  }
}
