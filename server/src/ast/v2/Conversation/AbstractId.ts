import { DiagnosticSeverity } from "vscode-languageserver";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { NodeType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionEntry } from "../Condition/ConditionEntry";
import { ConditionKey } from "../Condition/ConditionKey";
import { EventEntry } from "../Event/EventEntry";
import { EventKey } from "../Event/EventKey";
import { ObjectiveEntry } from "../Objective/ObjectiveEntry";
import { ObjectiveKey } from "../Objective/ObjectiveKey";

export abstract class AbstractID<T extends NodeType, ET extends ConditionEntry | EventEntry | ObjectiveEntry> extends AbstractNodeV2<T> {
  readonly offsetStart: number;
  readonly offsetEnd: number;

  // Cache content
  protected withExclamationMark: boolean;
  protected package: string = "";
  protected id: string;

  constructor(idString: string, range: [number, number]) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];

    // Parse ID string.
    let str = idString;
    // Parse exclamation mark
    if ((this.withExclamationMark = str.startsWith("!")) === true) {
      str = str.substring(1);
    }
    // Check illigal characters
    if (str.match(/\s/)) {
      // TODO this._addDiagnostic();
      this.addDiagnostic(
        [this.offsetStart + (this.withExclamationMark ? 1 : 0), this.offsetEnd],
        "An ID cannot contains any spaces",
        DiagnosticSeverity.Error,
        DiagnosticCode.ValueIdContainsSpace,
        [
          {
            title: "Remove spaces",
            text: str.replace(/\s/g, "")
          }
        ]
      );
    }
    // Parse package path
    if (str.includes(".")) {
      const splited = str.split(".", 2);
      this.package = splited[0];
      this.id = splited[1];
    } else {
      this.id = str;
    }
  }

  // Method to get the target nodes that this ID points to.
  abstract getTargetNodes(): ET[];

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [];
    if (this.withExclamationMark) {
      semanticTokens.push({
        offsetStart: this.offsetStart,
        offsetEnd: this.offsetStart + 1,
        tokenType: SemanticTokenType.Operator
      });
    }
    return semanticTokens;
  };

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return hoverInfo;
    }
    hoverInfo.push(...this.getTargetNodes().flatMap(n => {
      const hoverInfo = [
        ...n.getChild<ConditionKey | EventKey | ObjectiveKey>(['ConditionKey', 'EventKey', 'ObjectiveKey'])!
          .getHoverInfo().map(h => {
            h.offset = [this.offsetStart, this.offsetEnd];
            return h;
          })
      ];
      if (n.yml.value) {
        hoverInfo.unshift({
          content: n.yml.value.value,
          offset: [this.offsetStart, this.offsetEnd]
        });
      }
      return hoverInfo;
    }));
    return hoverInfo;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }

    return this.getTargetNodes().flatMap(n => ({
      originSelectionRange: [this.offsetStart + (this.withExclamationMark ? 1 : 0), this.offsetEnd],
      targetUri: n.getUri(),
      targetRange: [n.offsetStart!, n.offsetEnd!],
      targetSelectionRange: [n.offsetStart!, n.offsetEnd!]
    }));
  }
}
