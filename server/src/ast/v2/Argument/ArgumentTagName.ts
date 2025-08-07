import { ArgumentTagNameType } from "../../node";
import { ArgumentValue } from "./ArgumentValue";
import { AbstractTagName } from "./AbstractTagName";

export class ArgumentTagName extends AbstractTagName<ArgumentTagNameType> {
  readonly type: ArgumentTagNameType = 'ArgumentTagName';
  readonly parent: ArgumentValue;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super(argumentStr, offsets);
    this.parent = parent;
  }

}
