import Objective from "betonquest-utils/betonquest/Objective";
import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { ObjectiveKindType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ObjectiveEntry } from "./ObjectiveEntry";

export class ObjectiveKind extends AbstractNodeV1<ObjectiveKindType> {
  readonly type: ObjectiveKindType = "ObjectiveKind";
  offsetStart?: number;
  offsetEnd?: number;
  readonly parent: ObjectiveEntry;

  value: string;
  kindConfig?: _ElementKind<Objective>;

  constructor(value: string, range: [number?, number?], kindConfig: _ElementKind<Objective>, parent: ObjectiveEntry) {
    super();
    this.parent = parent;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];

    this.value = value;
    this.kindConfig = kindConfig;
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
      if (this.kindConfig) {
        info.content = `(${this.type}) ${this.kindConfig?.value}`;
        if (this.kindConfig.description) {
          // TODO: Remove html tag from this.kindConfig.description
          info.content += "\n\n---\n\n" + this.kindConfig.display.toString() + "\n\n" + this.kindConfig.description;
        }
      }
      infos.push(info);
    }
    return infos;
  }
}
