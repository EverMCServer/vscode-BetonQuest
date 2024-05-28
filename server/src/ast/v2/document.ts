import { Scalar, YAMLMap } from "yaml";
import { Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { NodeV2, NodeType } from "../node";
import { PackageV2 } from "./Package";
import { SemanticToken } from "../../service/semanticTokens";

export abstract class Document<T extends NodeType> extends NodeV2<T> {
  uri: string;
  protected parent: SectionCollection<T>;

  // VSCode Document, for diagnostics / quick actions / goto definition, etc
  document: TextDocument;
  yml: YAMLMap<Scalar<string>>;

  semanticTokens: SemanticToken[] = [];

  constructor(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>>, parent: SectionCollection<T>) {
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

export abstract class SectionCollection<T extends NodeType> extends NodeV2<T> {
  abstract type: T;
  protected uri: string;
  parent: PackageV2;

  constructor(uri: string, parent: PackageV2) {
    super();
    this.uri = uri;
    this.parent = parent;
  }

  abstract addSection(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>>): void;
}
