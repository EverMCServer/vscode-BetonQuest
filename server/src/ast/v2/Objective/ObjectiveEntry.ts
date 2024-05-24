import { Pair, Scalar } from "yaml";

import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v2/Element";
import { kinds } from "betonquest-utils/betonquest/v2/Objectives";
import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveEntryType } from "../../node";
import { ObjectiveKind } from "./ObjectiveKind";
import { ObjectiveKey } from "./ObjectiveKey";
import { ObjectiveArguments } from "./ObjectiveArguments";
import { ObjectiveListSection } from "./ObjectiveList";
import { ElementEntry } from "../Element/ElementEntry";

export class ObjectiveEntry extends ElementEntry<Objective> {
  type: ObjectiveEntryType = "ObjectiveEntry";

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: ObjectiveListSection) {
    super(pair, kinds, parent);
  }

  newKey(key: Scalar<string>): ObjectiveKey {
    return new ObjectiveKey(key, this);
  }

  newKind(value: string, range: [number?, number?], kindConfig: _ElementKind<Objective>): ObjectiveKind {
    return new ObjectiveKind(value, range, kindConfig, this);
  }

  newArguments(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig: _ElementKind<Objective>): ObjectiveArguments {
    return new ObjectiveArguments(argumentsSourceStr, range, indent, kindConfig, this);
  }
}