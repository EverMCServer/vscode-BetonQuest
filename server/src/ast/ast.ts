
export type ConversationTypes = 'ConversationList' | 'ConversationEntry' | 'ConversationKey' | 'ConversationQuester' | 'ConversationFirst' | 'ConversationStop' | 'ConversationFinalEvents' | 'ConversationInterceptor' | 'ConversationNpcOptions' | 'ConversationPlayerOptions' | 'ConversationOption' | 'ConversationText' | 'ConversationConditions' | 'ConversationOptionEvents' | 'ConversationPointers' | 'ConversationTextTranslations';
export type EventTypes = 'EventList' | 'EventEntry' | 'EventKey' | 'EventKind' | 'EventOptions' | 'EventOption' | 'EventOptionKey' | 'EventOptionValueArray' | 'EventOptionValue';
export type ConditionTypes = 'ConditionList' | 'ConditionEntry' | 'ConditionKey' | 'ConditionKind' | 'ConditionOptions' | 'ConditionOption' | 'ConditionOptionKey' | 'ConditionOptionValueArray' | 'ConditionOptionValue';
export type ObjectiveTypes = 'ObjectiveList' | 'ObjectiveEntry' | 'ObjectiveKey' | 'ObjectiveKind' | 'ObjectiveOptions' | 'ObjectiveOption' | 'ObjectiveOptionKey' | 'ObjectiveOptionValueArray' | 'ObjectiveOptionValue';

export type NodeType = ConversationTypes | EventTypes | ConditionTypes | ObjectiveTypes;

export interface Node<T extends NodeType> {
  kind: T,
  uri?: string,
  startOffset: number,
  startLine: number,
  startColumn: number,
  endOffset: number,
  endLine: number,
  endColumn: number,
  parent?: Node<NodeType>,
  children?: Node<NodeType>[],

  // name?: string,
  value?: string,
  // [key: string]: any,
};

interface EventOptionInterface extends Node<'EventOption'> {
  key: string;
  value: any; // TODO
  type: string; // primitive types, 'string[]' etc
};
// class EventOption implements Node<'EventOption'> {
//   kind: "EventOption" = "EventOption";  
//   uri?: string | undefined;
//   startOffset: number;
//   startLine: number;
//   startColumn: number;
//   endOffset: number;
//   endLine: number;
//   endColumn: number;
//   parent?: Node<NodeType> | undefined;
//   children?: Node<NodeType>[] | undefined;

//   key: string;
//   value: any; // TODO
//   type: string; // primitive types, 'string[]' etc

//   constructor(v: EventOptionInterface) {
//     this.uri = v.uri;

//     this.key = "key";
//     this.value = "value";
//     this.type = "string";
//   }
// };

// Example
let a: Node<EventTypes> = {
  kind: "EventList",
  uri: "file:///temp/events.yml",
  startOffset: 0,
  startLine: 0,
  startColumn: 0,
  endOffset: 0,
  endLine: 0,
  endColumn: 0,
  children: [
    // new EventOption({
    //   kind: "EventOption",
    //   startOffset: 0,
    //   startLine: 0,
    //   startColumn: 0,
    //   endOffset: 0,
    //   endLine: 0,
    //   endColumn: 0,
    //   key: "wood",
    //   value: "value",
    //   type: "string",
    // }),
    {
      kind: "EventEntry",
      startOffset: 0,
      startLine: 0,
      startColumn: 0,
      endOffset: 0,
      endLine: 0,
      endColumn: 0,
      children: [
        {
          kind: "EventKey",
          value: "wood",
          startOffset: 0,
          startLine: 0,
        } as Node<'EventKey'>,
        {
          kind: "EventKind",
          value: "block",
          startOffset: 0,
          startLine: 0,
        } as Node<'EventKind'>,
        {
          kind: "EventOptions",
          startOffset: 0,
          startLine: 0,
          children: [
            {
              kind: "EventOption",
              startOffset: 0,
              startLine: 0,
              children: [
                {
                  kind: "EventOptionValue",
                  value: "$block$",
                  startOffset: 0,
                  startLine: 0,
                } as Node<'EventOptionValue'>,
              ]
            } as Node<'EventOption'>,
            {
              kind: "EventOption",
              startOffset: 0,
              startLine: 0,
              children: [
                {
                  kind: "EventOptionValue",
                  value: "-16",
                  startOffset: 0,
                  startLine: 0,
                } as Node<'EventOptionValue'>,
              ]
            } as Node<'EventOption'>,
            {
              kind: "EventOption",
              startOffset: 0,
              startLine: 0,
              children: [
                {
                  kind: "EventOptionKey",
                  value: "events",
                  startOffset: 0,
                  startLine: 0,
                } as Node<'EventOptionKey'>,
                {
                  kind: "EventOptionValueArray",
                  value: ",", // separator
                  startOffset: 0,
                  startLine: 0,
                  children: [
                    {
                      kind: "EventOptionValue",
                      value: "tag_wood_done",
                      startOffset: 0,
                      startLine: 0,
                    } as Node<'EventOptionValue'>,
                    {
                      kind: "EventOptionValue",
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
