import { ConversationConditionType, NodeType, AbstractNodeV1 } from "../../../node";
import { AbstractID } from "../AbstractId";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { ConditionEntry } from "../../Condition/ConditionEntry";

export class Condition<PT extends AbstractNodeV1<NodeType>> extends AbstractID<ConversationConditionType, PT, ConditionEntry> {
  type: ConversationConditionType = "ConversationCondition";

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: PT) {
    super(idString, range, parent);
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = super.getSemanticTokens();
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
