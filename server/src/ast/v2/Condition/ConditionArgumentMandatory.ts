import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentMandatoryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArguments } from "./ConditionArguments";
import { ConditionArgumentValue } from "./ConditionArgumentValue";

export class ConditionArgumentMandatory extends AbstractNodeV2<ConditionArgumentMandatoryType> {
  readonly type: ConditionArgumentMandatoryType = 'ConditionArgumentMandatory';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private offsets: [offsetStart: number, keyStart: number, keyEnd: number, valueStart: number, offsetEnd: number];
  private pattern: ArgumentsPatternMandatory;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
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
    if (this.pattern && this.pattern.key) {
      // Key-value pair
      const strs = this.argumentStr.split(":");
      if (strs.length > 0) {
        // With ":"
        // Calculate offsets
        const str = strs.slice(1).join(":");
        const pos2 = offsets[1] + strs[0].length;
        this.offsets = [offsets[0], offsets[1], pos2, pos2 + 1, offsets[2]];
        // Parse key
        // TODO ...
        // Parse value
        this.addChild(new ConditionArgumentValue(str, [this.offsets[3], this.offsets[4]], this.pattern, this));
      } else {
        // Missing ":"
        // Calculate offsets
        this.offsets = [offsets[0], offsets[1], offsets[2], offsets[2], offsets[2]];
        // Parse key
        // TODO ...
        // Warn about missing value
        // TODO ...
      }
    } else {
      // Value only
      // Calculate offsets
      this.offsets = [offsets[0], offsets[1], offsets[1], offsets[1], offsets[2]];
      // Parse 
      this.addChild(new ConditionArgumentValue(this.argumentStr, [this.offsets[3], this.offsets[4]], this.pattern, this));
    }
  }

  // TODO: completion
  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    const completionItems: CompletionItem[] = [];

    // Prompt key suggestions
    if (this.offsets[0] < offset && offset <= this.offsets[1] || offset === this.offsets[2]) {
      this.parent.kindConfig.argumentsPatterns
        .mandatory.filter(o => !this.parent.argumentMandatoryStrs.some(s => o.key && s.trimStart().startsWith(o.key)))
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

    // Prompt suggestions for insertion
    if (this.offsets[0] < offset && offset < this.offsets[1]) {
      return ConditionArgumentValue.getCompletionsByType(this.pattern.type);
    }

    completionItems.push(...super.getCompletions(offset, documentUri));
    return completionItems;
  }
}
