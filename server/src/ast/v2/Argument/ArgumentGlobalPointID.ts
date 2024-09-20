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

  private getGlobalPointIDs() {
    const result: Map<string, [string, string, string, string]> = new Map();
    ([
      this.getAllConditionEntries(),
      this.getAllEventEntries(),
      this.getAllObjectiveEntries()
    ].flat()
      .filter(e =>
        e.kindConfig?.argumentsPatterns.mandatory.some(e => e.type === ArgumentType.globalPointID) ||
        e.kindConfig?.argumentsPatterns.optional?.some(e => e.type === ArgumentType.globalPointID)
      )
      .map(e => e.getChild<ConditionArguments | EventArguments | ObjectiveArguments>(["ConditionArguments", "EventArguments", "ObjectiveArguments"]))
      .filter(e => e !== undefined) as ConditionArguments[])
      .forEach(e => {
        e.getChildren<ConditionArgumentMandatory | EventArgumentMandatory | ObjectiveArgumentMandatory>(["ConditionArgumentMandatory", "EventArgumentMandatory", "ObjectiveArgumentMandatory"])
          .filter(e => e.pattern.type === ArgumentType.globalPointID)
          .forEach(e => {
            result.set(e.argumentStr, [
              e.argumentStr,
              e.getPackagePath().join("-"),
              e.parent.type,
              e.parent.parent.keyString
            ]);
          });
        e.getChildren<ConditionArgumentOptional | EventArgumentOptional | ObjectiveArgumentOptional>(["ConditionArgumentOptional", "EventArgumentOptional", "ObjectiveArgumentOptional"])
          .filter(e => e.pattern?.type === ArgumentType.globalPointID)
          .forEach(e => {
            result.set(e.argumentStr, [
              e.argumentStr,
              e.getPackagePath().join("-"),
              e.parent.type,
              e.parent.parent.keyString
            ]);
          });
      });
    return [...result.values()];
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // return ArgumentGlobalPointID.getCompletions();
    const packagePath = this.getPackagePath().join("-");
    return this.getGlobalPointIDs().map(e => {
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
