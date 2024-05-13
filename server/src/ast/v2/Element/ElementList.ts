import { Pair, Scalar, YAMLMap } from "yaml";
import { CodeAction, Diagnostic, PublishDiagnosticsParams, Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementListType, Node } from "../../node";
import { PackageV2 } from "../Package";
import { ElementEntry } from "./ElementEntry";

export abstract class ElementList<LE extends ListElement> extends Node<ElementListType> {
  abstract type: ElementListType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: PackageV2;

  // VSCode Document, for diagnostics / quick actions / goto definition, etc
  document: TextDocument;

  // Cache the parsed yaml document
  yml?: YAMLMap<Scalar<string>, Scalar<string>>;
  entries: ElementEntry<LE>[] = [];

  getEntries() {
    return this.entries;
  }

  constructor(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>, Scalar<string>>, parent: PackageV2) {
    super();
    this.uri = uri;
    this.parent = parent;
    this.document = document;

    // Parse yaml
    if (!(yml instanceof YAMLMap)) {
      return;
    }
    this.yml = yml;

    // Extract offsets
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];

    // Parse Elements
    this.yml.items.forEach(pair => {
      // this.entries.push(new ElementEntry<U>(pair, this));
      this.entries.push(this.newEntry(pair));
    });
  }

  abstract newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ElementEntry<LE>;

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return {
      start: this.document.positionAt(offsetStart),
      end: this.document.positionAt(offsetEnd)
    } as Range;
  }

  getPublishDiagnosticsParams() {
    return {
      uri: this.document.uri,
      diagnostics: this.entries.flatMap(e => e.getDiagnostics())
    } as PublishDiagnosticsParams;
  }

  getSemanticTokens(uri: string) {
    if (this.uri !== uri) {
      return [];
    }
    return this.entries.flatMap(e => {
      return e.getSemanticTokens();
    });
  }

  getHoverInfo(uri: string, offset: number) {
    if (this.uri === uri && this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return this.entries.flatMap(e => e.getHoverInfo(uri, offset));
    }
    return [];
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    const key = this.entries.find(e => e.elementKey.value === yamlPath[1])?.elementKey;
    if (key) {
      result.push({
        uri: this.uri!,
        offset: key.offsetStart,
      });
    }
    return result;
  }

}
