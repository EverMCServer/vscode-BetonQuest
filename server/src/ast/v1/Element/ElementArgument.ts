import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementArgumentType } from "../../node";
import { ElementArguments } from "./ElementArguments";
import { SemanticToken } from "../../../service/semanticTokens";
import { AbstractNodeV1 } from "../../v1";

export abstract class ElementArgument<LE extends ListElement> extends AbstractNodeV1<ElementArgumentType> {
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
}