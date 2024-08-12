import { ElementArgumentKeyType } from "../../node";
import { AbstractNodeV2, NodeV2 } from "../../v2";

export class Key<NT extends ElementArgumentKeyType, PT extends NodeV2> extends AbstractNodeV2<NT> {
  readonly type: NT;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: PT;

  private keyStr: string;

  constructor(
    type: NT,
    keyStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    // isMandatory: boolean,
    // pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional | undefined,
    parent: PT,
  ) {
    super();
    this.type = type;
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[2];
    this.parent = parent;
    
    this.keyStr = keyStr;
  }
}