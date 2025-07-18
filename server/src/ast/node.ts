import { CodeAction, CodeActionKind, CompletionItem, Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";

import { SemanticToken } from "../service/semanticTokens";
import { DiagnosticCode } from "../utils/diagnostics";
import { HoverInfo } from "../utils/hover";
import { LocationLinkOffset } from "../utils/location";
import { AST } from "./ast";
import { NodeV1 } from "./v1";
import { NodeV2 } from "./v2";

export type PackageV1Type = 'PackageV1';
export type PackageV2Type = 'PackageV2';
export type PackageTypes = PackageV1Type | PackageV2Type;

export type ConversationListType = 'ConversationList';
export type ConversationType = 'Conversation';
export type ConversationSectionType = 'ConversationSection';
export type ConversationKeyType = 'ConversationKey';
export type ConversationQuesterType = 'ConversationQuester';
export type ConversationQuesterTranslationsType = 'ConversationQuesterTranslations';
export type ConversationFirstType = 'ConversationFirst';
export type ConversationStopType = 'ConversationStop';
export type ConversationFinalEventsType = 'ConversationFinalEvents';
export type ConversationInterceptorType = 'ConversationInterceptor';
export type ConversationNpcOptionType = 'ConversationNpcOption';
export type ConversationPlayerOptionType = 'ConversationPlayerOption';
export type ConversationOptionType = ConversationNpcOptionType | ConversationPlayerOptionType;
export type ConversationTextType = 'ConversationText';
export type ConversationConditionsType = 'ConversationConditions';
export type ConversationConditionType = 'ConversationCondition';
export type ConversationEventsType = 'ConversationEvents';
export type ConversationEventType = 'ConversationEvent';
export type ConversationPointersType = 'ConversationPointers';
export type ConversationFirstPointerType = 'ConversationFirstPointer';
export type ConversationNpcPointerType = 'ConversationNpcPointer';
export type ConversationPlayerPointerType = 'ConversationPlayerPointer';
export type ConversationPointerType = ConversationFirstPointerType | ConversationNpcPointerType | ConversationPlayerPointerType;
export type ConversationTextTranslationsType = 'ConversationTextTranslations';
export type ConversationTypes = ConversationListType | ConversationType | ConversationSectionType | ConversationKeyType | ConversationQuesterType | ConversationQuesterTranslationsType | ConversationFirstType | ConversationStopType | ConversationFinalEventsType | ConversationInterceptorType | ConversationOptionType | ConversationTextType | ConversationConditionsType | ConversationConditionType | ConversationEventsType | ConversationEventType | ConversationPointersType | ConversationPointerType | ConversationTextTranslationsType;

export type ConditionListType = 'ConditionList';
export type ConditionListSectionType = 'ConditionListSection';
export type ConditionEntryType = 'ConditionEntry';
export type ConditionKeyType = 'ConditionKey';
export type ConditionKindType = 'ConditionKind';
export type ConditionArgumentsType = 'ConditionArguments';
export type ConditionArgumentMandatoryType = 'ConditionArgumentMandatory';
export type ConditionArgumentOptionalType = 'ConditionArgumentOptional';
export type ConditionArgumentKeyType = 'ConditionArgumentKey';
export type ConditionArgumentValueArrayType = 'ConditionArgumentValueArray';
export type ConditionArgumentValueType = 'ConditionArgumentValue';
export type ConditionTypes = ConditionListType | ConditionListSectionType | ConditionEntryType | ConditionKeyType | ConditionKindType | ConditionArgumentsType | ConditionArgumentMandatoryType | ConditionArgumentOptionalType | ConditionArgumentKeyType | ConditionArgumentValueArrayType | ConditionArgumentValueType;

export type EventListType = 'EventList';
export type EventListSectionType = 'EventListSection';
export type EventEntryType = 'EventEntry';
export type EventKeyType = 'EventKey';
export type EventKindType = 'EventKind';
export type EventArgumentsType = 'EventArguments';
export type EventArgumentMandatoryType = 'EventArgumentMandatory';
export type EventArgumentOptionalType = 'EventArgumentOptional';
export type EventArgumentKeyType = 'EventArgumentKey';
export type EventArgumentValueArrayType = 'EventArgumentValueArray';
export type EventArgumentValueType = 'EventArgumentValue';
export type EventArgumentsListType = 'EventArgumentsList';
export type EventTypes = EventListType | EventListSectionType | EventEntryType | EventKeyType | EventKindType | EventArgumentsType | EventArgumentMandatoryType | EventArgumentOptionalType | EventArgumentKeyType | EventArgumentValueArrayType | EventArgumentValueType;

export type ObjectiveListType = 'ObjectiveList';
export type ObjectiveListSectionType = 'ObjectiveListSection';
export type ObjectiveEntryType = 'ObjectiveEntry';
export type ObjectiveKeyType = 'ObjectiveKey';
export type ObjectiveKindType = 'ObjectiveKind';
export type ObjectiveArgumentsType = 'ObjectiveArguments';
export type ObjectiveArgumentMandatoryType = 'ObjectiveArgumentMandatory';
export type ObjectiveArgumentOptionalType = 'ObjectiveArgumentOptional';
export type ObjectiveArgumentKeyType = 'ObjectiveArgumentKey';
export type ObjectiveArgumentValueArrayType = 'ObjectiveArgumentValueArray';
export type ObjectiveArgumentValueType = 'ObjectiveArgumentValue';
export type ObjectiveTypes = ObjectiveListType | ObjectiveListSectionType | ObjectiveEntryType | ObjectiveKeyType | ObjectiveKindType | ObjectiveArgumentsType | ObjectiveArgumentMandatoryType | ObjectiveArgumentOptionalType | ObjectiveArgumentKeyType | ObjectiveArgumentValueArrayType | ObjectiveArgumentValueType;

// export type ElementListType = EventListType | ConditionListType | ObjectiveListType;
// export type ElementEntryType = EventEntryType | ConditionEntryType | ObjectiveEntryType;
// export type ElementKeyType = EventKeyType | ConditionKeyType | ObjectiveKeyType;
// export type ElementKindType = EventKindType | ConditionKindType | ObjectiveKindType;
// export type ElementArgumentsType = EventArgumentsType | ConditionArgumentsType | ObjectiveArgumentsType;
// export type ElementArgumentType = EventArgumentMandatoryType | EventArgumentOptionalType | ConditionArgumentMandatoryType | ConditionArgumentOptionalType | ObjectiveArgumentMandatoryType | ObjectiveArgumentOptionalType;
// export type ElementArgumentKeyType = EventArgumentKeyType | ConditionArgumentKeyType | ObjectiveArgumentKeyType;
// export type ElementArgumentValueArrayType = EventArgumentValueArrayType | ConditionArgumentValueArrayType | ObjectiveArgumentValueArrayType;
// export type ElementArgumentValueType = EventArgumentValueType | ConditionArgumentValueType | ObjectiveArgumentValueType;
// export type ElementTypes = ElementListType | ElementEntryType | ElementKeyType | ElementKindType | ElementArgumentsType | ElementArgumentType | ElementArgumentKeyType | ElementArgumentValueArrayType | ElementArgumentValueType;
export type ArgumentKeyType = "ArgumentKey";
export type ArgumentKeyProxyType = "ArgumentKey";
export type ArgumentValueType = "ArgumentValue";
export type ArgumentValueProxyType = "ArgumentValue";
export type ArgumentTypes = ArgumentKeyType | ArgumentKeyProxyType | ArgumentValueType | ArgumentValueProxyType;

export type ArgumentVariableType = 'ArgumentVariable';
export type ArgumentVariableKindType = 'ArgumentVariableKind';
export type ArgumentVariableObjectivePropertyType = 'ArgumentVariableObjectiveVariableProperty';
export type ArgumentVariableObjectivePropertyObjectiveIdType = 'ArgumentVariableObjectivePropertyObjectiveID';
export type ArgumentVariableObjectivePropertyVariableNameType = 'ArgumentVariableObjectivePropertyVariableName';
export type ArgumentVariableConditionType = 'ArgumentVariableCondition';
export type ArgumentVariableConditionIdType = 'ArgumentVariableConditionID';
export type ArgumentVariablePointType = 'ArgumentVariablePoint';
export type ArgumentVariableGlobalPointType = 'ArgumentVariableGlobalPoint';
export type ArgumentVariableTagType = 'ArgumentVariableTag';
export type ArgumentVariableTagNameType = 'ArgumentVariableTagName';
export type ArgumentVariableGlobalTagType = 'ArgumentVariableGlobalTag';
export type ArgumentVariableGlobalTagNameType = 'ArgumentVariableGlobalTagName';
export type ArgumentVariableEvalType = 'ArgumentVariableEval';
export type ArgumentVariableItemType = 'ArgumentVariableItem';
export type ArgumentVariableItemDurabilityType = 'ArgumentVariableItemDurability';
export type ArgumentVariableLocationType = 'ArgumentVariableLocation';
export type ArgumentVariableMathType = 'ArgumentVariableMath';
export type ArgumentVariableNpcType = 'ArgumentVariableNpc';
export type ArgumentVariablePlayerType = 'ArgumentVariablePlayer';
export type ArgumentVariableRandomNumberType = 'ArgumentVariableRandomNumber';
export type ArgumentVariableVersionType = 'ArgumentVariableVersion';
export type ArgumentVariableSectionPapiType = 'ArgumentVariableSectionPapi';
export type ArgumentIntergerType = 'ArgumentInterger';
export type ArgumentFloatType = 'ArgumentFloat';
export type ArgumentBlockIdType = 'ArgumentBlockID';
export type ArgumentEntityType = 'ArgumentEntity';
export type ArgumentConditionIdType = 'ArgumentConditionID';
export type ArgumentGlobalPointCategoryType = 'ArgumentGlobalPointCategory';
export type ArgumentEventIdType = 'ArgumentEventID';
export type ArgumentObjectiveIdType = 'ArgumentObjectiveID';
export type ArgumentValueTypes =
  ArgumentVariableType |
  ArgumentVariableKindType |
  ArgumentVariableObjectivePropertyType |
  ArgumentVariableObjectivePropertyObjectiveIdType |
  ArgumentVariableObjectivePropertyVariableNameType |
  ArgumentVariableConditionType |
  ArgumentVariableConditionIdType |
  ArgumentVariablePointType |
  ArgumentVariableGlobalPointType |
  ArgumentVariableTagType |
  ArgumentVariableTagNameType |
  ArgumentVariableGlobalTagType |
  ArgumentVariableGlobalTagNameType |
  ArgumentVariableEvalType |
  ArgumentVariableEvalType |
  ArgumentVariableItemType |
  ArgumentVariableItemDurabilityType |
  ArgumentVariableLocationType |
  ArgumentVariableMathType |
  ArgumentVariableNpcType |
  ArgumentVariablePlayerType |
  ArgumentVariableRandomNumberType |
  ArgumentVariableVersionType |
  ArgumentVariableSectionPapiType |
  ArgumentIntergerType |
  ArgumentFloatType |
  ArgumentBlockIdType |
  ArgumentEntityType |
  ArgumentConditionIdType |
  ArgumentGlobalPointCategoryType |
  ArgumentEventIdType |
  ArgumentObjectiveIdType;

export type NodeType = PackageTypes | ConversationTypes | EventTypes | ConditionTypes | ObjectiveTypes | ArgumentTypes | ArgumentValueTypes;

export abstract class AbstractNode<T extends NodeType, N extends NodeV1 | NodeV2> {
  readonly abstract type: T;
  protected uri?: string;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly abstract parent: N;
  protected children: N[] = [];
  protected diagnostics: Diagnostic[] = [];
  protected codeActions: CodeAction[] = [];
  private diagnosticsBuffer: Diagnostic[] = [];
  private codeActionsBuffer: CodeAction[] = [];
  protected semanticTokens: SemanticToken[] = [];

  getUri(): string {
    if (this.uri) {
      return this.uri;
    } else if (this.parent.type !== this.type) {
      return this.parent.getUri();
    }
    return "";
  }

  addChild(child: N) {
    this.children.push(child);
  }

  getChild<Node extends N>(type: NodeType | NodeType[], additionalCheck?: (child: Node) => any | boolean) {
    return this.children.find<Node>((c): c is Node => (c.type === type || type.includes(c.type)) && (!additionalCheck || additionalCheck(c as Node)));
  }

  getChildren<Node extends N>(type?: NodeType | NodeType[], additionalCheck?: (child: Node) => any | boolean) {
    if (type) {
      return this.children.filter<Node>((c): c is Node => (c.type === type || type.includes(c.type)) && (!additionalCheck || additionalCheck(c as Node)));
    }
    return this.children as Node[];
  }

  /**
   * Get the root AST node.
   */
  abstract getAst(): AST;

  /**
   * Run Diagnostics And CodeActions generation after node created.
   */
  _initDiagnosticsAndCodeActions() {
    this.children.forEach(c => {
      c._initDiagnosticsAndCodeActions();
    });
    // Clear buffer
    this.diagnosticsBuffer = [];
    this.codeActionsBuffer = [];
    // Call Diagnostics init
    this.initDiagnosticsAndCodeActions(this.writeDiagnosticBuffer);
  }

  private writeDiagnosticBuffer = (offsets: [offsetStart?: number, offsetEnd?: number], message: string, severity: DiagnosticSeverity, code: DiagnosticCode, codeActions?: {
    title: string;
    text: string;
    range?: [offsetStart: number, offsetEnd: number];
  }[]) => {
    if (offsets[0] === undefined || offsets[1] === undefined) {
      return;
    }
    const diagnostic = this.generateDiagnostic([offsets[0], offsets[1]], message, severity, code);
    const actions = this.generateCodeActions(diagnostic, codeActions);
    this.diagnosticsBuffer.push(diagnostic);
    this.codeActionsBuffer.push(...actions);
  };

  /**
   * Extra Diagnostics And CodeActions generation after node created.  
   * This method is called when documents CREATED or UPDATED.  
   * You must call addDiagnostic(), NOT this.addDiagnostic(), within initDiagnosticsAndCodeActions() to save Diagnostics and CodeActions.
   */
  initDiagnosticsAndCodeActions(addDiagnostic: typeof this.writeDiagnosticBuffer) { }

  _getDiagnostics(): Diagnostic[] {
    const results = [
      ...this.children.flatMap(c => c._getDiagnostics()),
      ...this.getDiagnostics(),
      ...this.diagnostics,
      ...this.diagnosticsBuffer,
    ];
    return results;
  }

  getDiagnostics(): Diagnostic[] {
    return [];
  }

  addDiagnostic(offsets: [offsetStart?: number, offsetEnd?: number], message: string, severity: DiagnosticSeverity, code: DiagnosticCode, codeActions?: { title: string, text: string, range?: [offsetStart: number, offsetEnd: number] }[]) {
    if (offsets[0] === undefined || offsets[1] === undefined) {
      return;
    }
    const diagnostic = this.generateDiagnostic([offsets[0], offsets[1]], message, severity, code);
    this.diagnostics.push(diagnostic);
    this.codeActions.push(...this.generateCodeActions(diagnostic, codeActions));
  }

  generateDiagnostic(offsets: [offsetStart: number, offsetEnd: number], message: string, severity: DiagnosticSeverity, code: DiagnosticCode) {
    const range = this.getRangeByOffset(offsets[0], offsets[1]);
    return {
      range: range,
      message: message,
      severity: severity,
      source: 'BetonQuest',
      code: code
    } as Diagnostic;
  }

  _getCodeActions(documentUri?: string): CodeAction[] {
    const results = [
      ...this.children.flatMap(c => c._getCodeActions(documentUri)),
      ...this.getCodeActions(documentUri),
      ...this.codeActions,
      ...this.codeActionsBuffer
    ];
    return results;
  }

  getCodeActions(documentUri?: string): CodeAction[] {
    return [];
  }

  addCodeActions(...codeActions: CodeAction[]) {
    this.codeActions.push(...codeActions);
  }

  generateCodeActions(diagnostic: Diagnostic, codeActions?: { title: string, text: string, range?: [offsetStart: number, offsetEnd: number] }[]) {
    const result: CodeAction[] = [];
    codeActions?.forEach(({ title, text, range: r }) => {
      result.push({
        title: title,
        kind: CodeActionKind.QuickFix,
        diagnostics: [diagnostic],
        edit: {
          changes: {
            [this.getUri()]: [{
              range: r ? this.getRangeByOffset(r[0], r[1]) : diagnostic.range,
              newText: text
            }]
          }
        }
      });
    });
    return result;
  }

  addSemanticTokens(...token: SemanticToken[]) {
    this.semanticTokens.push(...token);
  }

  _getSemanticTokens(documentUri?: string): SemanticToken[] {
    return [
      ...this.semanticTokens,
      ...this.getSemanticTokens(documentUri),
      ...this.children.flatMap(c => c._getSemanticTokens(documentUri))
    ];
  }

  getSemanticTokens(documentUri?: string): SemanticToken[] {
    return [];
  }

  _getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    if (!this.offsetStart || !this.offsetEnd || (offset >= this.offsetStart && offset <= this.offsetEnd)) {
      return [
        ...this.getHoverInfo(offset, documentUri),
        ...this.children.flatMap(c => c._getHoverInfo(offset, documentUri))
      ];
    }
    return [];
  }

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    return [];
  }

  _getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    if (!this.offsetStart || !this.offsetEnd || (offset >= this.offsetStart && offset <= this.offsetEnd)) {
      return [
        ...this.getDefinitions(offset, documentUri),
        ...this.children.flatMap(c => c._getDefinitions(offset, documentUri))
      ];
    }
    return [];
  }

  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    return [];
  }

  _getReferences(offset: number, documentUri?: string): LocationLinkOffset[] {
    if (!this.offsetStart || !this.offsetEnd || (offset >= this.offsetStart && offset <= this.offsetEnd)) {
      return [
        ...this.getReferences(offset, documentUri),
        ...this.children.flatMap(c => c._getReferences(offset, documentUri))
      ];
    }
    return [];
  }

  getReferences(offset: number, documentUri?: string): LocationLinkOffset[] {
    return [];
  }

  _getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    if (!this.offsetStart || !this.offsetEnd || (offset >= this.offsetStart && offset <= this.offsetEnd)) {
      return [
        ...this.getCompletions(offset, documentUri),
        ...this.children.flatMap(c => c._getCompletions(offset, documentUri))
      ];
    }
    return [];
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    return [];
  }

  /**
   * Get range by offset.
   * This method must be overrided / hijacked by the top-level class.
   */
  getRangeByOffset(offsetStart: number, offsetEnd: number): Range {
    return this.parent.getRangeByOffset(offsetStart, offsetEnd);
  }

  /**
   * Get target package's uri by package path.
   * This method must be overrided / hijacked by the top-level class.
   */
  getPackageUri(targetPackagePath?: string): string {
    return this.parent.getPackageUri(targetPackagePath);
  }
};
