import { Pair, Scalar, YAMLMap, isPair, isScalar, parseDocument } from "yaml";
import { CodeAction, Diagnostic, PublishDiagnosticsParams, Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { Document } from "../document";
import { ElementListType } from "../../node";
import { PackageV1 } from "../Package";
import { ElementEntry } from "./ElementEntry";

export abstract class ElementList<LE extends ListElement> extends Document<ElementListType> {
  abstract type: ElementListType;
  offsetStart?: number;
  offsetEnd?: number;

  entries: ElementEntry<LE>[] = [];

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super(uri, document, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        this.entries.push(this.newEntry(pair));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  abstract newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ElementEntry<LE>;

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
