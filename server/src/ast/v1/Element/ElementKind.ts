import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementKindType } from "../../node";
import { HoverInfo } from "../../../utils/hover";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { AbstractNodeV1, NodeV1 } from "../../v1";

export abstract class ElementKind<LE extends ListElement> extends AbstractNodeV1<ElementKindType> {
  abstract type: ElementKindType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;

  value: string;
  kindConfig?: _ElementKind<LE>;

  constructor(value: string, range: [number?, number?], kindConfig: _ElementKind<LE>, parent: NodeV1) {
    super();
    this.uri = parent.uri;
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