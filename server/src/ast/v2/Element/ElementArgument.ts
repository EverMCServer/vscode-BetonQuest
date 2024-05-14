import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementArgumentType, NodeV2 } from "../../node";
import { ElementArguments } from "./ElementArguments";
import { SemanticToken } from "../../../service/semanticTokens";

export abstract class ElementArgument<LE extends ListElement> extends NodeV2<ElementArgumentType> {
  abstract type: ElementArgumentType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: ElementArguments<LE>;

  argumentStr: string;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional,
    parent: ElementArguments<LE>,
  ) {
    super();

    this.uri = parent.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    // Parse argumentStr
    this.argumentStr = argumentStr;

    // Check format
  }

  abstract getSemanticTokens(): SemanticToken[];

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