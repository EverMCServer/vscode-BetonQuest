import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import Condition from "betonquest-utils/betonquest/Condition";
import { kinds } from "betonquest-utils/betonquest/v2/Conditions";
import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v2/Element";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { ConditionKindType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionEntry } from "./ConditionEntry";

export class ConditionKind extends AbstractNodeV2<ConditionKindType> {
  readonly type: ConditionKindType = "ConditionKind";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionEntry;

  private value: string;
  private kindConfig?: _ElementKind<Condition>;

  constructor(value: string, range: [number?, number?], kindConfig: _ElementKind<Condition>, parent: ConditionEntry) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

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

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    if (this.offsetStart && this.offsetEnd && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return kinds.filter(k => k.value.startsWith(this.value.toLowerCase())).flatMap(k => ({
        label: k.value,
        kind: CompletionItemKind.Constructor, // TODO: move it onto SemanticTokenType etc.
        detail: k.display,
        documentation: k.description?.toString()
      }));
    }
    return [];
  }
}
