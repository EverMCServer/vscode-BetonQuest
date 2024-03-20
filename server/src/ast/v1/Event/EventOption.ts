import { Diagnostic } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { EventOptionType, Node } from "../../node";
import { EventOptions } from "./EventOptions";

export class EventOption implements Node<EventOptionType> {
  type: "EventOption" = "EventOption";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventOptions;

  optionStr: string;

  constructor(optionStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional,
    parent?: EventOptions,
    diagnostics?: Diagnostic[]
  ) {

    // if (diagnostics && diagnostics.length > 0) {
      
    // }

    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    // Parse optionStr
    this.optionStr = optionStr;
  }
}