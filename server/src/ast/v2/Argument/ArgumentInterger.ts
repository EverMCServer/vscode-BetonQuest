import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ArgumentIntergerType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentInterger extends AbstractNodeV2<ArgumentIntergerType> {
  readonly type: ArgumentIntergerType = 'ArgumentInterger';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentValue;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;
    this.argumentStr = argumentStr;
  }

  getDiagnostics(): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    if (!this.argumentStr.match(/^(?:\+|-)?\d+$/gm)) {
      diagnostics.push(this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        "Invalid interger",
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentValueInvalid
      ));
    }
    return diagnostics;
  }

}
