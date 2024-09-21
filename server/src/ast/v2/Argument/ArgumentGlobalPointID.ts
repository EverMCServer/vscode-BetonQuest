import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { ArgumentGlobalPointIdType } from "../../node";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";
import { ConditionArguments } from "../Condition/ConditionArguments";
import { EventArgumentMandatory } from "../Event/EventArgumentMandatory";
import { EventArgumentOptional } from "../Event/EventArgumentOptional";
import { EventArguments } from "../Event/EventArguments";
import { ObjectiveArgumentMandatory } from "../Objective/ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "../Objective/ObjectiveArgumentOptional";
import { ObjectiveArguments } from "../Objective/ObjectiveArguments";
import { ArgumentAbstractID } from "./ArgumentAbstractID";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentGlobalPointID extends ArgumentAbstractID<ArgumentGlobalPointIdType> {
  readonly type: ArgumentGlobalPointIdType = 'ArgumentGlobalPointID';

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super(argumentStr, offsets, parent);
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
        // Ignore the entering id
        if (e.getPackagePath() !== this.getPackagePath() || e.parent.parent.keyString !== this.parent.parent.parent.parent.keyString) {
          // Assign GlobalPointID string to result
          result.set(e.argumentStr, [
            e.argumentStr,
            e.getPackagePath().join("-"),
            e.parent.type,
            e.parent.parent.keyString
          ]);
        }
      });
    return [...result.values()];
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // return ArgumentGlobalPointID.getCompletions();
    const packagePath = this.getPackagePath().join("-");
    return this.getAllGlobalPointIDs().map(e => {
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
    });
  }

}
