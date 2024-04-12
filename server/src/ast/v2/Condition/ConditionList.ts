import { Pair, Scalar } from "yaml";

import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionListType } from "../../node";
import { ConditionEntry } from "./ConditionEntry";
import { ElementList } from "../Element/ElementList";

export class ConditionList extends ElementList<Condition> {
  type: ConditionListType = "ConditionList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ConditionEntry {
    return new ConditionEntry(pair, this);
  }

}
