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
import { ArgumentEventID } from "./ArgumentEventID";
import { ArgumentFloat } from "./ArgumentFloat";
import { ArgumentGlobalPointID } from "./ArgumentGlobalPointID";
import { ArgumentInterger } from "./ArgumentInterger";
import { ArgumentVariable } from "./ArgumentVariable";

export class ArgumentValue extends AbstractNodeV2<ArgumentValueType> {
  readonly type: ArgumentValueType = "ArgumentValue";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArgumentMandatory | ConditionArgumentOptional | EventArgumentMandatory | EventArgumentOptional | ObjectiveArgumentMandatory | ObjectiveArgumentOptional;

  readonly valueStr: string;
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
      if (this.pattern.type === ArgumentType.variableQuoted || pattern?.allowVariable && this.valueStr[0] === "%" && this.valueStr[this.valueStr.length - 1] === "%" && this.valueStr.length !== 1) {
        // Parse as variable
        this.addChild(new ArgumentVariable(this.valueStr, [this.offsetStart, this.offsetEnd], this));
      } else {
        switch (this.pattern.type) {

          case ArgumentType.interger:
            this.addChild(new ArgumentInterger(this.valueStr, [this.offsetStart, this.offsetEnd], this));
            break;

          case ArgumentType.intergerList:
            // Seprate value by ","
            this.valueStr.split(",").forEach((argStr, i) => {
              const pos2 = pos1 + argStr.length;
              this.addChild(new ArgumentInterger(argStr, [pos1, pos2], this));
              pos1 = pos2 + 1;
            });
            break;

          case ArgumentType.float:
            this.addChild(new ArgumentFloat(this.valueStr, [this.offsetStart, this.offsetEnd], this));
            break;

          case ArgumentType.conditionID:
            this.addChild(new ArgumentConditionID(this.valueStr, [this.offsetStart, this.offsetEnd], this));
            break;

          case ArgumentType.conditionIdList:
            // Seprate value by ","
            this.valueStr.split(",").forEach((argStr, i) => {
              const pos2 = pos1 + argStr.length;
              this.addChild(new ArgumentConditionID(argStr, [pos1, pos2], this));
              pos1 = pos2 + 1;
            });
            break;

          case ArgumentType.eventID:
            this.addChild(new ArgumentEventID(this.valueStr, [this.offsetStart, this.offsetEnd], this));
            break;

          case ArgumentType.eventIdList:
            // Seprate value by ","
            this.valueStr.split(",").forEach((argStr, i) => {
              const pos2 = pos1 + argStr.length;
              this.addChild(new ArgumentEventID(argStr, [pos1, pos2], this));
              pos1 = pos2 + 1;
            });
            break;

          case ArgumentType.globalPointID:
            this.addChild(new ArgumentGlobalPointID(this.valueStr, [this.offsetStart, this.offsetEnd], this));
            break;

          case ArgumentType.blockID:
            this.addChild(new ArgumentBlockID(valueStr, [this.offsetStart, this.offsetEnd], this));
            break;

          case ArgumentType.entity:
            this.addChild(new ArgumentEntity(valueStr, [this.offsetStart, this.offsetEnd], this));
            break;

          case ArgumentType.entityList:
            // Seprate value by ","
            this.valueStr.split(",").forEach((argStr, i) => {
              const pos2 = pos1 + argStr.length;
              this.addChild(new ArgumentEntity(argStr, [pos1, pos2], this));
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
                this.addChild(new ArgumentEntity(components[0], [pos1, pos2], this));
                this.addChild(new ArgumentInterger(amountStr, [pos2 + 1, pos4], this));
              } else {
                this.addChild(new ArgumentEntity(str, [pos1, pos2], this));
              }
              pos1 = pos4 + 1;
            });
            break;
        }
      }
    }
  }
}
