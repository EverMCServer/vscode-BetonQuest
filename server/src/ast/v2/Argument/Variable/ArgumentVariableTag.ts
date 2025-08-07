import { ArgumentVariableTagNameType, ArgumentVariableTagType } from "../../../node";
import { ArgumentVariable } from "../ArgumentVariable";
import { ArgumentVariableSectionPapi } from "./Section/ArgumentVariableSectionPapi";
import { AbstractTagName } from "../AbstractTagName";
import { AbstractNodeV2 } from "../../../v2";

export class ArgumentVariableTag extends AbstractNodeV2<ArgumentVariableTagType> {
  readonly type: ArgumentVariableTagType = 'ArgumentVariableTag';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariable;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariable,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    // this.argumentStr = argumentStr;
    const parts = argumentStr.split(".");
    this.addChild(new ArgumentVariableTagName(parts[0], [this.offsetStart, this.offsetStart + parts[0].length], this));
    // Parse ".papi" suffix
    if (parts.length > 1) {
      const papiString = parts.slice(1).join(".");
      this.addChild(new ArgumentVariableSectionPapi(papiString, [this.offsetStart + parts[0].length + 1, this.offsetEnd], this));
    }
  }
}

export class ArgumentVariableTagName extends AbstractTagName<ArgumentVariableTagNameType> {
  readonly type: ArgumentVariableTagNameType = 'ArgumentVariableTagName';
  readonly parent: ArgumentVariableTag;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariableTag,
  ) {
    super(argumentStr, offsets);
    this.parent = parent;
  }
}
