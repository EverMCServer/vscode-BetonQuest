import { Diagnostic } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ElementArgumentType, Node } from "../../node";
import { ElementArguments } from "./ElementArguments";
import ListElement from "betonquest-utils/betonquest/ListElement";

export abstract class ElementArgument<LE extends ListElement> implements Node<ElementArgumentType> {
  abstract type: ElementArgumentType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: ElementArguments<LE>;

  argumentStr: string;
  diagnostics: Diagnostic[] = [];

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional,
    parent: ElementArguments<LE>,
  ) {

    this.uri = parent.uri;
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
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return [];
    }
    return [];
  }
}