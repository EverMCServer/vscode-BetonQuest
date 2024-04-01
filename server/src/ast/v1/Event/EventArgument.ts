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
  diagnostics: Diagnostic[] = [];

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional,
    parent?: EventArguments,
  ) {

    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    // Parse argumentStr
    this.argumentStr = argumentStr;

    // Check format
  }

  getDiagnostics() {
    return this.diagnostics;
  }

  getHoverInfo(uri: string, offset: number): string[] {
    if (this.offsetStart && this.offsetEnd && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return [];
    }
    return [];
  }
}