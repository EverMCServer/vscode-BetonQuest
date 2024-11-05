import { DiagnosticSeverity } from "vscode-languageserver";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ArgumentVariableType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentValue } from "./ArgumentValue";
import { ArgumentVariableGlobalPoint } from "./Variable/ArgumentVariableGlobalPoint";

export class ArgumentVariable extends AbstractNodeV2<ArgumentVariableType> {
  readonly type: ArgumentVariableType = 'ArgumentVariable';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentValue;

  readonly variableType?: string;
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

    // Parse variable ID
    const match = /^%([^\.\s]+)\.?(\S*)%$/gm.exec(argumentStr);
    if (match) {
      if (this.getPackageUri(match[1])) {
        // TODO
      }
      this.variableType = match[1];
      this.variableInstructions = match[2];
      switch (this.variableType) {
        case 'objective':
          break;
        case 'condition':
          break;
        case 'point':
          break;
        case 'globalpoint':
          this.addChild(new ArgumentVariableGlobalPoint(this.variableInstructions, [this.offsetStart + this.variableType.length + 2, this.offsetEnd - 1], this));
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
      }
    } else {
      // Invalid variable format
      if (argumentStr.match(/\s/g)) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Invalid variable string: Empty characters are not allowed.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentValueInvalid,
          [
            {
              title: `Remove empty spaces`,
              text: argumentStr.replace(/\s/gm, "")
            }
          ]
        );
      } else {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Invalid variable string: Missing "%...%" quotes.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentValueInvalid,
          [
            {
              title: `Add "%...%" quotes`,
              text: `%${argumentStr}%`, 
            }
          ]
        );
      }
    }

  }

  private parseVariable(argumentStr: string) {
  };

  // getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
  //   return [];
  // }

}
