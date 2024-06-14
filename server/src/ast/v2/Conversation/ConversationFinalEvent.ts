import { ConversationEventType } from "../../node";
import { AbstractID } from "./AbstractId";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { EventEntry } from "../Event/EventEntry";
import { ConversationFinalEvents } from "./ConversationFinalEvents";

export class ConversationFinalEvent extends AbstractID<ConversationEventType, EventEntry> {
  readonly type: ConversationEventType = "ConversationEvent";
  readonly parent: ConversationFinalEvents;

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: ConversationFinalEvents) {
    super(idString, range);
    this.parent = parent;
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = super.getSemanticTokens();
    semanticTokens.push({
      offsetStart: this.offsetStart + (this.withExclamationMark ? 1 : 0), 
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.EventID
    });
    return semanticTokens;
  };

  // Get all of the Event entries from the AST.
  getTargetNodes(): EventEntry[] {
    return this.getEventEntries(this.id, this.getPackageUri(this.package));
  }
}
