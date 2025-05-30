import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { ArgumentVariableObjectivePropertyObjectiveIdType, ArgumentVariableObjectivePropertyType, ArgumentVariableObjectivePropertyVariableNameType } from "../../../node";
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
import { ArgumentValue } from "../ArgumentValue";
import { ArgumentVariable } from "../ArgumentVariable";

export class ArgumentVariableObjectiveProperty extends AbstractNodeV2<ArgumentVariableObjectivePropertyType> {
  readonly type: ArgumentVariableObjectivePropertyType = 'ArgumentVariableObjectiveVariableProperty';
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

    // Parse
    // this.argumentStr = `objective_id` + `.` + `property_name`
    const parts = this.argumentStr.split(".", 2);

    this.addChild(new ArgumentVariableObjectivePropertyObjectiveID(parts[0], [this.offsetStart, this.offsetStart + parts[0].length], this));
    if (parts.length > 1) {
      this.addChild(new ArgumentVariableObjectivePropertyVariableName(parts[1], [this.offsetStart + parts[0].length + 1, this.offsetEnd], this));
    }
  }

  // DEBUG
  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    return [];
  }

}

export class ArgumentVariableObjectivePropertyObjectiveID extends AbstractNodeV2<ArgumentVariableObjectivePropertyObjectiveIdType> {
  readonly type: ArgumentVariableObjectivePropertyObjectiveIdType = 'ArgumentVariableObjectivePropertyObjectiveID';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariableObjectiveProperty;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariableObjectiveProperty,
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
  private getAllObjectiveVariableProperties(): [string, string, string][] { // return: [name, detail, description]
    const result: [string, string, string][] = [];
    this.getObjectiveEntries() // Iterate element lists within package
      .filter(e =>
        // Speed up searching by filtering all entries contains variableProperties
        e.kindConfig?.variableProperties &&
        e.kindConfig.variableProperties.length > 0
      )
      .forEach(e => e.kindConfig?.variableProperties?.forEach(p => result.push([e.keyString + "." + p.name, p.type, p.description])));
    return result;
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    const completionItems: CompletionItem[] = [];

    // Get all custom variable IDs
    this.getAllObjectiveVariableProperties().map(id => {
      completionItems.push({
        label: id[0],
        kind: CompletionItemKind.Variable,
        detail: id[1],
        documentation: id[2],
        insertText: id[0]
      });
    });

    return completionItems;
  }
}

export class ArgumentVariableObjectivePropertyVariableName extends AbstractNodeV2<ArgumentVariableObjectivePropertyVariableNameType> {
  readonly type: ArgumentVariableObjectivePropertyVariableNameType = 'ArgumentVariableObjectivePropertyVariableName';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariableObjectiveProperty;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariableObjectiveProperty,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
  }
}
