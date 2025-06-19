import Event from "betonquest-utils/betonquest/Event";
import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { EventKindType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { EventEntry } from "./EventEntry";
import { html2markdown } from "../../../utils/html2markdown";

export class EventKind extends AbstractNodeV1<EventKindType> {
  readonly type: EventKindType = "EventKind";
  offsetStart?: number;
  offsetEnd?: number;
  readonly parent: EventEntry;

  value: string;

  constructor(value: string, range: [number?, number?], parent: EventEntry) {
    super();
    this.parent = parent;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];

    this.value = value;
  }

  getSemanticTokens(): SemanticToken[] {
    if (this.offsetStart === undefined || this.offsetEnd === undefined) {
      return [];
    }
    return [{
      offsetStart: this.offsetStart,
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.InstructionKind
    }];
  };

  getHoverInfo(offset: number): HoverInfo[] {
    const infos: HoverInfo[] = [];
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      const info: HoverInfo = {
        content: "",
        offset: [this.offsetStart, this.offsetEnd]
      };
      if (this.parent.kindConfig) {
        info.content = `(${this.type}) ${this.parent.kindConfig.value}`;
        if (this.parent.kindConfig.description) {
          info.content += "\n\n---\n\n" + this.parent.kindConfig.display + "\n\n" + html2markdown(this.parent.kindConfig.description.toString());
        }
      }
      infos.push(info);
    }
    return infos;
  }
}
