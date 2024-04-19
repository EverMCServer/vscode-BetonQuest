import { Scalar } from "yaml";

import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementKeyType, Node } from "../../node";
import { ElementEntry } from "./ElementEntry";
import { HoverInfo } from "../../../utils/hover";
import { SemanticToken } from "../../../service/semanticTokens";

export abstract class ElementKey<LE extends ListElement> implements Node<ElementKeyType> {
  abstract type: ElementKeyType;
  uri: string;
  offsetStart?: number | undefined;
  offsetEnd?: number | undefined;
  parent: ElementEntry<LE> | undefined;

  value: string;

  constructor(key: Scalar<string>, parent: ElementEntry<LE>) {
    this.uri = parent.uri;
    this.offsetStart = key.range?.[0];
    this.offsetEnd = key.range?.[1];
    this.parent = parent;

    this.value = key.value;
  }

  abstract getSemanticTokens(): SemanticToken[];

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return [
        {
          content: "(full path: " + this.value + ")",
          offset: [this.offsetStart, this.offsetEnd]
        },
      ];
    }
    return [];
  }
}