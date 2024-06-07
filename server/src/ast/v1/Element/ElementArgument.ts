import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementArgumentType } from "../../node";
import { ElementArguments } from "./ElementArguments";
import { AbstractNodeV1 } from "../../v1";

export abstract class ElementArgument<LE extends ListElement> extends AbstractNodeV1<ElementArgumentType> {
  abstract type: ElementArgumentType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;

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

    // Parse argumentStr
    this.argumentStr = argumentStr;

    // Check format
  }
}