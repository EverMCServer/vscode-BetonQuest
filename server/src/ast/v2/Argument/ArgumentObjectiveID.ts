import { CompletionItem } from "vscode-languageserver";

import { ArgumentObjectiveIdType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentObjectiveID extends AbstractNodeV2<ArgumentObjectiveIdType> {
  readonly type: ArgumentObjectiveIdType = 'ArgumentObjectiveID';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentValue;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    return [];
  }

}
