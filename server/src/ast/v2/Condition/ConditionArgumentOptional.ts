import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentOptionalType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArguments } from "./ConditionArguments";
import { parseArgument } from "../Argument/parseArgument";

export class ConditionArgumentOptional extends AbstractNodeV2<ConditionArgumentOptionalType> {
  readonly type: ConditionArgumentOptionalType = 'ConditionArgumentOptional';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private pattern: ArgumentsPatternOptional;
  private offsets: [offsetStart: number, stringStart: number, offsetEnd: number];

  constructor(argumentStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
    parent: ConditionArguments,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[2];
    this.parent = parent;

    this.argumentStr = argumentStr;
    this.pattern = pattern;
    this.offsets = offsets;

    // Parse argumentStr
    if (this.pattern.format !== "boolean") {
      const strs = this.argumentStr.split(":");
      if (strs.length) {
        const str = strs.slice(1).join(":");
        const pos1 = this.offsets[1] + strs[0].length + 1;
        parseArgument(
          str,
          [pos1, pos1, this.offsets[2]],
          this.pattern,
          this
        );
      }
    }
  }

  // Prompt key completions
  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    if (!this.argumentStr.trim() && (this.offsets[0] < offset && offset <= this.offsets[1] || offset === this.offsets[2])) {
      return [
        {
          label: this.pattern.key + (this.pattern.format === "boolean" ? "" : ":"),
          kind: CompletionItemKind.Snippet, // TODO: move it onto SemanticTokenType etc.
          detail: this.pattern.name?.toString(),
          documentation: this.pattern.tooltip,
          command: {
            title: "Prompt value suggestion",
            command: "editor.action.triggerSuggest"
          }
        },
        ...super.getCompletions(offset, documentUri)
      ];
    }
    return super.getCompletions(offset, documentUri);
  }
}
