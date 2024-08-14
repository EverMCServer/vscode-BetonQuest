import { ArgumentsPatternMandatory, ArgumentsPatternOptional, ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { ElementArgumentValueType } from "../../node";
import { AbstractNodeV2, NodeV2 } from "../../v2";
import { ArgumentBlockID } from "./ArgumentBlockID";
import { ArgumentConditionID } from "./ArgumentConditionID";
import { ArgumentEntity } from "./ArgumentEntity";
import { ArgumentInterger } from "./ArgumentInterger";
import { ConditionArgumentValue } from "../Condition/ConditionArgumentValue";

export abstract class AbstractValue<NT extends ElementArgumentValueType, PT extends NodeV2> extends AbstractNodeV2<NT> {
  // readonly type: NT;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: PT;

  private valueStr: string;
  private pattern?: ArgumentsPatternMandatory | ArgumentsPatternOptional;

  constructor(
    // type: NT,
    valueStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional | undefined,
    parent: PT,
  ) {
    super();
    // this.type = type;
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.valueStr = valueStr;
    this.pattern = pattern;

    // Parse value
    let pos1 = this.offsetStart;
    if (this.pattern && this.pattern?.format !== "boolean") {
      switch (this.pattern.type) {

        case ArgumentType.conditionID:
          parent.addChild(new ArgumentConditionID(this.valueStr, [this.offsetStart, this.offsetStart, this.offsetEnd], this.getThis()));
          break;

        case ArgumentType.blockID:
          parent.addChild(new ArgumentBlockID(valueStr, [this.offsetStart, this.offsetStart, this.offsetEnd], this.getThis()));
          break;

        case ArgumentType.entity:
          parent.addChild(new ArgumentEntity(valueStr, [this.offsetStart, this.offsetStart, this.offsetEnd], this.getThis()));
          break;

        case ArgumentType.entityList:
          // Seprate value by ","
          this.valueStr.split(",").forEach((argStr, i) => {
            const pos2 = pos1 + argStr.length;
            parent.addChild(new ArgumentEntity(argStr, [i ? pos1 : offsets[0], pos1, pos2], this.getThis()));
            pos1 = pos2 + 1;
          });
          break;

        case ArgumentType.entityListWithAmount:
          // Seprate value by "," and ":"
          this.valueStr.split(",").forEach((str, i) => {
            const pos4 = pos1 + str.length;
            let pos2 = pos4;
            const components = str.split(":");
            if (components[1] !== undefined) {
              pos2 = pos1 + components[0].length;
              const amountStr = components.slice(1).join(":");
              parent.addChild(new ArgumentInterger(amountStr, [pos2 + 1, pos4], this.getThis()));
            }
            parent.addChild(new ArgumentEntity(components[0], [i ? pos1 : offsets[0], pos1, pos2], this.getThis()));
            pos1 = pos4 + 1;
          });
          break;
      }
    }
  }

  abstract getThis(): ConditionArgumentValue;

  static getCompletionsByType(type: ArgumentType) {
    switch (type) {
      case ArgumentType.conditionID:
        return ArgumentConditionID.getCompletions();

      case ArgumentType.blockID:
        return ArgumentBlockID.getCompletions();

      case ArgumentType.entity:
      case ArgumentType.entityList:
      case ArgumentType.entityListWithAmount:
        return ArgumentEntity.getCompletions();
    }
    return [];
  }
}
