import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";

export class ObjectiveKey extends ElementKey<Objective> {
  type: ObjectiveKeyType = "ObjectiveKey";

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
