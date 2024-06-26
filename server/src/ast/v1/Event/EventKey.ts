
import { Scalar } from "yaml";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { EventKeyType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { EventEntry } from "./EventEntry";

export class EventKey extends AbstractNodeV1<EventKeyType> {
  readonly type: EventKeyType = "EventKey";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: EventEntry;

  readonly value: string;
  readonly comment?: string;

  constructor(key: Scalar<string>, parent: EventEntry) {
    super();
    this.offsetStart = key.range![0];
    this.offsetEnd = key.range![1];
    this.parent = parent;

    this.value = key.value;
    this.comment = key.commentBefore?.split(/\n\n+/).slice(-1)[0] ?? undefined;
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

  getHoverInfo(offset?: number): HoverInfo[] {
    if (!offset || this.offsetStart <= offset && this.offsetEnd >= offset) {
      const hoverInfo: HoverInfo[] = [{
        content: "(full path: " + this.value + ")",
        offset: [this.offsetStart, this.offsetEnd]
      }];
      if (this.comment) {
        hoverInfo.unshift({
          content: this.comment,
          offset: [this.offsetStart!, this.offsetEnd!]
        });
      }
      return hoverInfo;
    }
    return [];
  }
}
