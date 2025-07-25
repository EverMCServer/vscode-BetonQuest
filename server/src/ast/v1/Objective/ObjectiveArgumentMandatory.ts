import { CompletionItem, CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ObjectiveArgumentMandatoryType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ArgumentKey } from "../Argument/ArgumentKey";
import { ArgumentValue } from "../Argument/ArgumentValue";
import { ObjectiveArguments } from "./ObjectiveArguments";

export class ObjectiveArgumentMandatory extends AbstractNodeV1<ObjectiveArgumentMandatoryType> {
  readonly type: ObjectiveArgumentMandatoryType = 'ObjectiveArgumentMandatory';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ObjectiveArguments;

  private argumentStr: string;
  private offsets: [offsetStart: number, keyStart: number, keyEnd: number, valueStart: number, offsetEnd: number];
  private pattern: ArgumentsPatternMandatory;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ObjectiveArguments,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[2];
    this.parent = parent;

    this.argumentStr = argumentStr;  // argumentStr has been trimed already.
    this.pattern = pattern;

    // Parse argumentStr

    // Split value
    if (this.pattern && this.pattern.key) {
      // Key-value pair
      const strs = this.argumentStr.split(":");
      if (strs.length > 1) {
        // With ":"
        // Calculate offsets
        const valueStr = strs.slice(1).join(":");
        const pos2 = offsets[1] + strs[0].length;
        this.offsets = [offsets[0], offsets[1], pos2, pos2 + 1, offsets[2]];
        // Parse key
        this.addChild(new ArgumentKey(strs[0], [this.offsets[1], this.offsets[2]], this.pattern, this));
        // Parse value
        this.addChild(new ArgumentValue(valueStr, [this.offsets[3], this.offsets[4]], this.pattern, this));
      } else {
        // Calculate offsets
        this.offsets = [offsets[0], offsets[1], offsets[2], offsets[2], offsets[2]];
        if (strs.length > 0) {
          // Missing ":"
          // Parse key
          this.addChild(new ArgumentKey(strs[0], [this.offsets[1], this.offsets[2]], this.pattern, this));
          // Warn about missing value
          this.addDiagnostic(
            [this.offsets[2], this.offsets[3]],
            `Missing semicolon ":"`,
            DiagnosticSeverity.Error,
            DiagnosticCode.ArgumentKeyMissingSemicolon,
            [{
              title: `Add semicolon ":"`,
              text: ":",
            }]
          );
        } else {
          // Diagnostic of missing the whole argument has been handled by the parent.
          // We don't need to do anything here.
        }
      }
    } else {
      // Value only
      // Calculate offsets
      this.offsets = [offsets[0], offsets[1], offsets[1], offsets[1], offsets[2]];
      // Parse 
      this.addChild(new ArgumentValue(this.argumentStr, [this.offsets[3], this.offsets[4]], this.pattern, this));
    }
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    const completionItems: CompletionItem[] = [];

    // Prompt key suggestions
    if (this.pattern.key && (this.offsets[0] < offset && offset < this.offsets[1] || offset === this.offsets[2])) {
      this.parent.parent.kindConfig?.argumentsPatterns
        .mandatory.filter(o => !this.parent.argumentMandatoryStrs.some(s => !o.key || s.trimStart().startsWith(o.key)))
        .forEach(pattern => completionItems.push({
          label: pattern.key!,
          kind: CompletionItemKind.Snippet, // TODO: move it onto SemanticTokenType etc.
          detail: pattern.name?.toString(),
          documentation: pattern.tooltip,
          command: {
            title: "Prompt value suggestion",
            command: "editor.action.triggerSuggest"
          },
          insertText: pattern.key + ":",
        }));
    }

    // Prompt value suggestions for insertion
    if (!this.pattern.key && this.offsets[0] < offset && offset < this.offsets[1]) {
      completionItems.push(...ArgumentValue.getCompletionsByType(this.pattern.type));
    }

    return completionItems;
  }
}
