import { DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ArgumentKeyType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";
import { EventArgumentMandatory } from "../Event/EventArgumentMandatory";
import { EventArgumentOptional } from "../Event/EventArgumentOptional";
import { ObjectiveArgumentMandatory } from "../Objective/ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "../Objective/ObjectiveArgumentOptional";

export class ArgumentKey extends AbstractNodeV1<ArgumentKeyType> {
  readonly type: ArgumentKeyType = "ArgumentKey";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConditionArgumentMandatory | ConditionArgumentOptional | EventArgumentMandatory | EventArgumentOptional | ObjectiveArgumentMandatory | ObjectiveArgumentOptional;

  private keyStr: string;
  private pattern?: ArgumentsPatternMandatory | ArgumentsPatternOptional;

  constructor(
    keyStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional | undefined,
    parent: ConditionArgumentMandatory | ConditionArgumentOptional | EventArgumentMandatory | EventArgumentOptional | ObjectiveArgumentMandatory | ObjectiveArgumentOptional,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.keyStr = keyStr;
    this.pattern = pattern;

    // Parse key
    if (this.pattern?.key && this.keyStr !== this.pattern.key) {
      this.addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Incorrect key. Should be "${this.pattern.key}".`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentKeyIncorrect,
        [{
          title: `Change to "${this.pattern.key}"`,
          text: this.pattern.key
        }]
      );
    }
  }

}
