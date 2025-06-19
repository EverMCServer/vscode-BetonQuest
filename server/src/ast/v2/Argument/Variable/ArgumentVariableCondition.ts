import { CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { LocationLinkOffset } from "../../../../utils/location";
import { ArgumentVariableConditionType } from "../../../node";
import { AbstractNodeV2 } from "../../../v2";
import { ArgumentVariable } from "../ArgumentVariable";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { html2markdown } from "../../../../utils/html2markdown";

export class ArgumentVariableCondition extends AbstractNodeV2<ArgumentVariableConditionType> {
  readonly type: ArgumentVariableConditionType = 'ArgumentVariableCondition';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariable;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariable,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
  }

  getDiagnostics(): Diagnostic[] {
    // Check if id exists
    if (this.argumentStr.length === 0) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Condition ID is missing`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariableConditionIdMissing
      )];
    } else if (this.getConditionEntries(this.argumentStr).length === 0) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Condition ID not found`,
        DiagnosticSeverity.Warning,
        DiagnosticCode.ArgumentVariableConditionIdNotFound
      )];
    } else if (this.parent.parent.parent.parent.parent.type === "ConditionEntry" && this.parent.parent.parent.parent.parent.keyString === this.argumentStr) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Condition ID can not be refered to itself`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariableConditionLoopedReference
      )];
    }
    return [];
  }

  // Trace all Conditions ID definitions
  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    return this.getConditionEntries(this.argumentStr)
      .map(e => ({
        originSelectionRange: [this.offsetStart, this.offsetEnd],
        targetUri: e.getUri(),
        targetRange: [e.offsetStart!, e.offsetEnd!],
        targetSelectionRange: [e.offsetStart!, e.offsetEnd!]
      }));
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // Skip completion promption if it is prompted with an extra "."
    if (this.argumentStr.includes(".")) {
      return [];
    }

    return this.getConditionEntries()
    // Prevent looped reference
    .filter(e => this.parent.parent.parent.parent.parent.type !== "ConditionEntry" || e.keyString !== this.parent.parent.parent.parent.parent.keyString)
    .map(e => {
      return {
        label: e.keyString,
        kind: CompletionItemKind.EnumMember,
        detail: e.kindConfig?.display,
        documentation: {
          kind: 'markdown',
          value: `(Condition) ${e.kindConfig?.display}\n\n\`\`\`text\n${e.yml.value?.value}\n\`\`\`${e.kindConfig?.description ? "\n\n" + html2markdown(e.kindConfig?.description?.toString()) : ""}`
        },
        insertText: e.keyString
      };
    });
  }

  getSemanticTokens(documentUri?: string): SemanticToken[] {
    const targetDefs = this.getConditionEntries(this.argumentStr);
    if (targetDefs.length > 0) {
      return [{
        offsetStart: this.offsetStart,
        offsetEnd: this.offsetEnd,
        tokenType: SemanticTokenType.ConditionID
      }];
    }
    return [];
  }

}
