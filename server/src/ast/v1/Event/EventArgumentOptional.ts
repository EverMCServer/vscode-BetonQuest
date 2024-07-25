import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { EventArgumentOptionalType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { EventArguments } from "./EventArguments";

export class EventArgumentOptional extends AbstractNodeV1<EventArgumentOptionalType> {
  readonly type: EventArgumentOptionalType = 'EventArgumentOptional'; // TODO remove Mandatory / Optional
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: EventArguments;

  private argumentStr: string;
  private pattern: ArgumentsPatternOptional;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternOptional,
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
        label: this.pattern.key + ":",
        kind: CompletionItemKind.Snippet, // TODO: move it onto SemanticTokenType etc.
        detail: this.pattern.name?.toString(),
        documentation: this.pattern.tooltip
      },
      ...super.getCompletions(offset, documentUri)
    ];
  }
}

