import { AST } from "./ast";
import { NodeType, AbstractNode, ConversationOptionType, ConversationNpcOptionType, ConversationPlayerOptionType } from "./node";
import { ConditionEntry } from "./v1/Condition/ConditionEntry";
import { ConditionList } from "./v1/Condition/ConditionList";
import { Conversation } from "./v1/Conversation/Conversation";
import { ConversationFinalEvents } from "./v1/Conversation/ConversationFinalEvents";
import { ConversationInterceptor } from "./v1/Conversation/ConversationInterceptor";
import { ConversationQuester } from "./v1/Conversation/ConversationQuester";
import { ConversationStop } from "./v1/Conversation/ConversationStop";
import { Option } from "./v1/Conversation/Option/Option";
import { EventEntry } from "./v1/Event/EventEntry";
import { EventList } from "./v1/Event/EventList";
import { ObjectiveEntry } from "./v1/Objective/ObjectiveEntry";
import { ObjectiveList } from "./v1/Objective/ObjectiveList";
import { PackageV1 } from "./v1/Package";

export type ConversationChild = ConversationQuester | ConversationStop | ConversationFinalEvents | ConversationInterceptor | Option<ConversationNpcOptionType> | Option<ConversationPlayerOptionType>;
export type NodeV1 = PackageV1 | ConditionList | EventList | ObjectiveList | Conversation | ConversationChild;

export abstract class AbstractNodeV1<T extends NodeType> extends AbstractNode<T, NodeV1> {
  // abstract readonly parent: NodeV1;

  getAst(): AST {
    if (this.parent.type === 'PackageV1') {
      return this.parent.parentAst;
    } else {
      return this.parent.getAst();
    }
  }

  // getNode<N extends NodeV1>(type: NodeType) {
  //   return this.children.find<N>((c): c is N => c.type === type);
  // }

  // Get all target package's Condition entries.
  // This method must be overrided / hijacked by the top-level class.
  getConditionEntries(id: string, packageUri: string): ConditionEntry[] {
    return this.parent.getConditionEntries(id, packageUri);
  }

  // Get all target package's Event entries.
  // This method must be overrided / hijacked by the top-level class.
  getEventEntries(id: string, packageUri: string): EventEntry[] {
    return this.parent.getEventEntries(id, packageUri);
  }

  // Get all target package's Objective entries.
  // This method must be overrided / hijacked by the top-level class.
  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] {
    return this.parent.getObjectiveEntries(id, packageUri);
  }

  // Get all target package's conversation options.
  // This method must be overrided / hijacked by the top-level class.
  getConversationOptions<T extends ConversationOptionType>(type: T, optionID: string, conversationID?: string, packageUri?: string): Option<T>[] {
    return this.parent.getConversationOptions<T>(type, optionID, conversationID, packageUri);
  }

}
