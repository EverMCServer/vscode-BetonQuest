import { Scalar } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementKeyType, NodeV1 } from "../../node";
import { ElementEntry } from "./ElementEntry";
import { HoverInfo } from "../../../utils/hover";
import { SemanticToken } from "../../../service/semanticTokens";

export abstract class ElementKey<LE extends ListElement> extends NodeV1<ElementKeyType> {
  abstract type: ElementKeyType;
  uri: string;
  offsetStart?: number | undefined;
  offsetEnd?: number | undefined;
  parent: ElementEntry<LE>;

  value: string;
  comment?: string;

  constructor(key: Scalar<string>, parent: ElementEntry<LE>) {
    super();
    this.uri = parent.uri;
    this.offsetStart = key.range?.[0];
    this.offsetEnd = key.range?.[1];
    this.parent = parent;

    this.value = key.value;
    this.comment = key.commentBefore ?? undefined;
  }

  abstract getSemanticTokens(): SemanticToken[];

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
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