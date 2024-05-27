import { Pair, Scalar } from "yaml";

import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionListType } from "../../node";
import { ConditionEntry } from "./ConditionEntry";
import { ElementList } from "../Element/ElementList";

export class ConditionList extends ElementList<Condition, ConditionEntry> {
  type: ConditionListType = "ConditionList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ConditionEntry {
    return new ConditionEntry(pair, this);
  }

  getConditionEntries(id: string, packageUri: string): ConditionEntry[] { // TODO: optimize let packageUri be optional
    if (this.parent.isPackageUri(packageUri)) {
      return this.entries.filter(entry => entry.elementKey.value === id);
    } else {
      return this.parent.getConditionEntries(id, packageUri);
    }
  }

}
