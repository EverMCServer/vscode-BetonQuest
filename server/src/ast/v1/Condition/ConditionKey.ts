import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { ConditionEntry } from "./ConditionEntry";
import { Scalar } from "yaml";

export class ConditionKey extends ElementKey<Condition> {
  readonly type: ConditionKeyType = "ConditionKey";
  readonly parent: ConditionEntry;

  constructor(key: Scalar<string>, parent: ConditionEntry) {
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
      tokenType: SemanticTokenType.ConditionID
    }];
  };
}
