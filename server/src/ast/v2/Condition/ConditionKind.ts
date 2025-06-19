import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { html2markdown } from "../../../utils/html2markdown";
import { ConditionKindType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionEntry } from "./ConditionEntry";

export class ConditionKind extends AbstractNodeV2<ConditionKindType> {
  readonly type: ConditionKindType = "ConditionKind";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionEntry;

  private value: string;

  constructor(value: string, range: [number?, number?], parent: ConditionEntry) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

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
