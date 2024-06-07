import { Scalar } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementKeyType } from "../../node";
import { ElementEntry } from "./ElementEntry";
import { HoverInfo } from "../../../utils/hover";
import { SemanticToken } from "../../../service/semanticTokens";
import { AbstractNodeV1 } from "../../v1";

export abstract class ElementKey<LE extends ListElement> extends AbstractNodeV1<ElementKeyType> {
  abstract type: ElementKeyType;
  readonly uri: string;
  readonly offsetStart: number;
  readonly offsetEnd: number;

  readonly value: string;
  readonly comment?: string;

  constructor(key: Scalar<string>, parent: ElementEntry<LE>) {
    super();
    this.uri = parent.uri;
    this.offsetStart = key.range![0];
    this.offsetEnd = key.range![1];

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