import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

import { EventArgumentMandatoryType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { EventArguments } from "./EventArguments";

export class EventArgumentMandatory extends AbstractNodeV1<EventArgumentMandatoryType> {
  readonly type: EventArgumentMandatoryType = 'EventArgumentMandatory'; // TODO remove Mandatory / Optional
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: EventArguments;

  private argumentStr: string;
  private pattern: ArgumentsPatternMandatory;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: EventArguments,
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
