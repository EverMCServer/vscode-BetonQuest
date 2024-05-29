import Event from "betonquest-utils/betonquest/Event";

import { EventKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";

export class EventKey extends ElementKey<Event> {
  type: EventKeyType = "EventKey";

  getSemanticTokens(): SemanticToken[] {
    if (this.offsetStart === undefined || this.offsetEnd === undefined) {
      return [];
    }
    return [{
      offsetStart: this.offsetStart,
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.EventID
    }];
  };
}
