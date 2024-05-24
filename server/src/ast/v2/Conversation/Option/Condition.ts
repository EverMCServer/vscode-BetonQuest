import { ConversationConditionType, NodeType, NodeV2 } from "../../../node";
import { AbstractID } from "../AbstractId";
import { ConditionEntry } from "../../Condition/ConditionEntry";

export class Condition<PT extends NodeV2<NodeType>> extends AbstractID<ConversationConditionType, PT, ConditionEntry> {
  type: ConversationConditionType = "ConversationCondition";

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: PT) {
    super(idString, range, parent);
  }

  // Get all of the Condition entries from the AST.
  getTargetNodes(): ConditionEntry[] {
    return this.getConditionEntries(this.id, this.getPackageUri(this.package));
  }
}
