import { Scalar } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementKeyType, NodeV2 } from "../../node";
import { ElementEntry } from "./ElementEntry";
import { HoverInfo } from "../../../utils/hover";
import { SemanticToken } from "../../../service/semanticTokens";

export abstract class ElementKey<LE extends ListElement> extends NodeV2<ElementKeyType> {
  abstract type: ElementKeyType;
  uri: string;
  offsetStart: number;
  offsetEnd: number;
  parent: ElementEntry<LE>;

  value: string;
  comment?: string;

  constructor(key: Scalar<string>, parent: ElementEntry<LE>) {
    super();
    this.uri = parent.uri;
    this.offsetStart = key.range![0];
    this.offsetEnd = key.range![1];
    this.parent = parent;

    this.value = key.value;
    this.comment = key.commentBefore?.split(/\n\n+/).slice(-1)[0] ?? undefined;
  }

  abstract getSemanticTokens(): SemanticToken[];

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