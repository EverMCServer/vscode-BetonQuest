import { AST } from "./ast";
import { NodeType, AbstractNode, ConversationOptionType } from "./node";
import { ConditionEntry } from "./v2/Condition/ConditionEntry";
import { ConditionList } from "./v2/Condition/ConditionList";
import { Option } from "./v2/Conversation/Option/Option";
import { EventEntry } from "./v2/Event/EventEntry";
import { ObjectiveEntry } from "./v2/Objective/ObjectiveEntry";
import { PackageV2 } from "./v2/Package";

export type NodeV2 = PackageV2 | ConditionList;

export abstract class AbstractNodeV2<T extends NodeType> extends AbstractNode<T, NodeV2> {
  abstract readonly parent: NodeV2;

  getAst(): AST {
    if (this.parent.type === 'PackageV2') {
      return this.parent.parentAst;
    } else {
      return this.parent.getAst();
    }
  }

  // Get all target package's Condition entries.
  // This method must be overrided / hijacked by the top-level class.
  getConditionEntries(id: string, packageUri?: string): ConditionEntry[] {
    return this.parent.getConditionEntries(id, packageUri);
  }

  // Get all target package's Event entries.
  // This method must be overrided / hijacked by the top-level class.
  getEventEntries(id: string, packageUri?: string): EventEntry[] {
    return this.parent.getEventEntries(id, packageUri);
  }

  // Get all target package's Objective entries.
  // This method must be overrided / hijacked by the top-level class.
  getObjectiveEntries(id: string, packageUri?: string): ObjectiveEntry[] {
    return this.parent.getObjectiveEntries(id, packageUri);
  }

  // Get all target package's conversation options.
  // This method must be overrided / hijacked by the top-level class.
  getConversationOptions<T extends ConversationOptionType>(type: T, optionID: string, conversationID?: string, packageUri?: string): Option<T>[] {
    return this.parent.getConversationOptions(type, optionID, conversationID, packageUri);
  }
}
