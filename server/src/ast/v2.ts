import { AST } from "./ast";
import { AbstractNode, ConversationOptionType, NodeType } from "./node";
import { ArgumentConditionID } from "./v2/Argument/ArgumentConditionID";
import { ArgumentEventID } from "./v2/Argument/ArgumentEventID";
import { ArgumentObjectiveID } from "./v2/Argument/ArgumentObjectiveID";
import { ConditionArgumentMandatory } from "./v2/Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./v2/Condition/ConditionArgumentOptional";
import { ConditionArguments } from "./v2/Condition/ConditionArguments";
import { ConditionEntry } from "./v2/Condition/ConditionEntry";
import { ConditionKey } from "./v2/Condition/ConditionKey";
import { ConditionKind } from "./v2/Condition/ConditionKind";
import { ConditionList, ConditionListSection } from "./v2/Condition/ConditionList";
import { Conversation, ConversationSection } from "./v2/Conversation/Conversation";
import { ConversationFinalEvent } from "./v2/Conversation/ConversationFinalEvent";
import { ConversationFinalEvents } from "./v2/Conversation/ConversationFinalEvents";
import { ConversationInterceptor } from "./v2/Conversation/ConversationInterceptor";
import { ConversationQuester } from "./v2/Conversation/ConversationQuester";
import { ConversationQuesterTranslations } from "./v2/Conversation/ConversationQuesterTranslations";
import { ConversationStop } from "./v2/Conversation/ConversationStop";
import { First } from "./v2/Conversation/First";
import { FirstPointer } from "./v2/Conversation/FirstPointer";
import { Condition as NpcCondition } from "./v2/Conversation/Option/Npc/Condition";
import { Conditions as NpcConditions } from "./v2/Conversation/Option/Npc/Conditions";
import { Event as NpcEvent } from "./v2/Conversation/Option/Npc/Event";
import { Events as NpcEvents } from "./v2/Conversation/Option/Npc/Events";
import { Pointer as NpcPointer } from "./v2/Conversation/Option/Npc/Pointer";
import { Pointers as NpcPointers } from "./v2/Conversation/Option/Npc/Pointers";
import { Text as NpcText } from "./v2/Conversation/Option/Npc/Text";
import { NpcOption } from "./v2/Conversation/Option/NpcOption";
import { Condition as PlayerCondition } from "./v2/Conversation/Option/Player/Condition";
import { Conditions as PlayerConditions } from "./v2/Conversation/Option/Player/Conditions";
import { Event as PlayerEvent } from "./v2/Conversation/Option/Player/Event";
import { Events as PlayerEvents } from "./v2/Conversation/Option/Player/Events";
import { Pointer as PlayerPointer } from "./v2/Conversation/Option/Player/Pointer";
import { Pointers as PlayerPointers } from "./v2/Conversation/Option/Player/Pointers";
import { Text as PlayerText } from "./v2/Conversation/Option/Player/Text";
import { PlayerOption } from "./v2/Conversation/Option/PlayerOption";
import { EventArgumentMandatory } from "./v2/Event/EventArgumentMandatory";
import { EventArgumentOptional } from "./v2/Event/EventArgumentOptional";
import { EventArguments } from "./v2/Event/EventArguments";
import { EventEntry } from "./v2/Event/EventEntry";
import { EventKey } from "./v2/Event/EventKey";
import { EventKind } from "./v2/Event/EventKind";
import { EventList, EventListSection } from "./v2/Event/EventList";
import { ObjectiveArgumentMandatory } from "./v2/Objective/ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "./v2/Objective/ObjectiveArgumentOptional";
import { ObjectiveArguments } from "./v2/Objective/ObjectiveArguments";
import { ObjectiveEntry } from "./v2/Objective/ObjectiveEntry";
import { ObjectiveKey } from "./v2/Objective/ObjectiveKey";
import { ObjectiveKind } from "./v2/Objective/ObjectiveKind";
import { ObjectiveList, ObjectiveListSection } from "./v2/Objective/ObjectiveList";
import { PackageV2 } from "./v2/Package";

type TConditionList = ConditionList | ConditionListSection | ConditionEntry | ConditionKey | ConditionKind | ConditionArguments | ConditionArgumentMandatory | ConditionArgumentOptional;
type TEventListList = EventList | EventListSection | EventEntry | EventKey | EventKind | EventArguments | EventArgumentMandatory | EventArgumentOptional;
type TObjectiveList = ObjectiveList | ObjectiveListSection | ObjectiveEntry | ObjectiveKey | ObjectiveKind | ObjectiveArguments | ObjectiveArgumentMandatory | ObjectiveArgumentOptional;
type TArguments = ArgumentConditionID | ArgumentEventID | ArgumentObjectiveID;
type TConversationNpcOption = NpcOption | NpcConditions | NpcCondition | NpcEvents | NpcEvent | NpcPointers | NpcPointer | NpcText;
type TConversationPlayerOption = PlayerOption | PlayerConditions | PlayerCondition | PlayerEvents | PlayerEvent | PlayerPointers | PlayerPointer | PlayerText;
export type ConversationOption = NpcOption | PlayerOption;
type TConversation = Conversation | ConversationSection | ConversationQuester | ConversationQuesterTranslations | First | FirstPointer | ConversationStop | ConversationFinalEvents | ConversationFinalEvent | ConversationInterceptor | TConversationNpcOption | TConversationPlayerOption;
export type NodeV2 = PackageV2 | TConditionList | TEventListList | TObjectiveList | TArguments | TConversation;

export abstract class AbstractNodeV2<T extends NodeType> extends AbstractNode<T, NodeV2> {
  abstract readonly parent: NodeV2;

  getAst(): AST {
    if (this.parent.type === 'PackageV2') {
      return this.parent.parentAst;
    } else {
      return this.parent.getAst();
    }
  }

  getPackages(packageUri?: string) {
    return this.getAst().getV2Packages(packageUri);
  }

  // Get absolute Package path.
  // This method must be overrided / hijacked by the top-level class.
  getPackagePath(): string[] {
    return this.parent.getPackagePath();
  }

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
  getConversationOptions<T extends ConversationOptionType>(type: T, optionID?: string, conversationID?: string, packageUri?: string): (NpcOption | PlayerOption)[] {
    return this.parent.getConversationOptions<T>(type, optionID, conversationID, packageUri);
  }

  // Get all target package's conversation option pointers.
  // This method must be overrided / hijacked by the top-level class.
  getConversationOptionPointers(type: ConversationOptionType, optionID: string, conversationID?: string, packageUri?: string): (FirstPointer | NpcPointer | PlayerPointer)[] {
    return this.parent.getConversationOptionPointers(type, optionID, conversationID, packageUri);
  }

  // Get all target package's conversation condition pointers.
  // This method must be overrided / hijacked by the top-level class.
  getConversationConditionPointers(conditionID?: string, packageUri?: string): (NpcCondition | PlayerCondition)[] {
    return this.parent.getConversationConditionPointers(conditionID, packageUri);
  }

  // Get all target package's conversation event pointers.
  // This method must be overrided / hijacked by the top-level class.
  getConversationEventPointers(eventID?: string, packageUri?: string): (ConversationFinalEvent | NpcEvent | PlayerEvent)[] {
    return this.parent.getConversationEventPointers(eventID, packageUri);
  }

}
