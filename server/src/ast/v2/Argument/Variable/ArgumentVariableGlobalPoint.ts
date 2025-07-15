import { CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { LocationLinkOffset } from "../../../../utils/location";
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
import { ArgumentValue } from "../ArgumentValue";
import { ArgumentVariable } from "../ArgumentVariable";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../utils/diagnostics";

export class ArgumentVariableGlobalPoint extends AbstractNodeV2<ArgumentVariableGlobalPointType> {
  readonly type: ArgumentVariableGlobalPointType = 'ArgumentVariableGlobalPoint';
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

  private getAllGlobalPointDefinitions(additionalCheck?: ((child: ArgumentValue) => any | boolean)) {
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
      .map(e => e.getChild<ArgumentValue>("ArgumentValue", additionalCheck)!).filter(e => e);
  }

  private getTargetGlobalPointCategoryDefinitions() {
    return this.getAllGlobalPointDefinitions(e => e.valueStr === this.argumentStr);
  }

  getDiagnostics(): Diagnostic[] {
    // Check if id exists
    if (this.argumentStr.length === 0) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Global Point Category is missing`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariableGlobalPointCategoryMissing
      )];
    } else if (this.getTargetGlobalPointCategoryDefinitions().length === 0) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Global Point Category not found`,
        DiagnosticSeverity.Warning,
        DiagnosticCode.ArgumentVariableGlobalPointCategoryNotFound
      )];
    }
    return [];
  }

  // Trace all GlobalPoints Category definitions
  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    return this.getTargetGlobalPointCategoryDefinitions()
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

    // Get definitions info
    const list = new Map<string, [string, string, string, string]>(); // label => [label, detail, document, insertText]
    this.getAllGlobalPointDefinitions().forEach(e => {
      let typeStr = e.parent.type as string;
      if (typeStr.startsWith("Condition")) {
        typeStr = "Condition";
      } else if (typeStr.startsWith("Event")) {
        typeStr = "Event";
      } else if (typeStr.startsWith("Objective")) {
        typeStr = "Objective";
      }

      // Consolidate completion description
      const d = list.get(e.valueStr);
      if (d) {
        d[2] += "\n\n(" + typeStr + ") " + e.parent.parent.parent.keyString + ": `" + e.parent.parent.parent.yml.value?.value + "`";
        list.set(e.valueStr, d);
      } else {
        list.set(e.valueStr, [
          e.valueStr,
          e.valueStr,
          "(" + typeStr + ") " + e.parent.parent.parent.keyString + ": `" + e.parent.parent.parent.yml.value?.value + "`",
          e.valueStr
        ]);
      }
    });

    return [...list.values()].map(e => {
      return {
        label: e[0],
        kind: CompletionItemKind.EnumMember,
        detail: e[1],
        documentation: {
          kind: 'markdown',
          value: e[2]
        },
        insertText: e[3]
      };
    });

  }

  getSemanticTokens(documentUri?: string): SemanticToken[] {
    const targetDefs = this.getTargetGlobalPointCategoryDefinitions();
    if (targetDefs.length > 0) {
      return [{
        offsetStart: this.offsetStart,
        offsetEnd: this.offsetEnd,
        tokenType: SemanticTokenType.GlobalPointCategory
      }];
    }
    return [];
  }

}
