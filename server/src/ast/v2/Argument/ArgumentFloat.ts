import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ArgumentFloatType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentFloat extends AbstractNodeV2<ArgumentFloatType> {
  readonly type: ArgumentFloatType = 'ArgumentFloat';
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
    if (!this.argumentStr.match(/^(?:\+|-)?\d+(?:\.\d+)?$/gm)) {
      diagnostics.push(this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        "Invalid number",
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentValueInvalid
      ));
    }
    return diagnostics;
  }

}
