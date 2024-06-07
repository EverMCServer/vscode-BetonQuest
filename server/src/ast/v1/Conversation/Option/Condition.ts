import { ConversationConditionType } from "../../../node";
import { AbstractID } from "../AbstractId";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { ConditionEntry } from "../../Condition/ConditionEntry";
import { NodeV1 } from "../../../v1";
import { Conditions } from "./Conditions";

export class Condition<PT extends NodeV1> extends AbstractID<ConversationConditionType, PT, ConditionEntry> {
  readonly type: ConversationConditionType = "ConversationCondition";
  readonly parent: Conditions;

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: Conditions) {
    super(idString, range, parent);
    this.parent = parent;
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
