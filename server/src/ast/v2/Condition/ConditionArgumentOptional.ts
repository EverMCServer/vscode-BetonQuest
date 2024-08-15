import { CompletionItem, CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ConditionArgumentOptionalType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArgumentKey } from "./ConditionArgumentKey";
import { ConditionArguments } from "./ConditionArguments";
import { ConditionArgumentValue } from "./ConditionArgumentValue";

export class ConditionArgumentOptional extends AbstractNodeV2<ConditionArgumentOptionalType> {
  readonly type: ConditionArgumentOptionalType = 'ConditionArgumentOptional';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private offsets: [offsetStart: number, keyStart: number, keyEnd: number, valueStart: number, offsetEnd: number];
  private pattern?: ArgumentsPatternOptional;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional | undefined,
    parent: ConditionArguments,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[2];
    this.parent = parent;

    this.argumentStr = argumentStr;  // argumentStr has been trimed already.
    this.pattern = pattern;

    // Parse argumentStr

    // Split value
    if (this.pattern && this.pattern?.format !== "boolean") {
      // Key-value pair
      const strs = this.argumentStr.split(":");
      if (strs.length > 1) {
        // With ":"
        // Calculate offsets
        const str = strs.slice(1).join(":");
        const pos2 = offsets[1] + strs[0].length;
        this.offsets = [offsets[0], offsets[1], pos2, pos2 + 1, offsets[2]];
        // Parse key
        this.addChild(new ConditionArgumentKey(strs[0], [this.offsets[1], this.offsets[2]], this.pattern, this));
        // Parse value
        this.addChild(new ConditionArgumentValue(str, [this.offsets[3], this.offsets[4]], this.pattern, this));
      } else {
        // Calculate offsets
        this.offsets = [offsets[0], offsets[1], offsets[2], offsets[2], offsets[2]];
        if (strs.length > 0) {
          // Missing ":"
          // Parse key
          this.addChild(new ConditionArgumentKey(strs[0], [this.offsets[1], this.offsets[2]], this.pattern, this));
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
      // Boolean
      // Calculate offsets
      this.offsets = [offsets[0], offsets[1], offsets[2], offsets[2], offsets[2]];
      // Parse key
      this.addChild(new ConditionArgumentValue(this.argumentStr, [this.offsets[3], this.offsets[4]], this.pattern, this));
    }
  }

  // Prompt key completions
  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completionItems: CompletionItem[] = [];

    // Prompt key suggestions
    if (this.offsets[0] < offset && offset <= this.offsets[1] || offset === this.offsets[2]) {
      this.parent.kindConfig.argumentsPatterns
        .optional?.filter(o => !this.parent.argumentOptionalStrs.some(s => s.trimStart().startsWith(o.key)))
        .forEach(pattern => completionItems.push({
          label: pattern.key,
          kind: CompletionItemKind.Snippet, // TODO: move it onto SemanticTokenType etc.
          detail: pattern.name?.toString(),
          documentation: pattern.tooltip,
          command: {
            title: "Prompt value suggestion",
            command: "editor.action.triggerSuggest"
          },
          insertText: pattern.key + (pattern.format === "boolean" ? "" : ":"), // TODO: add ":" only when there is no arguments
        }));
    }

    completionItems.push(...super.getCompletions(offset, documentUri));
    return completionItems;
  }
}
