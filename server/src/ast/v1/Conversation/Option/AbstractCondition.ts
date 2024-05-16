import { ConversationConditionType, ConversationTypes, NodeV1 } from "../../../node";
import { AbstractIdCondition } from "../AbstractIdCondition";
import { AbstractOption } from "./AbstractOption";

export abstract class AbstractCondition<PT extends NodeV1<ConversationTypes>> extends AbstractIdCondition<PT> {
}
