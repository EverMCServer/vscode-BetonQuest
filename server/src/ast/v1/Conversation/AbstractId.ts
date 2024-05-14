import { NodeV1, NodeType } from "../../node";

export abstract class AbstractID<T extends NodeType, PT extends NodeV1<NodeType>, CT extends NodeV1<NodeType>> extends NodeV1<T> {
  abstract type: T;
  protected uri: string;
  protected offsetStart: number;
  protected offsetEnd: number;
  protected parent: PT;

  // Cache content
  protected withExclamationMark: boolean; // TODO
  protected package: string[] = []; // TODO
  protected id: string;
  protected targetNodes: CT[]; // The child nodes that this ID points to.

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
      const splited = str.split(".");
      this.package = this.parsePackage(splited[0]);
      this.id = splited[1];
    } else {
      this.id = str;
    }

    this.targetNodes = this.getTargetNodes();
  }

  // Method to get the target nodes that this ID points to.
  abstract getTargetNodes(): CT[];

  // Parse package path by string
  parsePackage(str: string): string[] {
    const splited = str.split("-");
    // TODO: parse relative path: "_" one folder up.
    return splited;
  }
}
