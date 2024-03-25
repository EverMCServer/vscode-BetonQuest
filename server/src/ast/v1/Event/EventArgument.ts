import { Diagnostic } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { EventArgumentType, Node } from "../../node";
import { EventArguments } from "./EventArguments";

export class EventArgument implements Node<EventArgumentType> {
  type: "EventArgument" = "EventArgument";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventArguments;

  argumentStr: string;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional,
    parent?: EventArguments,
    diagnostics?: Diagnostic[]
  ) {

    // if (diagnostics && diagnostics.length > 0) {
      
    // }

    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    // Parse argumentStr
    this.argumentStr = argumentStr;
  }
}