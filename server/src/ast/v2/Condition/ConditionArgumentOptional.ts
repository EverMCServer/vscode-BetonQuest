import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentOptionalType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArguments } from "./ConditionArguments";

export class ConditionArgumentOptional extends AbstractNodeV2<ConditionArgumentOptionalType> {
  readonly type: ConditionArgumentOptionalType = 'ConditionArgumentOptional';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private pattern: ArgumentsPatternOptional;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
    parent: ConditionArguments,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
    this.pattern = pattern;

    // Parse argumentStr
    this.pattern.format === "boolean" ? ":" : ""; // 
  }

  // Prompt key completions
  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    return [
      {
        label: this.pattern.key + (this.pattern.format === "boolean" ? "" : ":"),
        kind: CompletionItemKind.Snippet, // TODO: move it onto SemanticTokenType etc.
        detail: this.pattern.name?.toString(),
        documentation: this.pattern.tooltip,
        command: {
          title: "Prompt value suggestion",
          command: "editor.action.triggerParameterHints"
        }
      },
      ...super.getCompletions(offset, documentUri)
    ];
  }
}
