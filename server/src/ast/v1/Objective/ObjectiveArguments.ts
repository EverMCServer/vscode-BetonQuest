
import { ArgumentsPatternMandatory, ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";
import { ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveArgumentsType } from "../../node";
import { ElementArguments } from "../Element/ElementArguments";
import { ObjectiveArgumentMandatory } from "./ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "./ObjectiveArgumentOptional";
import { ObjectiveEntry } from "./ObjectiveEntry";

export class ObjectiveArguments extends ElementArguments<Objective> {
  readonly type: ObjectiveArgumentsType = "ObjectiveArguments";
  readonly parent: ObjectiveEntry;

  constructor(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig: ElementKind<Objective>, parent: ObjectiveEntry) {
    super(argumentsSourceStr, range, indent, kindConfig, parent);
    this.parent = parent;
  }
  newArgumentMandatory(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternMandatory): ObjectiveArgumentMandatory {
    return new ObjectiveArgumentMandatory(argumentStr, range, pattern, this);
  }
  newArgumentOptional(argumentStr: string, range: [number?, number?], pattern: ArgumentsPatternOptional): ObjectiveArgumentOptional {
    return new ObjectiveArgumentOptional(argumentStr, range, pattern, this);
  }

}
