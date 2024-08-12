import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentOptionalType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArguments } from "./ConditionArguments";
import { ConditionArgumentValue } from "./ConditionArgumentValue";

export class ConditionArgumentOptional extends AbstractNodeV2<ConditionArgumentOptionalType> {
  readonly type: ConditionArgumentOptionalType = 'ConditionArgumentOptional';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private offsets: [offsetStart: number, stringStart: number, offsetEnd: number];
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

    this.argumentStr = argumentStr;
    this.offsets = offsets;
    this.pattern = pattern;

    // Parse argumentStr

    // Parse key
    // TODO...

    // Parse value
    if (this.pattern && this.pattern?.format !== "boolean") {
      const strs = this.argumentStr.split(":");
      if (strs.length) {
        const str = strs.slice(1).join(":");
        const pos1 = this.offsets[1] + strs[0].length + 1;
        this.addChild(new ConditionArgumentValue(str, [pos1, this.offsets[2]], this.pattern, this));
      }
    }
  }

  // Prompt key completions
  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completionItems: CompletionItem[] = [];

    // Prompt optional key suggestions
    if (this.offsets[0] < offset && offset <= this.offsets[1]) {
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
