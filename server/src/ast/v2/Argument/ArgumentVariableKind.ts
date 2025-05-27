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

  private getAllVariableArguments() {
    return [
      // Iterate all element lists
      this.getAllConditionEntries(),
      this.getAllEventEntries(),
      this.getAllObjectiveEntries()
    ].flat()
      .filter(e =>
        // Speed up searching by filtering all entries contains type = ArgumentType.globalPointID only
        e.kindConfig?.argumentsPatterns.mandatory.some(e => e.type === ArgumentType.variableQuoted) ||
        e.kindConfig?.argumentsPatterns.optional?.some(e => e.type === ArgumentType.variableQuoted)
      )
      .flatMap(e => e.getChildren<ConditionArguments | EventArguments | ObjectiveArguments>(["ConditionArguments", "EventArguments", "ObjectiveArguments"]))
      .flatMap(e => e.getChildren<ConditionArgumentMandatory | EventArgumentMandatory | ObjectiveArgumentMandatory | ConditionArgumentOptional | EventArgumentOptional | ObjectiveArgumentOptional>(["ConditionArgumentMandatory", "EventArgumentMandatory", "ObjectiveArgumentMandatory", "ConditionArgumentOptional", "EventArgumentOptional", "ObjectiveArgumentOptional"]))
      // Filter all argument by type  
      .filter(e => e.pattern?.type === ArgumentType.variableQuoted)
      .flatMap(e => e.getChild<ArgumentValue>("ArgumentValue")!).filter(e => e);
  }

  // Get all variables by iterating the whole ast
  private getAllVariableIDs(): string[] {
    return this.getAllVariableArguments()
      .flatMap(e => e.getChild<ArgumentVariable>("ArgumentVariable")).filter(e => e)
      .flatMap(e => e!.getChildren<ArgumentVariableKind>("ArgumentVariableKind")).filter(e => e)
      .map(e => e!.argumentStr).filter(e => e);
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
        detail: kind,
        // documentation: "",
        insertText: kind
      });
    });

    // Get all custom variable IDs
    this.getAllVariableIDs().map(id => {
      completionItems.push({
        label: id,
        kind: CompletionItemKind.Variable,
        detail: id,
        // documentation: "",
        insertText: id
      });
    });

    return completionItems;
  }
}