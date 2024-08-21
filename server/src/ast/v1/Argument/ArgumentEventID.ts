import { CompletionItem } from "vscode-languageserver";

import { ArgumentEventIdType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentEventID extends AbstractNodeV1<ArgumentEventIdType> {
  readonly type: ArgumentEventIdType = 'ArgumentEventID';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ArgumentValue;

  constructor(
    argumentStr: string,
    range: [number?, number?],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    return [];
  }

}
