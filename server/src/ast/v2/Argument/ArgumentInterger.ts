import { DiagnosticServerCancellationData, DiagnosticSeverity } from "vscode-languageserver";
import { ArgumentEntityType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";
import { DiagnosticCode } from "../../../utils/diagnostics";

export class ArgumentInterger extends AbstractNodeV2<ArgumentEntityType> {
  readonly type: ArgumentEntityType = 'ArgumentEntity';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArgumentMandatory | ConditionArgumentOptional;

  constructor(
    argumentStr: string,
    range: [number?, number?],
    parent: ConditionArgumentMandatory | ConditionArgumentOptional,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    // Check value
    // TODO: move it to getDiagnostic() for speed optimization
    if (argumentStr.match(/[^0-9]/gm)) {
      this.addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        "Invalid interger",
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentValueInvalid
      );
    }
  }

}
