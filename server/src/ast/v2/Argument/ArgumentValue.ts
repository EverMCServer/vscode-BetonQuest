import { DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional, ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ArgumentValueType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";
import { EventArgumentMandatory } from "../Event/EventArgumentMandatory";
import { EventArgumentOptional } from "../Event/EventArgumentOptional";
import { ObjectiveArgumentMandatory } from "../Objective/ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "../Objective/ObjectiveArgumentOptional";
import { ArgumentBlockID } from "./ArgumentBlockID";
import { ArgumentConditionID } from "./ArgumentConditionID";
import { ArgumentEntity } from "./ArgumentEntity";
import { ArgumentInterger } from "./ArgumentInterger";

export class ArgumentValue extends AbstractNodeV2<ArgumentValueType> {
  readonly type: ArgumentValueType = "ArgumentValue";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArgumentMandatory | ConditionArgumentOptional | EventArgumentMandatory | EventArgumentOptional | ObjectiveArgumentMandatory | ObjectiveArgumentOptional;

  private valueStr: string;
  private pattern?: ArgumentsPatternMandatory | ArgumentsPatternOptional;

  constructor(
    valueStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory | ArgumentsPatternOptional | undefined,
    parent: ConditionArgumentMandatory | ConditionArgumentOptional | EventArgumentMandatory | EventArgumentOptional | ObjectiveArgumentMandatory | ObjectiveArgumentOptional,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.valueStr = valueStr;
    this.pattern = pattern;

    // Throw error on missing values
    if (this.pattern?.key && valueStr.length < 1) {
      this.addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        "Missing value",
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentValueMissing
      );
    }

    // Parse value
    let pos1 = this.offsetStart;
    if (this.pattern && this.pattern?.format !== "boolean") {
      switch (this.pattern.type) {

        case ArgumentType.conditionID:
          parent.addChild(new ArgumentConditionID(this.valueStr, [this.offsetStart, this.offsetStart, this.offsetEnd], this));
          break;

        case ArgumentType.blockID:
          parent.addChild(new ArgumentBlockID(valueStr, [this.offsetStart, this.offsetStart, this.offsetEnd], this));
          break;

        case ArgumentType.entity:
          parent.addChild(new ArgumentEntity(valueStr, [this.offsetStart, this.offsetStart, this.offsetEnd], this));
          break;

        case ArgumentType.entityList:
          // Seprate value by ","
          this.valueStr.split(",").forEach((argStr, i) => {
            const pos2 = pos1 + argStr.length;
            parent.addChild(new ArgumentEntity(argStr, [i ? pos1 : offsets[0], pos1, pos2], this));
            pos1 = pos2 + 1;
          });
          break;

        case ArgumentType.entityListWithAmount:
          // Seprate value by "," and ":"
          this.valueStr.split(",").forEach((str, i) => {
            const pos4 = pos1 + str.length;
            let pos2 = pos4;
            if (str.includes(":")) {
              const components = str.split(":");
              pos2 = pos1 + components[0].length;
              const amountStr = components.slice(1).join(":");
              parent.addChild(new ArgumentEntity(components[0], [i ? pos1 : offsets[0], pos1, pos2], this));
              parent.addChild(new ArgumentInterger(amountStr, [pos2 + 1, pos4], this));
            } else {
              parent.addChild(new ArgumentEntity(str, [i ? pos1 : offsets[0], pos1, pos2], this));
            }
            pos1 = pos4 + 1;
          });
          break;
      }
    }
  }

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
