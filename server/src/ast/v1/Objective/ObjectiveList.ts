import { Pair, Scalar } from "yaml";

import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveListType } from "../../node";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { ElementList } from "../Element/ElementList";

export class ObjectiveList extends ElementList<Objective, ObjectiveEntry> {
  type: ObjectiveListType = "ObjectiveList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ObjectiveEntry {
    return new ObjectiveEntry(pair, this);
  }

  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] {
    if (this.parent.isPackageUri(packageUri)) {
      return this.entries.filter(entry => entry.elementKey.value === id);
    } else {
      return this.parent.getObjectiveEntries(id, packageUri);
    }
  }

}
