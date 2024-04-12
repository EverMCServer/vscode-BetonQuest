import { Diagnostic } from "vscode-languageserver";

export type PackageV1Type = 'PackageV1';
export type PackageV2Type = 'PackageV2';
export type PackageTypes = PackageV1Type | PackageV2Type;

export type ConversationListType = 'ConversationList';
export type ConversationEntryType = 'ConversationEntry';
export type ConversationKeyType = 'ConversationKey';
export type ConversationQuesterType = 'ConversationQuester';
export type ConversationFirstType = 'ConversationFirst';
export type ConversationStopType = 'ConversationStop';
export type ConversationFinalEventsType = 'ConversationFinalEvents';
export type ConversationInterceptorType = 'ConversationInterceptor';
export type ConversationNpcArgumentsType = 'ConversationNpcArguments';
export type ConversationPlayerArgumentsType = 'ConversationPlayerArguments';
export type ConversationArgumentType = 'ConversationArgument';
export type ConversationTextType = 'ConversationText';
export type ConversationConditionsType = 'ConversationConditions';
export type ConversationArgumentEventsType = 'ConversationArgumentEvents';
export type ConversationPointersType = 'ConversationPointers';
export type ConversationTextTranslationsType = 'ConversationTextTranslations';
export type ConversationTypes = ConversationListType | ConversationEntryType | ConversationKeyType | ConversationQuesterType | ConversationFirstType | ConversationStopType | ConversationFinalEventsType | ConversationInterceptorType | ConversationNpcArgumentsType | ConversationPlayerArgumentsType | ConversationArgumentType | ConversationTextType | ConversationConditionsType | ConversationArgumentEventsType | ConversationPointersType | ConversationTextTranslationsType;

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

export interface Node<T extends NodeType> {
  type: T,
  uri: string,
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Node<NodeType>,
  diagnostics?: Diagnostic[];
  // children?: Node<NodeType>[],

  // name?: string,
  // value?: string,
  // [key: string]: any,

  // findByOffset(uri: string, offset: number): Node<T>;
  // findByType(uri: string, type: T): Node<T>;
};
