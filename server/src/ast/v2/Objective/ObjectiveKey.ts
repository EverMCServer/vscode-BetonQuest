
import { Scalar } from "yaml";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { ObjectiveKeyType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ObjectiveEntry } from "./ObjectiveEntry";

export class ObjectiveKey extends AbstractNodeV2<ObjectiveKeyType> {
  readonly type: ObjectiveKeyType = "ObjectiveKey";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ObjectiveEntry;

  readonly value: string;
  readonly comment?: string;

  constructor(key: Scalar<string>, parent: ObjectiveEntry) {
    super();
    this.offsetStart = key.range![0];
    this.offsetEnd = key.range![1];
    this.parent = parent;

    this.value = key.value;
    this.comment = key.commentBefore?.split(/\n\n+/).slice(-1)[0] ?? undefined;
  }

  getSemanticTokens(): SemanticToken[] {
    if (this.offsetStart === undefined || this.offsetEnd === undefined) {
      return [];
    }
    return [{
      offsetStart: this.offsetStart,
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.ObjectiveID
    }];
  };

  getHoverInfo(offset?: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [{
      content: `(Objective) ${this.parent.kindConfig?.display}\n\nPackage path: ` + this.getPackagePath().join("-") + "." + this.value,
      offset: [this.offsetStart, this.offsetEnd]
    }];
    if (this.comment && !this.comment.endsWith("\n")) {
      hoverInfo.push({
        content: this.comment.replace("\n", "\n\n"),
        offset: [this.offsetStart!, this.offsetEnd!]
      });
    }
    return hoverInfo;
  }

  getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    // Return self so VSCode will show its References instead
    return [{
      originSelectionRange: [this.offsetStart, this.offsetEnd],
      targetUri: this.getUri(),
      targetRange: [this.offsetStart, this.offsetEnd],
      targetSelectionRange: [this.offsetStart, this.offsetEnd],
    }];
  }
}
