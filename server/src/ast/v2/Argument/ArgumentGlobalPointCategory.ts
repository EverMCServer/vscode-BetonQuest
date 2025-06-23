import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { LocationLinkOffset } from "../../../utils/location";
import { ArgumentGlobalPointCategoryType } from "../../node";
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

export class ArgumentGlobalPointCategory extends ArgumentAbstractID<ArgumentGlobalPointCategoryType> {
  readonly type: ArgumentGlobalPointCategoryType = 'ArgumentGlobalPointCategory';

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super(argumentStr, offsets, parent);
  }

  private getAllGlobalPointArguments() {
    return [
      // Iterate all element lists
      this.getAllConditionEntries(),
      this.getAllEventEntries(),
      this.getAllObjectiveEntries()
    ].flat()
      .filter(e =>
        // Speed up searching by filtering all entries contains type = ArgumentType.globalPointCategory only
        e.kindConfig?.argumentsPatterns.mandatory.some(e => e.type === ArgumentType.globalPointCategory) ||
        e.kindConfig?.argumentsPatterns.optional?.some(e => e.type === ArgumentType.globalPointCategory)
      )
      .flatMap(e => e.getChildren<ConditionArguments | EventArguments | ObjectiveArguments>(["ConditionArguments", "EventArguments", "ObjectiveArguments"]))
      .flatMap(e => e.getChildren<ConditionArgumentMandatory | EventArgumentMandatory | ObjectiveArgumentMandatory | ConditionArgumentOptional | EventArgumentOptional | ObjectiveArgumentOptional>(["ConditionArgumentMandatory", "EventArgumentMandatory", "ObjectiveArgumentMandatory", "ConditionArgumentOptional", "EventArgumentOptional", "ObjectiveArgumentOptional"]))
      // Filter all argument by type  
      .filter(e => e.pattern?.type === ArgumentType.globalPointCategory)
      .flat()
      .map(e => e.getChild<ArgumentValue>("ArgumentValue")!).filter(e => e);
  }

  private getAllGlobalPointCategories() {
    const result: Map<string, [string, string, string, string]> = new Map();
    this.getAllGlobalPointArguments().forEach(e => {
      // Assign GlobalPointCategory string to result
      result.set(e.valueStr, [
        e.valueStr,
        e.getPackagePath().join("-"),
        e.parent.type,
        e.parent.parent.parent.keyString
      ]);
    });
    return [...result.values()];
  }

  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    // Return self so VSCode will show its References instead
    return [{
      originSelectionRange: [this.offsetStart, this.offsetEnd],
      targetUri: this.getUri(),
      targetRange: [this.offsetStart, this.offsetEnd],
      targetSelectionRange: [this.offsetStart, this.offsetEnd],
    }];
  }

  // Trace all GlobalPoints
  getReferences(offset: number, documentUri?: string): LocationLinkOffset[] {
    return this.getAllGlobalPointArguments()
      .filter(e => e.valueStr === this.id)
      .map(e => ({
        originSelectionRange: [this.offsetStart, this.offsetEnd],
        targetUri: e.getUri(),
        targetRange: [e.offsetStart!, e.offsetEnd!],
        targetSelectionRange: [e.offsetStart!, e.offsetEnd!]
      }));
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // return ArgumentGlobalPointCategory.getCompletions();
    const packagePath = this.getPackagePath().join("-");
    return this.getAllGlobalPointCategories().map(e => {
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
