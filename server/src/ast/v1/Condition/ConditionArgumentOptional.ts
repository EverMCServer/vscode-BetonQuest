import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentOptionalType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ConditionArguments } from "./ConditionArguments";

export class ConditionArgumentOptional extends AbstractNodeV1<ConditionArgumentOptionalType> {
  readonly type: ConditionArgumentOptionalType = 'ConditionArgumentOptional'; // TODO remove Mandatory / Optional
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
    this.parent = parent;

    this.offsetStart = range[0];
    this.offsetEnd = range[1];

    // Parse argumentStr
    this.argumentStr = argumentStr;

    this.pattern = pattern;

    // Check format
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    return [
      {
        label: this.pattern.key + this.pattern.format === "boolean" ? ":" : "",
        kind: CompletionItemKind.Snippet, // TODO: move it onto SemanticTokenType etc.
        detail: this.pattern.name?.toString(),
        documentation: this.pattern.tooltip
      },
      ...super.getCompletions(offset, documentUri)
    ];
  }
}

