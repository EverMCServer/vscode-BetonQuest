import Event from "betonquest-utils/betonquest/Event";

import { EventKeyType } from "../../node";
import { ElementKey } from "../Element/ElementKey";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { EventEntry } from "./EventEntry";
import { Scalar } from "yaml";

export class EventKey extends ElementKey<Event> {
  readonly type: EventKeyType = "EventKey";
  readonly parent: EventEntry;

  constructor(key: Scalar<string>, parent: EventEntry) {
    super(key, parent);
    this.parent = parent;
  }

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
