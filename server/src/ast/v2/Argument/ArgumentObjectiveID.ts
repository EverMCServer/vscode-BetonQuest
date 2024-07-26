import { CompletionItem } from "vscode-languageserver";

import { ArgumentObjectiveIdType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";

export class ArgumentObjectiveID extends AbstractNodeV2<ArgumentObjectiveIdType> {
  readonly type: ArgumentObjectiveIdType = 'ArgumentObjectiveID';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArgumentMandatory | ConditionArgumentOptional;

  constructor(
    argumentStr: string,
    range: [number?, number?],
    parent: ConditionArgumentMandatory | ConditionArgumentOptional,
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
