import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { ArgumentVariableKindType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentVariable } from "./ArgumentVariable";
import { ConditionArguments } from "../Condition/ConditionArguments";
import { EventArguments } from "../Event/EventArguments";
import { ObjectiveArguments } from "../Objective/ObjectiveArguments";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { EventArgumentMandatory } from "../Event/EventArgumentMandatory";
import { ObjectiveArgumentMandatory } from "../Objective/ObjectiveArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";
import { EventArgumentOptional } from "../Event/EventArgumentOptional";
import { ObjectiveArgumentOptional } from "../Objective/ObjectiveArgumentOptional";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentVariableKind extends AbstractNodeV2<ArgumentVariableKindType> {
  readonly type: ArgumentVariableKindType = 'ArgumentVariableKind';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariable;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariable,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completionItems: CompletionItem[] = [];

    // Prompt built-in variable kinds
    [
      "objective",
      "condition",
      "point",
      "globalpoint",
      "tag",
      "globaltag",
      "eval",
      "item",
      "itemdurability",
      "location",
      "math",
      "npc",
      "player",
      "randomnumber",
      "version",
    ].map(kind => {
      completionItems.push({
        label: kind,
        kind: CompletionItemKind.Variable,
        detail: "built-in",
        // documentation: "",
        insertText: kind
      });
    });

    return completionItems;
  }
}