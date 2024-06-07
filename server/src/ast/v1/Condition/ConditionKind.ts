import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionKindType } from "../../node";
import { ElementKind } from "../Element/ElementKind";
import { ConditionEntry } from "./ConditionEntry";

export class ConditionKind extends ElementKind<Condition> {
  readonly type: ConditionKindType = "ConditionKind";
  readonly parent: ConditionEntry;

  constructor(value: string, range: [number?, number?], kindConfig: _ElementKind<Condition>, parent: ConditionEntry) {
    super(value, range, kindConfig, parent);
    this.parent = parent;
  }
}
