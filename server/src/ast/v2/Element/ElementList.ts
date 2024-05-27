import { Pair, Scalar, YAMLMap, isPair, isScalar } from "yaml";
import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { ElementListType } from "../../node";
import { PackageV2 } from "../Package";
import { Document, SectionCollection } from "../document";
import { ElementEntry } from "./ElementEntry";
import { HoverInfo } from "../../../utils/hover";

export abstract class ElementList<LE extends ListElement> extends SectionCollection<ElementListType> {
  abstract type: ElementListType;

  entriesSections: ElementListSection<LE, ElementEntry<LE>>[] = [];

  constructor(uri: string, parent: PackageV2) {
    super(uri, parent);
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    return this.entriesSections.filter(section => !documentUri || section.uri === documentUri).flatMap(section => section.getPublishDiagnosticsParams());
  }

  getSemanticTokens(documentUri: string) {
    return this.entriesSections.filter(section => section.uri === documentUri).flatMap(section => section.getSemanticTokens());
  }

  getHoverInfo(documentUri: string, offset: number): HoverInfo[] {
    return this.entriesSections.filter(section => section.uri === documentUri).flatMap(section => section.getHoverInfo(offset));
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return this.entriesSections.flatMap(section => section.getLocations(yamlPath, sourceUri));
  }
}

export abstract class ElementListSection<LE extends ListElement, EE extends ElementEntry<LE>> extends Document<ElementListType> {
  abstract type: ElementListType;

  entries: EE[] = [];

  getEntries() {
    return this.entries;
  }

  constructor(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>>, parent: ElementList<LE>) {
    super(uri, document, yml, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        // this.entries.push(new ElementEntry<U>(pair, this));
        this.entries.push(this.newEntry(pair));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  abstract newEntry(pair: Pair<Scalar<string>, Scalar<string>>): EE;

  getPublishDiagnosticsParams() {
    return {
      uri: this.document.uri,
      diagnostics: this.entries.flatMap(e => e.getDiagnostics())
    } as PublishDiagnosticsParams;
  }

  getSemanticTokens() {
    return this.entries.flatMap(e => {
      return e.getSemanticTokens();
    });
  }

  getHoverInfo(offset: number) {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return this.entries.flatMap(e => e.getHoverInfo(offset));
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
