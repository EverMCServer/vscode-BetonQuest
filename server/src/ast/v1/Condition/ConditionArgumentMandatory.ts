
import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";
import { ConditionArgumentMandatoryType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ConditionArguments } from "./ConditionArguments";

export class ConditionArgumentMandatory extends AbstractNodeV1<ConditionArgumentMandatoryType> {
  readonly type: ConditionArgumentMandatoryType = 'ConditionArgumentMandatory'; // TODO remove Mandatory / Optional
  offsetStart?: number;
  offsetEnd?: number;
  readonly parent: ConditionArguments;

  argumentStr: string;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ConditionArguments,
  ) {
    super();
    this.parent = parent;

    this.offsetStart = range[0];
    this.offsetEnd = range[1];

    // Parse argumentStr
    this.argumentStr = argumentStr;

    // Check format
  }
}
