import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ConversationConditionType, NodeV1, NodeType } from "../../node";
import { AbstractID } from "./AbstractId";
import { ConditionEntry } from "../Condition/ConditionEntry";

export abstract class AbstractIdCondition<PT extends NodeV1<NodeType>> extends AbstractID<ConversationConditionType, PT, ConditionEntry> {
  type: ConversationConditionType = "ConversationCondition";

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: PT) {
    super(idString, range, parent);
  }

  getTargetNodes(): ConditionEntry[] {
    // TODO
    return [];
  }
}
