
export type ConversationTypes = 'ConversationList' | 'ConversationEntry' | 'ConversationKey' | 'ConversationQuester' | 'ConversationFirst' | 'ConversationStop' | 'ConversationFinalEvents' | 'ConversationInterceptor' | 'ConversationNpcOptions' | 'ConversationPlayerOptions' | 'ConversationOption' | 'ConversationText' | 'ConversationConditions' | 'ConversationOptionEvents' | 'ConversationPointers' | 'ConversationTextTranslations';
export type EventTypes = 'EventList' | 'EventEntry' | 'EventKey' | 'EventKind' | 'EventOptions' | 'EventOption' | 'EventOptionKey' | 'EventOptionValueArray' | 'EventOptionValue';
export type ConditionTypes = 'ConditionList' | 'ConditionEntry' | 'ConditionKey' | 'ConditionKind' | 'ConditionOptions' | 'ConditionOption' | 'ConditionOptionKey' | 'ConditionOptionValueArray' | 'ConditionOptionValue';
export type ObjectiveTypes = 'ObjectiveList' | 'ObjectiveEntry' | 'ObjectiveKey' | 'ObjectiveKind' | 'ObjectiveOptions' | 'ObjectiveOption' | 'ObjectiveOptionKey' | 'ObjectiveOptionValueArray' | 'ObjectiveOptionValue';

export type NodeType = ConversationTypes | EventTypes | ConditionTypes | ObjectiveTypes;

export type Node<T extends NodeType> = {
  type: T,
  // name?: string,
  value?: string,
  // [key: string]: any,
  uri?: string,
  startOffset: number,
  startLine: number,
  startColumn: number,
  endOffset: number,
  endLine: number,
  endColumn: number,
  parent?: Node<NodeType>,
  children?: Node<NodeType>[],
};

// Example
let a: Node<EventTypes> = {
  type: "EventList",
  uri: "file:///temp/events.yml",
  startOffset: 0,
  startLine: 0,
  startColumn: 0,
  endOffset: 0,
  endLine: 0,
  endColumn: 0,
  children: [
    {
      type: "EventEntry",
      startOffset: 0,
      startLine: 0,
      startColumn: 0,
      endOffset: 0,
      endLine: 0,
      endColumn: 0,
      children: [
        {
          type: "EventKey",
          value: "wood",
          startOffset: 0,
          startLine: 0,
        } as Node<'EventKey'>,
        {
          type: "EventKind",
          value: "block",
          startOffset: 0,
          startLine: 0,
        } as Node<'EventKind'>,
        {
          type: "EventOptions",
          startOffset: 0,
          startLine: 0,
          children: [
            {
              type: "EventOption",
              startOffset: 0,
              startLine: 0,
              children: [
                {
                  type: "EventOptionValue",
                  value: "$block$",
                  startOffset: 0,
                  startLine: 0,
                } as Node<'EventOptionValue'>,
              ]
            } as Node<'EventOption'>,
            {
              type: "EventOption",
              startOffset: 0,
              startLine: 0,
              children: [
                {
                  type: "EventOptionValue",
                  value: "-16",
                  startOffset: 0,
                  startLine: 0,
                } as Node<'EventOptionValue'>,
              ]
            } as Node<'EventOption'>,
            {
              type: "EventOption",
              startOffset: 0,
              startLine: 0,
              children: [
                {
                  type: "EventOptionKey",
                  value: "events",
                  startOffset: 0,
                  startLine: 0,
                } as Node<'EventOptionKey'>,
                {
                  type: "EventOptionValueArray",
                  value: ",", // separator
                  startOffset: 0,
                  startLine: 0,
                  children: [
                    {
                      type: "EventOptionValue",
                      value: "tag_wood_done",
                      startOffset: 0,
                      startLine: 0,
                    } as Node<'EventOptionValue'>,
                    {
                      type: "EventOptionValue",
                      value: "entry_wood_done",
                      startOffset: 0,
                      startLine: 0,
                    } as Node<'EventOptionValue'>,
                  ]
                } as Node<'EventOptionValueArray'>,
              ]
            } as Node<'EventOption'>,
          ]
        } as Node<'EventOptions'>,
      ]
    } as Node<'EventEntry'>,
  ]
};

let b = {
  children: []
} && a;

b.value;
