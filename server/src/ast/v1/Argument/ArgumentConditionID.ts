import { CompletionItem } from "vscode-languageserver";

import { ArgumentConditionIdType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentConditionID extends AbstractNodeV1<ArgumentConditionIdType> {
  readonly type: ArgumentConditionIdType = 'ArgumentConditionID';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ArgumentValue;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[2];
    this.parent = parent;
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    return ArgumentConditionID.getCompletions();
  }

  static getCompletions(): CompletionItem[] {
    return [];
  }

}
