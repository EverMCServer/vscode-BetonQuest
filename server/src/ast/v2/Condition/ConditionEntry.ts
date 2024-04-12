import { Pair, Scalar } from "yaml";

import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v2/Element";
import { kinds } from "betonquest-utils/betonquest/v2/Conditions";
import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionEntryType } from "../../node";
import { ConditionKind } from "./ConditionKind";
import { ConditionKey } from "./ConditionKey";
import { ConditionArguments } from "./ConditionArguments";
import { ConditionList } from "./ConditionList";
import { ElementEntry } from "../Element/ElementEntry";

export class ConditionEntry extends ElementEntry<Condition> {
  type: ConditionEntryType = "ConditionEntry";

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: ConditionList) {
    super(pair, kinds, parent);
  }

  newKey(key: Scalar<string>): ConditionKey {
    return new ConditionKey(key, this);
  }

  newKind(value: string, range: [number?, number?], kindConfig: _ElementKind<Condition>): ConditionKind {
    return new ConditionKind(value, range, kindConfig, this);
  }

  newArguments(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig: _ElementKind<Condition>): ConditionArguments {
    return new ConditionArguments(argumentsSourceStr, range, indent, kindConfig, this);
  }
}