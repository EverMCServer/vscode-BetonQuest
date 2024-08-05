import { ArgumentsPatternMandatory, ArgumentsPatternOptional, ArgumentType } from "betonquest-utils/betonquest/Arguments";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";
import { ArgumentBlockID } from "./ArgumentBlockID";
import { ArgumentConditionID } from "./ArgumentConditionID";
import { ArgumentEntity } from "./ArgumentEntity";
import { ArgumentInterger } from "./ArgumentInterger";

export function parseArgument(
  argumentStr: string,
  offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
  // isMandatory: boolean,
  pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional,
  parent: ConditionArgumentMandatory | ConditionArgumentOptional
) {
  let pos1 = offsets[1];
  switch (pattern.type) {

    case ArgumentType.conditionID:
      parent.addChild(new ArgumentConditionID(argumentStr, offsets, parent));
      break;

    case ArgumentType.blockID:
      parent.addChild(new ArgumentBlockID(argumentStr, offsets, parent));
      break;

    case ArgumentType.entity:
      parent.addChild(new ArgumentEntity(argumentStr, offsets, parent));
      break;

    case ArgumentType.entityList:
      // Seprate value by ","
      argumentStr.split(",").forEach((argStr, i) => {
        const pos2 = pos1 + argStr.length;
        parent.addChild(new ArgumentEntity(argStr, [i ? pos1 : offsets[0], pos1, pos2], parent));
        pos1 = pos2 + 1;
      });
      break;

    case ArgumentType.entityListWithAmount:
      // Seprate value by "," and ":"
      argumentStr.split(",").forEach((str, i) => {
        const pos4 = pos1 + str.length;
        let pos2 = pos4;
        const components = str.split(":");
        if (components[1] !== undefined) {
          pos2 = pos1 + components[0].length;
          const amountStr = components.slice(1).join(":");
          parent.addChild(new ArgumentInterger(amountStr, [pos2 + 1, pos4], parent));
        }
        parent.addChild(new ArgumentEntity(components[0], [i ? pos1 : offsets[0], pos1, pos2], parent));
        pos1 = pos4 + 1;
      });
      break;
  }
}
