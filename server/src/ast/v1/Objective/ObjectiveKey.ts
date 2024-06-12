import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { Scalar } from "yaml";

export class ObjectiveKey extends ElementKey<Objective> {
  readonly type: ObjectiveKeyType = "ObjectiveKey";
  readonly parent: ObjectiveEntry;

  constructor(key: Scalar<string>, parent: ObjectiveEntry) {
    super(key, parent);
    this.parent = parent;
  }

  getSemanticTokens(): SemanticToken[] {
    if (this.offsetStart === undefined || this.offsetEnd === undefined) {
      return [];
    }
    return [{
      offsetStart: this.offsetStart,
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.ObjectiveID
    }];
  };
}
