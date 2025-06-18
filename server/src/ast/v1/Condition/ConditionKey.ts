
import { Scalar } from "yaml";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { ConditionKeyType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ConditionEntry } from "./ConditionEntry";

export class ConditionKey extends AbstractNodeV1<ConditionKeyType> {
  readonly type: ConditionKeyType = "ConditionKey";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConditionEntry;

  readonly value: string;
  readonly comment?: string;

  constructor(key: Scalar<string>, parent: ConditionEntry) {
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
      tokenType: SemanticTokenType.ConditionID
    }];
  }

  getHoverInfo(offset?: number, documentUri?: string): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [{
      content: `(Condition) ${this.parent.kindConfig?.display}\n\nPackage path: ` + this.getPackagePath().join("-") + "." + this.value,
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

  getReferences(offset: number, documentUri?: string): LocationLinkOffset[] {
    return this.getConversationConditionPointers(
      this.value,
      this.getPackageUri()
    )
      .flatMap(n => ({
        originSelectionRange: [this.offsetStart, this.offsetEnd],
        targetUri: n.getUri(),
        targetRange: [n.offsetStart!, n.offsetEnd!],
        targetSelectionRange: [n.offsetStart!, n.offsetEnd!]
      }));
  }
}
