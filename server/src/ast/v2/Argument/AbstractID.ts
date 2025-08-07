import { NodeType } from "../../node";
import { AbstractNodeV2 } from "../../v2";

export abstract class AbstractID<T extends NodeType> extends AbstractNodeV2<T> {
  readonly offsetStart: number;
  readonly offsetEnd: number;

  readonly id: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];

    this.id = argumentStr;
  }

  getID() {
    return this.id;
  }

}
