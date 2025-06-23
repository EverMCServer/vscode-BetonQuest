import { CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { LocationLinkOffset } from "../../../../utils/location";
import { ArgumentVariablePointType } from "../../../node";
import { AbstractNodeV2 } from "../../../v2";
import { ArgumentVariable } from "../ArgumentVariable";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { html2markdown } from "../../../../utils/html2markdown";
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

export class ArgumentVariablePoint extends AbstractNodeV2<ArgumentVariablePointType> {
  readonly type: ArgumentVariablePointType = 'ArgumentVariablePoint';
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

  private getAllPointDefinitions(additionalCheck?: ((child: ArgumentValue) => any | boolean)) {
    return [
      // Iterate all element lists
      this.getConditionEntries(),
      this.getEventEntries(),
      this.getObjectiveEntries()
    ].flat()
      .filter(e =>
        // Speed up searching by filtering all entries contains type = ArgumentType.pointCategory only
        e.kindConfig?.argumentsPatterns.mandatory.some(e => e.type === ArgumentType.pointCategory) ||
        e.kindConfig?.argumentsPatterns.optional?.some(e => e.type === ArgumentType.pointCategory)
      )
      .flatMap(e => e.getChildren<ConditionArguments | EventArguments | ObjectiveArguments>(["ConditionArguments", "EventArguments", "ObjectiveArguments"]))
      .flatMap(e => e.getChildren<ConditionArgumentMandatory | EventArgumentMandatory | ObjectiveArgumentMandatory | ConditionArgumentOptional | EventArgumentOptional | ObjectiveArgumentOptional>(["ConditionArgumentMandatory", "EventArgumentMandatory", "ObjectiveArgumentMandatory", "ConditionArgumentOptional", "EventArgumentOptional", "ObjectiveArgumentOptional"]))
      // Filter all argument by type  
      .filter(e => e.pattern?.type === ArgumentType.pointCategory)
      .flat()
      .map(e => e.getChild<ArgumentValue>("ArgumentValue", additionalCheck)!).filter(e => e);
  }

  private getTargetPointCategoryDefinitions() {
    return this.getAllPointDefinitions(e => e.valueStr === this.argumentStr);
  }

  private getAllPointCategories() {
    const result: Map<string, [string, string, string, string]> = new Map();
    this.getAllPointDefinitions().forEach(e => {
      // Assign PointCategory string to result
      result.set(e.valueStr, [
        e.valueStr,
        e.getPackagePath().join("-"),
        e.parent.type,
        e.parent.parent.parent.keyString
      ]);
    });
    return [...result.values()];
  }

  getDiagnostics(): Diagnostic[] {
    // Check if id exists
    if (this.argumentStr.length === 0) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Point Category is missing`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariablePointCategoryMissing
      )];
    } else if (this.getTargetPointCategoryDefinitions().length === 0) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Point Category not found`,
        DiagnosticSeverity.Warning,
        DiagnosticCode.ArgumentVariablePointCategoryNotFound
      )];
    }
    return [];
  }

  // Trace all Points Category definitions
  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    return this.getTargetPointCategoryDefinitions()
      .map(e => ({
        originSelectionRange: [this.offsetStart, this.offsetEnd],
        targetUri: e.getUri(),
        targetRange: [e.offsetStart!, e.offsetEnd!],
        targetSelectionRange: [e.offsetStart!, e.offsetEnd!]
      }));
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // Skip completion promption if it is prompted with an extra "."
    if (this.argumentStr.includes(".")) {
      return [];
    }

    return this.getAllPointCategories().map(e => {
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
        documentation: "(" + typeStr + ") " + e[3] + ", Package: " + e[1],
        insertText: e[0]
      };
    });
  }

  getSemanticTokens(documentUri?: string): SemanticToken[] {
    const targetDefs = this.getTargetPointCategoryDefinitions();
    if (targetDefs.length > 0) {
      return [{
        offsetStart: this.offsetStart,
        offsetEnd: this.offsetEnd,
        tokenType: SemanticTokenType.PointCategory
      }];
    }
    return [];
  }

}
