import { DiagnosticSeverity } from "vscode-languageserver";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { ArgumentIntergerType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentInterger extends AbstractNodeV1<ArgumentIntergerType> {
  readonly type: ArgumentIntergerType = 'ArgumentInterger';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ArgumentValue;

  constructor(
    argumentStr: string,
    range: [number?, number?],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    // Check value
    // TODO: move it to getDiagnostic() for speed optimization
    if (argumentStr.length > 0 && argumentStr.match(/[^0-9]/gm)) {
      this.addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        "Invalid interger",
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentValueInvalid
      );
    }
  }

}
