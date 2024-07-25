
import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

import { ObjectiveArgumentMandatoryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ObjectiveArguments } from "./ObjectiveArguments";

export class ObjectiveArgumentMandatory extends AbstractNodeV2<ObjectiveArgumentMandatoryType> {
  readonly type: ObjectiveArgumentMandatoryType = 'ObjectiveArgumentMandatory'; // TODO remove Mandatory / Optional
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ObjectiveArguments;

  private argumentStr: string;
  private pattern: ArgumentsPatternMandatory;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ObjectiveArguments,
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
        label: this.pattern.defaultValue.toString(),
        kind: CompletionItemKind.Snippet, // TODO: move it onto SemanticTokenType etc.
        detail: this.pattern.name?.toString(),
        documentation: this.pattern.tooltip
      },
      ...super.getCompletions(offset, documentUri)
    ];
  }
}
