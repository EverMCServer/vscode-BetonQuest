import { Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap } from "yaml";

import { NodeType } from "../node";
import { AbstractNodeV2 } from "../v2";
import { PackageV2 } from "./Package";

export abstract class SectionCollection<T extends NodeType> extends AbstractNodeV2<T> {
  abstract type: T;
  readonly uri: string;
  readonly parent: PackageV2;

  constructor(uri: string, parent: PackageV2) {
    super();
    this.uri = uri;
    this.parent = parent;
  }

  abstract addSection(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>>): void;
}

export abstract class Document<T extends NodeType> extends AbstractNodeV2<T> {
  readonly offsetStart?: number | undefined;
  readonly offsetEnd?: number | undefined;

  // VSCode Document, for diagnostics / quick actions / goto definition, etc
  readonly document: TextDocument;
  readonly yml: YAMLMap<Scalar<string>>;

  constructor(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>>) {
    super();

    this.uri = uri;
    // this.parent = parent;
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
