import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";

export class ConditionKey extends ElementKey<Condition> {
  type: ConditionKeyType = "ConditionKey";

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
