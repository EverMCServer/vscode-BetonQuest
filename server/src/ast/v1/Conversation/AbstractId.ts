import ListElement from "betonquest-utils/betonquest/ListElement";

import { NodeV1, NodeType } from "../../node";
import { ElementEntry } from "../Element/ElementEntry";
import { SemanticToken } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";

export abstract class AbstractID<T extends NodeType, PT extends NodeV1<NodeType>, ET extends ElementEntry<ListElement>> extends NodeV1<T> {
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
    // Check illigal characters
    if (str.match(/[\s]/g)) {
      // TODO this._addDiagnostic();
    }
    // Parse exclamation mark
    if ((this.withExclamationMark = str.startsWith("!")) === true) {
      str = str.substring(1);
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

  // TODO
  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [];
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
