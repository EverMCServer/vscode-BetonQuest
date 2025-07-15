import { CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentVariableSectionPapiType } from "../../../../node";
import { AbstractNodeV2 } from "../../../../v2";
import { ArgumentVariableCondition } from "../ArgumentVariableCondition";
import { DiagnosticCode } from "../../../../../utils/diagnostics";
import { ArgumentVariableGlobalTag } from "../ArgumentVariableGlobalTag";
import { ArgumentVariableTag } from "../ArgumentVariableTag";

export class ArgumentVariableSectionPapi extends AbstractNodeV2<ArgumentVariableSectionPapiType> {
  readonly type: ArgumentVariableSectionPapiType = 'ArgumentVariableSectionPapi';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariableCondition | ArgumentVariableTag | ArgumentVariableGlobalTag;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariableCondition | ArgumentVariableTag | ArgumentVariableGlobalTag,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
  }

  initDiagnosticsAndCodeActions(addDiagnostic: (offsets: [offsetStart?: number, offsetEnd?: number], message: string, severity: DiagnosticSeverity, code: DiagnosticCode, codeActions?: { title: string; text: string; range?: [offsetStart: number, offsetEnd: number]; }[]) => void): void {
    // Check string
    if (this.argumentStr !== "papiMode") {
      addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Invalid PAPI`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariableTagNameMissing,
        [
          {
            title: `Change to "papiMode"`,
            text: `papiMode`
          },
          {
            title: `Remove`,
            text: ``,
            range: [this.offsetStart - 1, this.offsetEnd]
          },
        ]
      );
    }
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    // Skip completion promption if it is prompted with an extra "."
    if (this.argumentStr.includes(".")) {
      return [];
    }

    return [{
      label: `papiMode`,
      kind: CompletionItemKind.Constant,
      documentation: {
        kind: "markdown",
        value: "Return `yes` or `no` instead of true / false for PAPI support."
      }
    }];
    ;
  }
}