import { SemanticToken, SemanticTokenType } from "../../../../../service/semanticTokens";
import { ConversationConditionType } from "../../../../node";
import { ConditionEntry } from "../../../Condition/ConditionEntry";
import { AbstractID } from "../../AbstractId";
import { Conditions } from "./Conditions";

export class Condition extends AbstractID<ConversationConditionType, Conditions, ConditionEntry> {
  readonly type: ConversationConditionType = "ConversationCondition";

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: Conditions) {
    super(idString, range, parent);
  }

  getIdKindName() {
    return "Condition";
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [];
    semanticTokens.push({
      offsetStart: this.offsetStart + (this.withExclamationMark ? 1 : 0),
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.ConditionID
    });
    return semanticTokens;
  };

  // Get all of the Condition entries from the AST.
  getTargetNodes(): ConditionEntry[] {
    return this.getConditionEntries(this.id, this.getPackageUri(this.package));
  }
}
