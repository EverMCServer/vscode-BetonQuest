import { Diagnostic } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentType, Node } from "../../node";
import { ConditionArguments } from "./ConditionArguments";

export class ConditionArgument implements Node<ConditionArgumentType> {
  type: ConditionArgumentType = "ConditionArgument";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: ConditionArguments;

  argumentStr: string;
  diagnostics: Diagnostic[] = [];

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional,
    parent?: ConditionArguments,
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
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return [];
    }
    return [];
  }
}