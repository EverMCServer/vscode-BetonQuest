import { CodeAction, CodeActionKind, Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";
import { ConditionEntry as ConditionEntryV1 } from "./v1/Condition/ConditionEntry";
import { ConditionEntry as ConditionEntryV2 } from "./v2/Condition/ConditionEntry";

export type PackageV1Type = 'PackageV1';
export type PackageV2Type = 'PackageV2';
export type PackageTypes = PackageV1Type | PackageV2Type;

export type ConversationListType = 'ConversationList';
export type ConversationType = 'Conversation';
export type ConversationKeyType = 'ConversationKey';
export type ConversationQuesterType = 'ConversationQuester';
export type ConversationQuesterTranslationsType = 'ConversationQuesterTranslations';
export type ConversationFirstType = 'ConversationFirst';
export type ConversationStopType = 'ConversationStop';
export type ConversationFinalEventsType = 'ConversationFinalEvents';
export type ConversationInterceptorType = 'ConversationInterceptor';
export type ConversationNpcOptionsType = 'ConversationNpcOptions';
export type ConversationPlayerOptionsType = 'ConversationPlayerOptions';
export type ConversationOptionsType = ConversationNpcOptionsType | ConversationPlayerOptionsType;
export type ConversationNpcOptionType = 'ConversationNpcOption';
export type ConversationPlayerOptionType = 'ConversationPlayerOption';
export type ConversationOptionType = ConversationNpcOptionType | ConversationPlayerOptionType;
export type ConversationTextType = 'ConversationText';
export type ConversationConditionsType = 'ConversationConditions';
export type ConversationConditionType = 'ConversationCondition';
export type ConversationEventsType = 'ConversationEvents';
export type ConversationEventType = 'ConversationEvent';
export type ConversationPointersType = 'ConversationPointers';
export type ConversationPointerType = 'ConversationPointer';
export type ConversationTextTranslationsType = 'ConversationTextTranslations';
export type ConversationTypes = ConversationListType | ConversationType | ConversationKeyType | ConversationQuesterType | ConversationQuesterTranslationsType | ConversationFirstType | ConversationStopType | ConversationFinalEventsType | ConversationInterceptorType | ConversationOptionsType | ConversationOptionType | ConversationTextType | ConversationConditionsType | ConversationConditionType | ConversationEventsType | ConversationEventType | ConversationPointersType | ConversationPointerType | ConversationTextTranslationsType;

export type EventListType = 'EventList';
export type EventEntryType = 'EventEntry';
export type EventKeyType = 'EventKey';
export type EventKindType = 'EventKind';
export type EventArgumentsType = 'EventArguments';
export type EventArgumentType = 'EventArgument';
export type EventArgumentKeyType = 'EventArgumentKey';
export type EventArgumentValueArrayType = 'EventArgumentValueArray';
export type EventArgumentValueType = 'EventArgumentValue';
export type EventArgumentsListType = 'EventArgumentsList';
export type EventTypes = EventListType | EventEntryType | EventKeyType | EventKindType | EventArgumentsType | EventArgumentType | EventArgumentKeyType | EventArgumentValueArrayType | EventArgumentValueType;

export type ConditionListType = 'ConditionList';
export type ConditionEntryType = 'ConditionEntry';
export type ConditionKeyType = 'ConditionKey';
export type ConditionKindType = 'ConditionKind';
export type ConditionArgumentsType = 'ConditionArguments';
export type ConditionArgumentType = 'ConditionArgument';
export type ConditionArgumentKeyType = 'ConditionArgumentKey';
export type ConditionArgumentValueArrayType = 'ConditionArgumentValueArray';
export type ConditionArgumentValueType = 'ConditionArgumentValue';
export type ConditionTypes = ConditionListType | ConditionEntryType | ConditionKeyType | ConditionKindType | ConditionArgumentsType | ConditionArgumentType | ConditionArgumentKeyType | ConditionArgumentValueArrayType | ConditionArgumentValueType;

export type ObjectiveListType = 'ObjectiveList';
export type ObjectiveEntryType = 'ObjectiveEntry';
export type ObjectiveKeyType = 'ObjectiveKey';
export type ObjectiveKindType = 'ObjectiveKind';
export type ObjectiveArgumentsType = 'ObjectiveArguments';
export type ObjectiveArgumentType = 'ObjectiveArgument';
export type ObjectiveArgumentKeyType = 'ObjectiveArgumentKey';
export type ObjectiveArgumentValueArrayType = 'ObjectiveArgumentValueArray';
export type ObjectiveArgumentValueType = 'ObjectiveArgumentValue';
export type ObjectiveTypes = ObjectiveListType | ObjectiveEntryType | ObjectiveKeyType | ObjectiveKindType | ObjectiveArgumentsType | ObjectiveArgumentType | ObjectiveArgumentKeyType | ObjectiveArgumentValueArrayType | ObjectiveArgumentValueType;

export type ElementListType = EventListType | ConditionListType | ObjectiveListType;
export type ElementEntryType = EventEntryType | ConditionEntryType | ObjectiveEntryType;
export type ElementKeyType = EventKeyType | ConditionKeyType | ObjectiveKeyType;
export type ElementKindType = EventKindType | ConditionKindType | ObjectiveKindType;
export type ElementArgumentsType = EventArgumentsType | ConditionArgumentsType | ObjectiveArgumentsType;
export type ElementArgumentType = EventArgumentType | ConditionArgumentType | ObjectiveArgumentType;
export type ElementArgumentKeyType = EventArgumentKeyType | ConditionArgumentKeyType | ObjectiveArgumentKeyType;
export type ElementArgumentValueArrayType = EventArgumentValueArrayType | ConditionArgumentValueArrayType | ObjectiveArgumentValueArrayType;
export type ElementArgumentValueType = EventArgumentValueType | ConditionArgumentValueType | ObjectiveArgumentValueType;
export type ElementTypes = ElementListType | ElementEntryType | ElementKeyType | ElementKindType | ElementArgumentsType | ElementArgumentType | ElementArgumentKeyType | ElementArgumentValueArrayType | ElementArgumentValueType;

export type NodeType = PackageTypes | ConversationTypes | EventTypes | ConditionTypes | ObjectiveTypes;

export abstract class Node<T extends NodeType> {
  protected abstract type: T;
  protected abstract uri: string;
  protected offsetStart?: number;
  protected offsetEnd?: number;
  protected abstract parent: Node<NodeType>;
  protected diagnostics: Diagnostic[] = [];
  protected codeActions: CodeAction[] = [];
  // children?: Node<NodeType>[],

  // name?: string,
  // value?: string,
  // [key: string]: any,

  // findByOffset(uri: string, offset: number): Node<T>;
  // findByType(uri: string, type: T): Node<T>;

  // getParent(): Node<NodeType>;

  _addDiagnostic(range: Range, message: string, severity: DiagnosticSeverity, code: string, codeActions?: { title: string, text: string, range?: Range }[]) {
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
            [this.uri]: [{
              range: r ?? range,
              newText: text
            }]
          }
        }
      });
    });
  }

  getUri() {
    return this.uri;
  }

  getOffsetStart() {
    return this.offsetStart;
  }

  getOffsetEnd() {
    return this.offsetEnd;
  }

  getDiagnostics() {
    return this.diagnostics;
  }

  getCodeActions() {
    return this.codeActions;
  }
};

export abstract class NodeV1<T extends NodeType> extends Node<T> {
  protected abstract parent: NodeV1<NodeType>;

  getConditionEntry(id: string, path: string[], sourcePath: string[]): ConditionEntryV1[] {
    return this.parent.getConditionEntry(id, path, sourcePath);
  }
}

export abstract class NodeV2<T extends NodeType> extends Node<T> {
  protected abstract parent: NodeV2<NodeType>;

  getConditionEntry(id: string, path: string[], sourcePath: string[]): ConditionEntryV2[] {
    return this.parent.getConditionEntry(id, path, sourcePath);
  }
}
