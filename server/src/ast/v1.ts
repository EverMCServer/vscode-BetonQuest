import { CodeAction, Diagnostic } from "vscode-languageserver";
import { AST } from "./ast";
import { NodeType, AbstractNode, ConversationOptionType } from "./node";
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
import { SemanticToken } from "../service/semanticTokens";
import { HoverInfo } from "../utils/hover";
import { LocationLinkOffset } from "../utils/location";
import { First } from "./v1/Conversation/First";
import { FirstPointer } from "./v1/Conversation/FirstPointer";
import { Event } from "./v1/Conversation/Option/Event";
import { Condition } from "./v1/Conversation/Option/Condition";
import { Pointer } from "./v1/Conversation/Option/Pointer";
import { Pointers } from "./v1/Conversation/Option/Pointers";
import { Text } from "./v1/Conversation/Option/Text";
import { Events } from "./v1/Conversation/Option/Events";
import { Conditions } from "./v1/Conversation/Option/Conditions";
import { ConversationQuesterTranslations } from "./v1/Conversation/ConversationQuesterTranslations";
import { ConditionKey } from "./v1/Condition/ConditionKey";
import { ConditionKind } from "./v1/Condition/ConditionKind";
import { ConditionArguments } from "./v1/Condition/ConditionArguments";
import { ConditionArgument } from "./v1/Condition/ConditionArgument";
import { ConditionArgumentMandatory } from "./v1/Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./v1/Condition/ConditionArgumentOptional";
import { EventKey } from "./v1/Event/EventKey";
import { EventKind } from "./v1/Event/EventKind";
import { EventArguments } from "./v1/Event/EventArguments";
import { EventArgument } from "./v1/Event/EventArgument";
import { EventArgumentMandatory } from "./v1/Event/EventArgumentMandatory";
import { EventArgumentOptional } from "./v1/Event/EventArgumentOptional";
import { ObjectiveKey } from "./v1/Objective/ObjectiveKey";
import { ObjectiveKind } from "./v1/Objective/ObjectiveKind";
import { ObjectiveArguments } from "./v1/Objective/ObjectiveArguments";
import { ObjectiveArgument } from "./v1/Objective/ObjectiveArgument";
import { ObjectiveArgumentMandatory } from "./v1/Objective/ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "./v1/Objective/ObjectiveArgumentOptional";
import { NpcOption } from "./v1/Conversation/Option/NpcOption";
import { PlayerOption } from "./v1/Conversation/Option/PlayerOption";

type TConditionList = ConditionList | ConditionEntry | ConditionKey | ConditionKind | ConditionArguments | ConditionArgument | ConditionArgumentMandatory | ConditionArgumentOptional;
type TEventListList = EventList | EventEntry | EventKey | EventKind | EventArguments | EventArgument | EventArgumentMandatory | EventArgumentOptional;
type TObjectiveList = ObjectiveList | ObjectiveEntry | ObjectiveKey | ObjectiveKind | ObjectiveArguments | ObjectiveArgument | ObjectiveArgumentMandatory | ObjectiveArgumentOptional;
type TConversationOption = NpcOption | PlayerOption | Conditions<ConversationOptionType> | Condition<ConversationOptionType> | Events<ConversationOptionType> | Event<Events<ConversationOptionType>> | Event<ConversationFinalEvents> | Pointers<ConversationOptionType> | Pointer<ConversationOptionType> | Text<ConversationOptionType>;
type TConversation = Conversation | ConversationQuester | ConversationQuesterTranslations | First | FirstPointer | ConversationStop | ConversationFinalEvents | ConversationInterceptor | TConversationOption;
export type NodeV1 = PackageV1 | TConditionList | TEventListList | TObjectiveList | TConversation;

export abstract class AbstractNodeV1<T extends NodeType> extends AbstractNode<T, NodeV1> {
  abstract readonly parent: NodeV1;

  getAst(): AST {
    if (this.parent.type === 'PackageV1') {
      return this.parent.parentAst;
    } else {
      return this.parent.getAst();
    }
  }

  getDiagnostics(): Diagnostic[] {
    return [
      ...this.diagnostics,
      ...this.children.flatMap(c => c.getDiagnostics())
    ];
  }

  getCodeActions(documentUri?: string): CodeAction[] {
    return [
      ...this.codeActions,
      ...this.children.flatMap(c => c.getCodeActions(documentUri))
    ];
  }

  getSemanticTokens(documentUri?: string): SemanticToken[] {
    return [
      ...this.semanticTokens,
      ...this.children.flatMap(c => c.getSemanticTokens(documentUri))
    ];
  };

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    if (this.offsetStart && this.offsetEnd && (offset < this.offsetStart || offset > this.offsetEnd)) {
      return [];
    }
    return this.children.flatMap(c => c.getHoverInfo(offset, documentUri));
  }

  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    // if (documentUri && !documentUri.startsWith(this.uri)) {
    //   return [];
    // }
    if (this.offsetStart && this.offsetEnd && (offset < this.offsetStart || offset > this.offsetEnd)) {
      return [];
    }
    return this.children.flatMap(c => c.getDefinitions(offset, documentUri));
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
  getConversationOptions<T extends ConversationOptionType>(type: T, optionID: string, conversationID?: string, packageUri?: string): Option<T>[] {
    return this.parent.getConversationOptions<T>(type, optionID, conversationID, packageUri);
  }

}
