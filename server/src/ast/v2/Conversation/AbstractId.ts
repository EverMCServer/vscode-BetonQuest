import { DiagnosticSeverity } from "vscode-languageserver";

import ListElement from "betonquest-utils/betonquest/ListElement";

import { NodeV2, NodeType } from "../../node";
import { ElementEntry } from "../Element/ElementEntry";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { SemanticToken } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";

export abstract class AbstractID<T extends NodeType, PT extends NodeV2<NodeType>, ET extends ElementEntry<ListElement>> extends NodeV2<T> {
  abstract type: T;
  protected uri: string;
  protected offsetStart: number;
  protected offsetEnd: number;
  protected parent: PT;

  // Cache content
  protected withExclamationMark: boolean;
  protected package: string = "";
  protected id: string;

  constructor(idString: string, range: [number, number], parent: PT) {
    super();
    this.uri = parent.getUri();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

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
        tokenType: "operator",
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
      const hoverInfo = [...n.elementKey.getHoverInfo().map(h => {
        h.offset = [this.offsetStart, this.offsetEnd];
        return h;
      })];
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
