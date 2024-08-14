import { CompletionItem } from "vscode-languageserver";

import { ArgumentConditionIdType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArgumentValue } from "../Condition/ConditionArgumentValue";

export class ArgumentConditionID extends AbstractNodeV2<ArgumentConditionIdType> {
  readonly type: ArgumentConditionIdType = 'ArgumentConditionID';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArgumentValue;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    parent: ConditionArgumentValue,
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
