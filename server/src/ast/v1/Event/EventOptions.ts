import { EventOptionsType, Node } from "../../node";
import { ArgumentsPatterns } from "betonquest-utils/betonquest/Arguments";
import { EventEntry } from "./EventEntry";

export class EventOptions implements Node<EventOptionsType> {
  type: "EventOptions" = "EventOptions";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventEntry;

  // options?: EventOption[];

  constructor(optionStr: string, range: [number?, number?], parent?: EventEntry) {
    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    
    // TODO: Search ArgumentsPattern from V1 Event List
    // ...
    const argumentsPattern: ArgumentsPatterns = { mandatory: [{ name: 'unspecified', type: '*', defaultValue: '' }] };
    
    // // Parse Arguments
    // const optionStrs = optionStr.split(" ");
    // const args = new ArgumentsString(optionStrs, argumentsPattern);
    // // args.getMandatoryArguments();
    // // TODO

  }
}