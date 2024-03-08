import { Scalar } from "yaml";
import { EventOptionType, EventOptionsType, Node, NodeType } from "../../node";
import { ArgumentsPattern, ArgumentsString } from "betonquest-utils/betonquest/Arguments";

export class EventOptions implements Node<EventOptionsType> {
  type: "EventOptions" = "EventOptions";
  uri?: string;
  startOffset?: number;
  endOffset?: number;
  parent?: Node<NodeType>;

  options?: Node<EventOptionType>[];

  constructor(value: Scalar<string>, parent?: Node<NodeType>) {
    this.uri = parent?.uri;
    this.endOffset = value.range?.[1];
    this.parent = parent;

    const [kindStr, optionStrs] = value.value.split(" ", 1);
    this.startOffset = this.startOffset ? (this.startOffset + kindStr.length + 1) : undefined;
    
    // TODO: Search ArgumentsPattern from V1 Event List
    // ...
    const argumentsPattern: ArgumentsPattern = { mandatory: [{ name: 'unspecified', type: '*', defaultValue: '' }] };
    
    // Parse Arguments
    const args = new ArgumentsString(optionStrs, argumentsPattern);
    // args.getMandatoryArguments();
    // TODO

  }
}