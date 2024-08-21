import { AST } from "./ast";
import { AbstractNode, ConversationOptionType, NodeType } from "./node";
import { ArgumentBlockID } from "./v1/Argument/ArgumentBlockID";
import { ArgumentConditionID } from "./v1/Argument/ArgumentConditionID";
import { ArgumentEntity } from "./v1/Argument/ArgumentEntity";
import { ArgumentEventID } from "./v1/Argument/ArgumentEventID";
import { ArgumentInterger } from "./v1/Argument/ArgumentInterger";
import { ArgumentKey } from "./v1/Argument/ArgumentKey";
import { ArgumentObjectiveID } from "./v1/Argument/ArgumentObjectiveID";
import { ArgumentValue } from "./v1/Argument/ArgumentValue";
import { ConditionArgumentMandatory } from "./v1/Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./v1/Condition/ConditionArgumentOptional";
import { ConditionArguments } from "./v1/Condition/ConditionArguments";
import { ConditionEntry } from "./v1/Condition/ConditionEntry";
import { ConditionKey } from "./v1/Condition/ConditionKey";
import { ConditionKind } from "./v1/Condition/ConditionKind";
import { ConditionList } from "./v1/Condition/ConditionList";
import { Conversation } from "./v1/Conversation/Conversation";
import { ConversationFinalEvent } from "./v1/Conversation/ConversationFinalEvent";
import { ConversationFinalEvents } from "./v1/Conversation/ConversationFinalEvents";
import { ConversationInterceptor } from "./v1/Conversation/ConversationInterceptor";
import { ConversationQuester } from "./v1/Conversation/ConversationQuester";
import { ConversationQuesterTranslations } from "./v1/Conversation/ConversationQuesterTranslations";
import { ConversationStop } from "./v1/Conversation/ConversationStop";
import { First } from "./v1/Conversation/First";
import { FirstPointer } from "./v1/Conversation/FirstPointer";
import { Condition as NpcCondition } from "./v1/Conversation/Option/Npc/Condition";
import { Conditions as NpcConditions } from "./v1/Conversation/Option/Npc/Conditions";
import { Event as NpcEvent } from "./v1/Conversation/Option/Npc/Event";
import { Events as NpcEvents } from "./v1/Conversation/Option/Npc/Events";
import { Pointer as NpcPointer } from "./v1/Conversation/Option/Npc/Pointer";
import { Pointers as NpcPointers } from "./v1/Conversation/Option/Npc/Pointers";
import { Text as NpcText } from "./v1/Conversation/Option/Npc/Text";
import { NpcOption } from "./v1/Conversation/Option/NpcOption";
import { Condition as PlayerCondition } from "./v1/Conversation/Option/Player/Condition";
import { Conditions as PlayerConditions } from "./v1/Conversation/Option/Player/Conditions";
import { Event as PlayerEvent } from "./v1/Conversation/Option/Player/Event";
import { Events as PlayerEvents } from "./v1/Conversation/Option/Player/Events";
import { Pointer as PlayerPointer } from "./v1/Conversation/Option/Player/Pointer";
import { Pointers as PlayerPointers } from "./v1/Conversation/Option/Player/Pointers";
import { Text as PlayerText } from "./v1/Conversation/Option/Player/Text";
import { PlayerOption } from "./v1/Conversation/Option/PlayerOption";
import { EventArgumentMandatory } from "./v1/Event/EventArgumentMandatory";
import { EventArgumentOptional } from "./v1/Event/EventArgumentOptional";
import { EventArguments } from "./v1/Event/EventArguments";
import { EventEntry } from "./v1/Event/EventEntry";
import { EventKey } from "./v1/Event/EventKey";
import { EventKind } from "./v1/Event/EventKind";
import { EventList } from "./v1/Event/EventList";
import { ObjectiveArgumentMandatory } from "./v1/Objective/ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "./v1/Objective/ObjectiveArgumentOptional";
import { ObjectiveArguments } from "./v1/Objective/ObjectiveArguments";
import { ObjectiveEntry } from "./v1/Objective/ObjectiveEntry";
import { ObjectiveKey } from "./v1/Objective/ObjectiveKey";
import { ObjectiveKind } from "./v1/Objective/ObjectiveKind";
import { ObjectiveList } from "./v1/Objective/ObjectiveList";
import { PackageV1 } from "./v1/Package";

type TConditionList = ConditionList | ConditionEntry | ConditionKey | ConditionKind | ConditionArguments | ConditionArgumentMandatory | ConditionArgumentOptional;
type TEventListList = EventList | EventEntry | EventKey | EventKind | EventArguments | EventArgumentMandatory | EventArgumentOptional;
type TObjectiveList = ObjectiveList | ObjectiveEntry | ObjectiveKey | ObjectiveKind | ObjectiveArguments | ObjectiveArgumentMandatory | ObjectiveArgumentOptional;
type TArguments = ArgumentKey | ArgumentValue | ArgumentConditionID | ArgumentEventID | ArgumentObjectiveID | ArgumentBlockID | ArgumentEntity | ArgumentInterger;
type TConversationNpcOption = NpcOption | NpcConditions | NpcCondition | NpcEvents | NpcEvent | NpcPointers | NpcPointer | NpcText;
type TConversationPlayerOption = PlayerOption | PlayerConditions | PlayerCondition | PlayerEvents | PlayerEvent | PlayerPointers | PlayerPointer | PlayerText;
type TConversation = Conversation | ConversationQuester | ConversationQuesterTranslations | First | FirstPointer | ConversationStop | ConversationFinalEvents | ConversationFinalEvent | ConversationInterceptor | TConversationNpcOption | TConversationPlayerOption;
export type NodeV1 = PackageV1 | TConditionList | TEventListList | TObjectiveList | TArguments | TConversation;

export abstract class AbstractNodeV1<T extends NodeType> extends AbstractNode<T, NodeV1> {
  abstract readonly parent: NodeV1;

  getAst(): AST {
    if (this.parent.type === 'PackageV1') {
      return this.parent.parentAst;
    } else {
      return this.parent.getAst();
    }
  }

  getPackages(packageUri?: string) {
    return this.getAst().getV1Packages(packageUri);
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
  getConversationOptions<T extends ConversationOptionType>(type: T, optionID?: string, conversationID?: string, packageUri?: string): NpcOption[] | PlayerOption[] {
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
