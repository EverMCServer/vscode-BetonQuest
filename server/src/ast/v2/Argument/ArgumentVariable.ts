import { DiagnosticSeverity } from "vscode-languageserver";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ArgumentVariableType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentValue } from "./ArgumentValue";
import { ArgumentVariableGlobalPoint } from "./Variable/ArgumentVariableGlobalPoint";
import { ArgumentVariableKind } from "./ArgumentVariableKind";
import { ArgumentVariableObjectiveProperty } from "./Variable/ArgumentVariableObjectiveProperty";
import { ArgumentVariableCondition } from "./Variable/ArgumentVariableCondition";

export class ArgumentVariable extends AbstractNodeV2<ArgumentVariableType> {
  readonly type: ArgumentVariableType = 'ArgumentVariable';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentValue;

  readonly argumentStr: string;

  readonly variableKind?: string;
  readonly variableInstructions?: string;

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

    // Parse variable ID
    const match = /^(%?)([^\.\s%]*)\.?([^\s%]*)(%?)$/gm.exec(this.argumentStr);
    if (match) {
      this.variableKind = match[2];
      this.variableInstructions = match[3];
      if (this.getPackageUri(match[2])) {
        // TODO
      }
      const offKindStart = this.offsetStart + (match[1].length > 0 ? 1 : 0);
      const offKindEnd = offKindStart + this.variableKind.length;
      const offArgStart = offKindEnd + 1;
      const offArgEnd = offArgStart + this.variableInstructions.length;
      this.addChild(new ArgumentVariableKind(this.variableKind, [offKindStart, offKindEnd], this));
      switch (this.variableKind) {
        case 'objective':
          this.addChild(new ArgumentVariableObjectiveProperty(this.variableInstructions, [offArgStart, offArgEnd], this));
          break;
        case 'condition':
          this.addChild(new ArgumentVariableCondition(this.variableInstructions, [offArgStart, offArgEnd], this));
          break;
        case 'point':
          break;
        case 'globalpoint':
          this.addChild(new ArgumentVariableGlobalPoint(this.variableInstructions, [offArgStart, offArgEnd], this));
          break;
        case 'tag':
          break;
        case 'globaltag':
          break;
        case 'eval':
          break;
        case 'item':
          break;
        case 'itemdurability':
          break;
        case 'location':
          break;
        case 'math':
          break;
        case 'npc':
          break;
        case 'player':
          break;
        case 'randomnumber':
          break;
        case 'version':
          break;
        case '':
          // Missing Variable Kind
          this.addDiagnostic(
            [this.offsetStart, this.offsetEnd],
            `Missing Variable kind.`,
            DiagnosticSeverity.Error,
            DiagnosticCode.ArgumentValueMissing
          );
          break;
        default:
          // Unknow Variable Kind
          this.addDiagnostic(
            [this.offsetStart, this.offsetEnd],
            `Invalid Variable kind: "${this.variableKind}" is unknown.`,
            DiagnosticSeverity.Error,
            DiagnosticCode.ArgumentValueInvalid
          );
          break;
      }

      // Invalid variable format
      // Contains empty characters
      if (this.argumentStr.match(/\s/g)) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Invalid variable string: Empty characters are not allowed.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentValueInvalid,
          [
            {
              title: `Remove empty spaces`,
              text: this.argumentStr.replace(/\s/gm, "")
            }
          ]
        );
      }
      // Missing "%"
      if (!match[1] || !match[4]) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Invalid variable string: Missing "%...%" quotes.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentValueInvalid,
          [
            {
              title: `Add "%...%" quotes`,
              text: match[1] ? `${this.argumentStr}%` : match[4] ? `%${this.argumentStr}` : `%${this.argumentStr}%`,
            }
          ]
        );
      }
    }

  }

}
