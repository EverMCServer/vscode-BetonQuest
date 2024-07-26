import { CompletionItem } from "vscode-languageserver";

import { ArgumentEventIdType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";

export class ArgumentEventID extends AbstractNodeV2<ArgumentEventIdType> {
  readonly type: ArgumentEventIdType = 'ArgumentEventID';
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
