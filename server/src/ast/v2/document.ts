import { PublishDiagnosticsParams, Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Pair, Scalar, YAMLMap } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { NodeType } from "../node";
import { AbstractNodeV2 } from "../v2";
import { PackageV2 } from "./Package";

export abstract class SectionCollection<T extends NodeType> extends AbstractNodeV2<T> {
  abstract type: T;
  readonly parent: PackageV2;

  constructor(uri: string, parent: PackageV2) {
    super();
    this.parent = parent;
  }

  abstract addSection(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>): void;

  // Remove documents which are not on the urls list
  filterSections(uris: string[]) {
    this.children = this.children.filter(e => uris.includes(e.getUri()));
  }

  abstract getPublishDiagnosticsParams(): PublishDiagnosticsParams[];

  abstract getLocations(yamlPath: string[], sourceUri: string): LocationsResponse[];
}

export abstract class Document<T extends NodeType> extends AbstractNodeV2<T> {
  readonly uri: string;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;

  // VSCode Document, for diagnostics / quick actions / goto definition, etc
  readonly document: TextDocument;
  readonly yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>;

  constructor(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>) {
    super();

    this.uri = uri;
    // this.parent = parent;
    this.document = document;
    this.yml = yml;

    // Extract offsets
    this.offsetStart = this.yml.key.range?.[0];
    this.offsetEnd = this.yml.value?.range?.[1] || this.yml.key.range?.[1];
  }

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return {
      start: this.document.positionAt(offsetStart),
      end: this.document.positionAt(offsetEnd)
    } as Range;
  }

  // Get all CodeActions, quick fixes etc
  _getCodeActions(documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getCodeActions();
  }

  _getSemanticTokens(documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getSemanticTokens();
  }

  _getHoverInfo(offset: number, documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getHoverInfo(offset, documentUri);
  }

  _getDefinitions(offset: number, documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getDefinitions(offset, documentUri);
  }

  _getReferences(offset: number, documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getReferences(offset, documentUri);
  }

  _getCompletions(offset: number, documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getCompletions(offset, documentUri);
  }
}
