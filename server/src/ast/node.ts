
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
export type ConversationNpcOptionsType = 'ConversationNpcOptions';
export type ConversationPlayerOptionsType = 'ConversationPlayerOptions';
export type ConversationOptionType = 'ConversationOption';
export type ConversationTextType = 'ConversationText';
export type ConversationConditionsType = 'ConversationConditions';
export type ConversationOptionEventsType = 'ConversationOptionEvents';
export type ConversationPointersType = 'ConversationPointers';
export type ConversationTextTranslationsType = 'ConversationTextTranslations';
export type ConversationTypes = ConversationListType | ConversationEntryType | ConversationKeyType | ConversationQuesterType | ConversationFirstType | ConversationStopType | ConversationFinalEventsType | ConversationInterceptorType | ConversationNpcOptionsType | ConversationPlayerOptionsType | ConversationOptionType | ConversationTextType | ConversationConditionsType | ConversationOptionEventsType | ConversationPointersType | ConversationTextTranslationsType;

export type EventListType = 'EventList';
export type EventEntryType = 'EventEntry';
export type EventKeyType = 'EventKey';
export type EventKindType = 'EventKind';
export type EventOptionsType = 'EventOptions';
export type EventOptionType = 'EventOption';
export type EventOptionKeyType = 'EventOptionKey';
export type EventOptionValueArrayType = 'EventOptionValueArray';
export type EventOptionValueType = 'EventOptionValue';
export type EventOptionsListType = 'EventOptionsList';
export type EventTypes = EventListType | EventEntryType | EventKeyType | EventKindType | EventOptionsType | EventOptionType | EventOptionKeyType | EventOptionValueArrayType | EventOptionValueType;

export type ConditionListType = 'ConditionList';
export type ConditionEntryType = 'ConditionEntry';
export type ConditionKeyType = 'ConditionKey';
export type ConditionKindType = 'ConditionKind';
export type ConditionOptionsType = 'ConditionOptions';
export type ConditionOptionType = 'ConditionOption';
export type ConditionOptionKeyType = 'ConditionOptionKey';
export type ConditionOptionValueArrayType = 'ConditionOptionValueArray';
export type ConditionOptionValueType = 'ConditionOptionValue';
export type ConditionTypes = ConditionListType | ConditionEntryType | ConditionKeyType | ConditionKindType | ConditionOptionsType | ConditionOptionType | ConditionOptionKeyType | ConditionOptionValueArrayType | ConditionOptionValueType;

export type ObjectiveListType = 'ObjectiveList';
export type ObjectiveEntryType = 'ObjectiveEntry';
export type ObjectiveKeyType = 'ObjectiveKey';
export type ObjectiveKindType = 'ObjectiveKind';
export type ObjectiveOptionsType = 'ObjectiveOptions';
export type ObjectiveOptionType = 'ObjectiveOption';
export type ObjectiveOptionKeyType = 'ObjectiveOptionKey';
export type ObjectiveOptionValueArrayType = 'ObjectiveOptionValueArray';
export type ObjectiveOptionValueType = 'ObjectiveOptionValue';
export type ObjectiveTypes = ObjectiveListType | ObjectiveEntryType | ObjectiveKeyType | ObjectiveKindType | ObjectiveOptionsType | ObjectiveOptionType | ObjectiveOptionKeyType | ObjectiveOptionValueArrayType | ObjectiveOptionValueType;

export type ElementListType = EventListType | ConditionListType | ObjectiveListType;
export type ElementEntryType = EventEntryType | ConditionEntryType | ObjectiveListType;
export type ElementKeyType = EventKeyType | ConditionKeyType | ObjectiveKeyType;
export type ElementKindType = EventKindType | ConditionKindType | ObjectiveKindType;
export type ElementOptionsType = EventOptionsType | ConditionOptionsType | ObjectiveOptionsType;
export type ElementOptionType = EventOptionType | ConditionOptionType | ObjectiveOptionType;
export type ElementOptionKeyType = EventOptionKeyType | ConditionOptionKeyType | ObjectiveOptionKeyType;
export type ElementOptionValueArrayType = EventOptionValueArrayType | ConditionOptionValueArrayType | ObjectiveOptionValueArrayType;
export type ElementOptionValueType = EventOptionValueType | ConditionOptionValueType | ObjectiveOptionValueType;
export type ElementTypes = ElementListType | ElementEntryType | ElementKeyType | ElementKindType | ElementOptionsType | ElementOptionType | ElementOptionKeyType | ElementOptionValueArrayType | ElementOptionValueType;

export type NodeType = PackageTypes | ConversationTypes | EventTypes | ConditionTypes | ObjectiveTypes;

export interface Node<T extends NodeType> {
  type: T,
  uri?: string,
  startOffset?: number;
  endOffset?: number;
  parent?: Node<NodeType>,
  // children?: Node<NodeType>[],

  // name?: string,
  // value?: string,
  // [key: string]: any,

  // findByOffset(uri: string, offset: number): Node<T>;
  // findByType(uri: string, type: T): Node<T>;
};
