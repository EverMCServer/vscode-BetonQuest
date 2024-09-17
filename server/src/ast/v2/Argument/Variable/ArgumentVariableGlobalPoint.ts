import { CompletionItem, CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentVariableGlobalPointType } from "../../../node";
import { AbstractNodeV2 } from "../../../v2";
import { ArgumentVariable } from "../ArgumentVariable";
import { DiagnosticCode } from "../../../../utils/diagnostics";

export class ArgumentVariableGlobalPoint extends AbstractNodeV2<ArgumentVariableGlobalPointType> {
  readonly type: ArgumentVariableGlobalPointType = 'ArgumentVariableGlobalPoint';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariable;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariable,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    // Parse condition id
    // TODO
  }

  // getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
  //   return [];
  // }

}
