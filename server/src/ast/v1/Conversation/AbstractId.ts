import ListElement from "betonquest-utils/betonquest/ListElement";

import { NodeV1, NodeType } from "../../node";
import { LocationLinkOffset } from "../../../utils/location";
import { ElementEntry } from "../Element/ElementEntry";

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

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }

    return this.getTargetNodes().flatMap(n => ({
      originSelectionRange: [this.offsetStart, this.offsetEnd],
      targetUri: n.getUri(),
      targetRange: [n.offsetStart!, n.offsetEnd!],
      targetSelectionRange: [n.offsetStart!, n.offsetEnd!]
    }));
  }
}
