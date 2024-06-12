import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveKindType } from "../../node";
import { ElementKind } from "../Element/ElementKind";
import { ObjectiveEntry } from "./ObjectiveEntry";

export class ObjectiveKind extends ElementKind<Objective> {
  readonly type: ObjectiveKindType = "ObjectiveKind";
  readonly parent: ObjectiveEntry;

  constructor(value: string, range: [number?, number?], kindConfig: _ElementKind<Objective>, parent: ObjectiveEntry) {
    super(value, range, kindConfig, parent);
    this.parent = parent;
  }
}
