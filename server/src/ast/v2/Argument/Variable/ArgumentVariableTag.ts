import { CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { LocationLinkOffset } from "../../../../utils/location";
import { ArgumentVariableTagNameType, ArgumentVariableTagType } from "../../../node";
import { AbstractNodeV2 } from "../../../v2";
import { ArgumentVariable } from "../ArgumentVariable";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../utils/diagnostics";
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
import { ArgumentVariableSectionPapi } from "./Section/ArgumentVariableSectionPapi";

export class ArgumentVariableTag extends AbstractNodeV2<ArgumentVariableTagType> {
  readonly type: ArgumentVariableTagType = 'ArgumentVariableTag';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariable;

  // readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariable,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    // this.argumentStr = argumentStr;
    const parts = argumentStr.split(".");
    this.addChild(new ArgumentVariableTagName(parts[0], [this.offsetStart, this.offsetStart + parts[0].length], this));
    // Parse ".papi" suffix
    if (parts.length > 1) {
      const papiString = parts.slice(1).join(".");
      this.addChild(new ArgumentVariableSectionPapi(papiString, [this.offsetStart + parts[0].length + 1, this.offsetEnd], this));
    }
  }
}

export class ArgumentVariableTagName extends AbstractNodeV2<ArgumentVariableTagNameType> {
  readonly type: ArgumentVariableTagNameType = 'ArgumentVariableTagName';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariableTag;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariableTag,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
  }

  private getAllTagDefinitions(additionalCheck?: ((child: ArgumentValue) => any | boolean)) {
    return [
      // Iterate all element lists
      this.getConditionEntries(),
      this.getEventEntries(),
      this.getObjectiveEntries()
    ].flat()
      .filter(e =>
        // Speed up searching by filtering all entries contains type = ArgumentType.tagName only
        e.kindConfig?.argumentsPatterns.mandatory.some(e => e.type === ArgumentType.tagName) ||
        e.kindConfig?.argumentsPatterns.optional?.some(e => e.type === ArgumentType.tagName)
      )
      .flatMap(e => e.getChildren<ConditionArguments | EventArguments | ObjectiveArguments>(["ConditionArguments", "EventArguments", "ObjectiveArguments"]))
      .flatMap(e => e.getChildren<ConditionArgumentMandatory | EventArgumentMandatory | ObjectiveArgumentMandatory | ConditionArgumentOptional | EventArgumentOptional | ObjectiveArgumentOptional>(["ConditionArgumentMandatory", "EventArgumentMandatory", "ObjectiveArgumentMandatory", "ConditionArgumentOptional", "EventArgumentOptional", "ObjectiveArgumentOptional"]))
      // Filter all argument by type  
      .filter(e => e.pattern?.type === ArgumentType.tagName)
      .flat()
      .map(e => e.getChild<ArgumentValue>("ArgumentValue", additionalCheck)!).filter(e => e);
  }

  private getTargetTagNameDefinitions() {
    return this.getAllTagDefinitions(e => e.valueStr === this.argumentStr);
  }

  getDiagnostics(): Diagnostic[] {
    // Check if id exists
    if (this.argumentStr.length === 0) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Tag Name is missing`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentVariableTagNameMissing
      )];
    } else if (this.getTargetTagNameDefinitions().length === 0) {
      return [this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Tag Name not found`,
        DiagnosticSeverity.Warning,
        DiagnosticCode.ArgumentVariableTagNameNotFound
      )];
    }
    return [];
  }

  // Trace all Tags Name definitions
  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    return this.getTargetTagNameDefinitions()
      .map(e => ({
        originSelectionRange: [this.offsetStart, this.offsetEnd],
        targetUri: e.getUri(),
        targetRange: [e.offsetStart!, e.offsetEnd!],
        targetSelectionRange: [e.offsetStart!, e.offsetEnd!]
      }));
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // Get definitions info
    const list = new Map<string, [string, string, string, string]>(); // label => [label, detail, document, insertText]
    this.getAllTagDefinitions().forEach(e => {
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
    const targetDefs = this.getTargetTagNameDefinitions();
    if (targetDefs.length > 0) {
      return [{
        offsetStart: this.offsetStart,
        offsetEnd: this.offsetEnd,
        tokenType: SemanticTokenType.TagName
      }];
    }
    return [];
  }

}
