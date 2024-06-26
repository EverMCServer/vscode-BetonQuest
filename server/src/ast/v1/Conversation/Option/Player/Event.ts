import { ConversationEventType, NodeType } from "../../../../node";
import { AbstractID } from "../../AbstractId";
import { SemanticToken, SemanticTokenType } from "../../../../../service/semanticTokens";
import { EventEntry } from "../../../Event/EventEntry";
import { Events } from "./Events";

export class Event extends AbstractID<ConversationEventType, Events, EventEntry> {
  readonly type: ConversationEventType = "ConversationEvent";

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: Events) {
    super(idString, range, parent);
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
