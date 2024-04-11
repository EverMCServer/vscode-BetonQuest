import { Pair, Scalar } from "yaml";

import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveListType } from "../../node";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { ElementList } from "../Element/ElementList";

export class ObjectiveList extends ElementList<Objective> {
  type: ObjectiveListType = "ObjectiveList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ObjectiveEntry {
    return new ObjectiveEntry(pair, this);
  }

}
