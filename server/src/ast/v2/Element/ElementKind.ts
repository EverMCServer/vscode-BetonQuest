import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v2/Element";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementKindType, Node } from "../../node";
import { ElementEntry } from "./ElementEntry";
import { HoverInfo } from "../../../utils/hover";
import { SemanticToken } from "../../../service/semanticTokens";

export abstract class ElementKind<LE extends ListElement> implements Node<ElementKindType> {
  abstract type: ElementKindType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: ElementEntry<LE>;

  value: string;
  kindConfig?: _ElementKind<LE>;

  constructor(value: string, range: [number?, number?], kindConfig: _ElementKind<LE>, parent: ElementEntry<LE>) {
    this.uri = parent.uri;
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
      tokenType: "macro"
    }];
  };

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    const infos: HoverInfo[] = [];
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      const info: HoverInfo = {
        content: "",
        offset: [this.offsetStart, this.offsetEnd]
      };
      if (this.kindConfig) {
        info.content = `(${this.type}) ${this.kindConfig?.value}`;
        if (this.kindConfig.description) {
          info.content += "\n\n---\n\n" + this.kindConfig.display.toString() + "\n\n" + this.kindConfig.description;
        }
      }
      infos.push(info);
    }
    return infos;
  }
}