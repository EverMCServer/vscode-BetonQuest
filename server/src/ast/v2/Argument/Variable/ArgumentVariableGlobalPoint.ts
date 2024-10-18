import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { ArgumentVariableGlobalPointType } from "../../../node";
import { AbstractNodeV2 } from "../../../v2";
import { ConditionArgumentMandatory } from "../../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../../Condition/ConditionArgumentOptional";
import { ConditionArguments } from "../../Condition/ConditionArguments";
import { EventArgumentMandatory } from "../../Event/EventArgumentMandatory";
import { EventArgumentOptional } from "../../Event/EventArgumentOptional";
import { EventArguments } from "../../Event/EventArguments";
import { ObjectiveArgumentMandatory } from "../../Objective/ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "../../Objective/ObjectiveArgumentOptional";
import { ObjectiveArguments } from "../../Objective/ObjectiveArguments";
import { ArgumentVariable } from "../ArgumentVariable";

export class ArgumentVariableGlobalPoint extends AbstractNodeV2<ArgumentVariableGlobalPointType> {
  readonly type: ArgumentVariableGlobalPointType = 'ArgumentVariableGlobalPoint';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariable;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariable,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    // Parse condition id
    // TODO: parse into -> [pointID, conditionInstruction(amount, left)]
  }

  private getAllGlobalPointIDs() {
    const result: Map<string, [string, string, string, string]> = new Map();
    [
      // Iterate all element lists
      this.getAllConditionEntries(),
      this.getAllEventEntries(),
      this.getAllObjectiveEntries()
    ].flat()
      .filter(e =>
        // Speed up searching by filtering all entries contains type = ArgumentType.globalPointID only
        e.kindConfig?.argumentsPatterns.mandatory.some(e => e.type === ArgumentType.globalPointID) ||
        e.kindConfig?.argumentsPatterns.optional?.some(e => e.type === ArgumentType.globalPointID)
      )
      .flatMap(e => e.getChildren<ConditionArguments | EventArguments | ObjectiveArguments>(["ConditionArguments", "EventArguments", "ObjectiveArguments"]))
      .flatMap(e => e.getChildren<ConditionArgumentMandatory | EventArgumentMandatory | ObjectiveArgumentMandatory | ConditionArgumentOptional | EventArgumentOptional | ObjectiveArgumentOptional>(["ConditionArgumentMandatory", "EventArgumentMandatory", "ObjectiveArgumentMandatory", "ConditionArgumentOptional", "EventArgumentOptional", "ObjectiveArgumentOptional"]))
      // Filter all argument by type  
      .filter(e => e.pattern?.type === ArgumentType.globalPointID)
      .forEach(e => {
        // Assign GlobalPointID string to result
        result.set(e.argumentStr, [
          e.argumentStr,
          e.getPackagePath().join("-"),
          e.parent.type,
          e.parent.parent.keyString
        ]);
      });
    return [...result.values()];
  }

  // TOOD: move it into sub-class
  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    return [
      ...this.getAllGlobalPointIDs().map(e => {
        let typeStr = e[2];
        if (typeStr.startsWith("Condition")) {
          typeStr = "Condition";
        } else if (typeStr.startsWith("Event")) {
          typeStr = "Event";
        } else if (typeStr.startsWith("Objective")) {
          typeStr = "Objective";
        }
        return {
          label: e[0],
          kind: CompletionItemKind.EnumMember,
          detail: e[0],
          documentation: "Package: " + e[1] + ", Type: " + typeStr + ", EntryID:" + e[3],
          insertText: e[0]
        };
      })
    ];
  }

}
