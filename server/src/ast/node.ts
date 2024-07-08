import { CodeAction, CodeActionKind, Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";

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

export type ElementListType = EventListType | ConditionListType | ObjectiveListType;
export type ElementEntryType = EventEntryType | ConditionEntryType | ObjectiveEntryType;
export type ElementKeyType = EventKeyType | ConditionKeyType | ObjectiveKeyType;
export type ElementKindType = EventKindType | ConditionKindType | ObjectiveKindType;
export type ElementArgumentsType = EventArgumentsType | ConditionArgumentsType | ObjectiveArgumentsType;
export type ElementArgumentType = EventArgumentMandatoryType | EventArgumentOptionalType | ConditionArgumentMandatoryType | ConditionArgumentOptionalType | ObjectiveArgumentMandatoryType | ObjectiveArgumentOptionalType;
export type ElementArgumentKeyType = EventArgumentKeyType | ConditionArgumentKeyType | ObjectiveArgumentKeyType;
export type ElementArgumentValueArrayType = EventArgumentValueArrayType | ConditionArgumentValueArrayType | ObjectiveArgumentValueArrayType;
export type ElementArgumentValueType = EventArgumentValueType | ConditionArgumentValueType | ObjectiveArgumentValueType;
export type ElementTypes = ElementListType | ElementEntryType | ElementKeyType | ElementKindType | ElementArgumentsType | ElementArgumentType | ElementArgumentKeyType | ElementArgumentValueArrayType | ElementArgumentValueType;

export type NodeType = PackageTypes | ConversationTypes | EventTypes | ConditionTypes | ObjectiveTypes;

export abstract class AbstractNode<T extends NodeType, N extends NodeV1 | NodeV2> {
  readonly abstract type: T;
  protected uri?: string;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly abstract parent: N;
  protected children: N[] = [];
  protected diagnostics: Diagnostic[] = [];
  protected codeActions: CodeAction[] = [];
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

  getChildren<Node extends N>(type?: NodeType, additionalCheck?: (child: Node) => any | boolean) {
    if (type) {
      return this.children.filter<Node>((c): c is Node => c.type === type && (!additionalCheck || additionalCheck(c as Node)));
    }
    return this.children as Node[];
  }

  /**
   * Get the root AST node
   */
  abstract getAst(): AST;

  getDiagnostics(): Diagnostic[] {
    return [
      ...this.diagnostics,
      ...this.children.flatMap(c => c.getDiagnostics())
    ];
  }

  addDiagnostic(offsets: [offsetStart?: number, offsetEnd?: number], message: string, severity: DiagnosticSeverity, code: DiagnosticCode, codeActions?: { title: string, text: string, range?: [offsetStart: number, offsetEnd: number] }[]) {
    if (offsets[0] === undefined || offsets[1] === undefined) {
      return;
    }
    const range = this.getRangeByOffset(offsets[0], offsets[1]);
    const diagnostic: Diagnostic = {
      range: range,
      message: message,
      severity: severity,
      source: 'BetonQuest',
      code: code
    };
    this.diagnostics.push(diagnostic);
    codeActions?.forEach(({ title, text, range: r }) => {
      this.codeActions.push({
        title: title,
        kind: CodeActionKind.QuickFix,
        diagnostics: [diagnostic],
        edit: {
          changes: {
            [this.getUri()]: [{
              range: r ? this.getRangeByOffset(r[0], r[1]) : range,
              newText: text
            }]
          }
        }
      });
    });
  }

  _addDiagnostic(...diag: Diagnostic[]) {
    this.diagnostics.push(...diag);
  }

  getCodeActions(documentUri?: string): CodeAction[] {
    return [
      ...this.codeActions,
      ...this.children.flatMap(c => c.getCodeActions(documentUri))
    ];
  }

  addCodeActions(...codeActions: CodeAction[]) {
    this.codeActions.push(...codeActions);
  }

  addSemanticTokens(...token: SemanticToken[]) {
    this.semanticTokens.push(...token);
  }

  getSemanticTokens(documentUri?: string): SemanticToken[] {
    return [
      ...this.semanticTokens,
      ...this.children.flatMap(c => c.getSemanticTokens(documentUri))
    ];
  };

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    return this.children
      .filter(c => !c.offsetStart || !c.offsetEnd || (offset >= c.offsetStart && offset <= c.offsetEnd))
      .flatMap(c => c.getHoverInfo(offset, documentUri));
  }

  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    return this.children
      .filter(c => !c.offsetStart || !c.offsetEnd || (offset >= c.offsetStart && offset <= c.offsetEnd))
      .flatMap(c => c.getDefinitions(offset, documentUri));
  }

  getReferences(offset: number, documentUri?: string): LocationLinkOffset[] {
    return this.children
      .filter(c => !c.offsetStart || !c.offsetEnd || (offset >= c.offsetStart && offset <= c.offsetEnd))
      .flatMap(c => c.getReferences(offset, documentUri));
  }

  // Get range by offset.
  // This method must be overrided / hijacked by the top-level class.
  getRangeByOffset(offsetStart: number, offsetEnd: number): Range {
    return this.parent.getRangeByOffset(offsetStart, offsetEnd);
  }

  // Get target package's uri by package path.
  // This method must be overrided / hijacked by the top-level class.
  getPackageUri(targetPackagePath?: string): string {
    return this.parent.getPackageUri(targetPackagePath);
  }
};
