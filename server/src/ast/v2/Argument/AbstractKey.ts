import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

import { Diagnostic } from "vscode-languageserver";
import { ElementArgumentKeyType } from "../../node";
import { AbstractNodeV2, NodeV2 } from "../../v2";

export abstract class AbstractKey<NT extends ElementArgumentKeyType, PT extends NodeV2> extends AbstractNodeV2<NT> {
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: PT;

  private keyStr: string;
  private pattern?: ArgumentsPatternMandatory | ArgumentsPatternOptional;

  constructor(
    keyStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional | undefined,
    parent: PT,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.keyStr = keyStr;
    this.pattern = pattern;
  }

  getDiagnostics(): Diagnostic[] {
    return []; // TODO
  }
}