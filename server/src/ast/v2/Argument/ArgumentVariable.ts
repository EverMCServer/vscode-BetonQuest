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

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    // Parse by variable type
    this.parseVariable(argumentStr);

  }

  private parseVariable(argumentStr: string) {
    const match = /^%([^\.]+)\.(.*)%$/g.exec(argumentStr);
    if (match) {
      switch (match[1]) {
        case 'objective':
          break;
        case 'condition':
          break;
        case 'point':
          break;
        case 'globalpoint':
          this.addChild(new ArgumentVariableGlobalPoint(match[2], [this.offsetStart + match[1].length + 2, this.offsetEnd - 1], this));
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
      this.addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Invalid variable string: missing "."`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentValueInvalid,
      );
    }
  };

  // getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
  //   return [];
  // }

}
