import { Pair, Scalar } from "yaml";

export type ConversationTypes = 'ConversationList' | 'ConversationEntry' | 'ConversationKey' | 'ConversationQuester' | 'ConversationFirst' | 'ConversationStop' | 'ConversationFinalEvents' | 'ConversationInterceptor' | 'ConversationNpcOptions' | 'ConversationPlayerOptions' | 'ConversationOption' | 'ConversationText' | 'ConversationConditions' | 'ConversationOptionEvents' | 'ConversationPointers' | 'ConversationTextTranslations';
export type EventTypes = 'EventList' | 'EventEntry' | 'EventKey' | 'EventKind' | 'EventOptions' | 'EventOption' | 'EventOptionKey' | 'EventOptionValueArray' | 'EventOptionValue';
export type ConditionTypes = 'ConditionList' | 'ConditionEntry' | 'ConditionKey' | 'ConditionKind' | 'ConditionOptions' | 'ConditionOption' | 'ConditionOptionKey' | 'ConditionOptionValueArray' | 'ConditionOptionValue';
export type ObjectiveTypes = 'ObjectiveList' | 'ObjectiveEntry' | 'ObjectiveKey' | 'ObjectiveKind' | 'ObjectiveOptions' | 'ObjectiveOption' | 'ObjectiveOptionKey' | 'ObjectiveOptionValueArray' | 'ObjectiveOptionValue';

export type NodeType = ConversationTypes | EventTypes | ConditionTypes | ObjectiveTypes;

export interface Node<T extends NodeType> {
  type: T,
  uri?: string,
  startOffset?: number;
  endOffset?: number;
  parent?: Node<NodeType>,
  children?: Node<NodeType>[],
  yaml?: Pair<Scalar<string>, Scalar<string>>,

  // name?: string,
  // value?: string,
  // [key: string]: any,
};
