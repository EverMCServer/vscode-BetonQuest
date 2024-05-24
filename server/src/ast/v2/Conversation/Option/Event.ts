import { ConversationEventType, NodeType, NodeV2 } from "../../../node";
import { AbstractID } from "../AbstractId";
import { EventEntry } from "../../Event/EventEntry";

export class Event<PT extends NodeV2<NodeType>> extends AbstractID<ConversationEventType, PT, EventEntry> {
  type: ConversationEventType = "ConversationEvent";

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: PT) {
    super(idString, range, parent);
  }

  // Get all of the Event entries from the AST.
  getTargetNodes(): EventEntry[] {
    return this.getEventEntries(this.id, this.getPackageUri(this.package));
  }
}
