import { ConversationEventType, NodeType, NodeV1 } from "../../../node";
import { AbstractID } from "../AbstractId";
import { SemanticToken } from "../../../../service/semanticTokens";
import { EventEntry } from "../../Event/EventEntry";

export class Event<PT extends NodeV1<NodeType>> extends AbstractID<ConversationEventType, PT, EventEntry> {
  type: ConversationEventType = "ConversationEvent";

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: PT) {
    super(idString, range, parent);
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = super.getSemanticTokens();
    semanticTokens.push({
      offsetStart: this.offsetStart + (this.withExclamationMark ? 1 : 0), 
      offsetEnd: this.offsetEnd,
      tokenType: "function",
    });
    return semanticTokens;
  };

  // Get all of the Event entries from the AST.
  getTargetNodes(): EventEntry[] {
    return this.getEventEntries(this.id, this.getPackageUri(this.package));
  }
}
