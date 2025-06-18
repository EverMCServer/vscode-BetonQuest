import { CodeAction, CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity, MarkupKind } from "vscode-languageserver";

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
import { HoverInfo } from "../../../../utils/hover";
import { LocationLinkOffset } from "../../../../utils/location";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { ObjectiveEntry } from "../../Objective/ObjectiveEntry";
import { DiagnosticCode } from "../../../../utils/diagnostics";

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

    if (this.argumentStr.length < 1) {
      this.addDiagnostic(
        [this.offsetEnd, this.offsetEnd],
        `Missing Objective ID`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariableObjectiveIdMissing
      );
    }
  }

  getObjectiveEntry() {
    return this.getObjectiveEntries(this.argumentStr).shift();
  }

  initDiagnosticsAndCodeActions(addDiagnostic: (offsets: [offsetStart?: number, offsetEnd?: number], message: string, severity: DiagnosticSeverity, code: DiagnosticCode, codeActions?: { title: string; text: string; range?: [offsetStart: number, offsetEnd: number]; }[]) => void): void {
    const objective = this.getObjectiveEntry();
    if (!objective) {
      // Check if objective ID exists
      addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Objective ID not found`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariableObjectiveIdNotFound,
      );
    } else if (objective.kindConfig?.value !== "variable") {
      if (!objective.kindConfig?.variableProperties || objective.kindConfig.variableProperties?.length === 0) {
        // Check Objective properties / "Variable Objective"
        addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Target Objective does not have any property, or it is not a "Variable Objective".`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentVariableObjectiveIdNotFound,
        );
      } else if (!this.parent.getChild<ArgumentVariableObjectivePropertyVariableName>("ArgumentVariableObjectivePropertyVariableName")) {
        // Missing property
        addDiagnostic(
          [this.offsetEnd, this.offsetEnd],
          `Missing property name`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentVariableObjectivePropertyNameMissing,
          objective.kindConfig?.variableProperties?.map(e => ({
            title: `Add property "${e.name}"`,
            text: `.${e.name}`,
            range: [this.offsetEnd, this.offsetEnd]
          }))
        );
      }
    }
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
      .forEach(e => e.kindConfig?.variableProperties?.forEach(p => result.push([e.keyString + "." + p.name, p.type, p.description + "  \n`" + e.yml.value?.value + "`"])));
    return result;
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    const completionItems: CompletionItem[] = [];

    // Get all "variable" Objectives
    this.getAllObjectiveEntries()
      .filter(e => e.kindConfig?.value === "variable").forEach(e => {
        completionItems.push({
          label: e.keyString,
          kind: CompletionItemKind.Variable,
          detail: "Variable Objective",
          documentation: {
            kind: MarkupKind.Markdown,
            value: e.kindConfig!.description!.toString()
          },
          insertText: e.keyString
        });
      });

    // Get all custom variable IDs
    this.getAllObjectiveVariableProperties().map(id => {
      completionItems.push({
        label: id[0],
        kind: CompletionItemKind.Property,
        detail: id[1],
        documentation: {
          kind: MarkupKind.Markdown,
          value: id[2]
        },
        insertText: id[0]
      });
    });

    return completionItems;
  }

  getSemanticTokens(documentUri?: string): SemanticToken[] {
    return [{
      offsetStart: this.offsetStart,
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.ObjectiveID
    }];
  }

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    const objective = this.getObjectiveEntry();
    if (objective) {
      return [{
        content:
          "(Objective) " + objective.kindConfig?.value + "\n\n"
          + objective.kindConfig?.description
          + "\n\n```\n" + objective.yml.value?.value + "\n```",
        offset: [this.offsetStart, this.offsetEnd]
      }];
    }
    return [];
  }

  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    const objective = this.getObjectiveEntry();
    if (objective) {
      return [{
        originSelectionRange: [this.offsetStart, this.offsetEnd],
        targetUri: objective.getUri(),
        targetRange: [objective.offsetStart!, objective.offsetEnd!],
        targetSelectionRange: [objective.offsetStart!, objective.offsetEnd!]
      }];
    }
    return [];
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

  initDiagnosticsAndCodeActions(addDiagnostic: (offsets: [offsetStart?: number, offsetEnd?: number], message: string, severity: DiagnosticSeverity, code: DiagnosticCode, codeActions?: { title: string; text: string; range?: [offsetStart: number, offsetEnd: number]; }[]) => void): void {
    // Check Objective Property kind and provide fix suggestions
    const objectiveEntry = this.getObjectiveEntry();
    if (!objectiveEntry?.kindConfig?.variableProperties?.find(e => e.name.toLowerCase() === this.argumentStr.toLowerCase())) {
      addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Invalid Objective Property`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariableObjectivePropertyNameInvalid,
        objectiveEntry?.kindConfig?.variableProperties?.map(e => ({
          title: `Change to "${e.name}"`,
          text: e.name
        }))
        ||
        [{
          title: `Remove`,
          text: ``,
          range: [this.offsetStart - 1, this.offsetEnd]
        }]
      );
    }
  }

  /**
   * Get Objective's Entry of this Objective Variable.
   */
  getObjectiveEntry() {
    return this.parent.getChild<ArgumentVariableObjectivePropertyObjectiveID>("ArgumentVariableObjectivePropertyObjectiveID")!.getObjectiveEntry();
  }

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    const description = this.getObjectiveEntry()?.kindConfig?.variableProperties?.find(e => e.name.toLowerCase() === this.argumentStr.toLowerCase())?.description;
    if (description) {
      return [{
        content: description,
        offset: [this.offsetStart, this.offsetEnd]
      }];
    }
    return [];
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    return this.getObjectiveEntry()?.kindConfig?.variableProperties?.map(e => ({
      label: e.name,
      kind: CompletionItemKind.Property,
      detail: e.type,
      documentation: {
        kind: MarkupKind.Markdown,
        value: e.description
      },
      insertText: e.name
    })) || [];
  }
}
