import { Scalar, YAMLMap } from "yaml";
import { Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { NodeV2, NodeType } from "../node";
import { PackageV2 } from "./Package";

export abstract class Document<T extends NodeType> extends NodeV2<T> {
  uri: string;
  protected parent: PackageV2;

  // VSCode Document, for diagnostics / quick actions / goto definition, etc
  document: TextDocument;
  yml: YAMLMap<Scalar<string>>;

  constructor(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>>, parent: PackageV2) {
    super();

    this.uri = uri;
    this.parent = parent;
    this.document = document;
    this.yml = yml;

    // Extract offsets
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];
  }

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return {
      start: this.document.positionAt(offsetStart),
      end: this.document.positionAt(offsetEnd)
    } as Range;
  }
}