import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { HoverInfo } from "../../../utils/hover";
import { EventListType } from "../../node";
import { PackageV2 } from "../Package";
import { Document, SectionCollection } from "../document";
import { EventEntry } from "./EventEntry";

export class EventList extends SectionCollection<EventListType> {
  type: EventListType = "EventList";

  constructor(uri: string, parent: PackageV2) {
    super(uri, parent);
  }

  addSection(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>, unknown>): void {
    this.children.push(new EventListSection(uri, document, yml, this));
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    return this.children.filter(section => !documentUri || section.uri === documentUri).flatMap(section => section.getPublishDiagnosticsParams());
  }

  getSemanticTokens(documentUri: string) {
    return this.children.filter(section => section.uri === documentUri).flatMap(section => section.getSemanticTokens());
  }

  getHoverInfo(offset: number, documentUri: string): HoverInfo[] {
    return this.children.filter(section => section.uri === documentUri).flatMap(section => section.getHoverInfo(offset));
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return this.children.flatMap(section => section.getLocations(yamlPath, sourceUri));
  }

  getEventEntries(id: string, packageUri?: string): EventEntry[] {
    if (!packageUri || this.parent.isPackageUri(packageUri)) {
      return this.children
        .flatMap(section => section.getEventEntries(id));
    } else {
      return this.parent.getEventEntries(id, packageUri);
    }
  }
}

export class EventListSection extends Document<EventListType, EventList> {
  type: EventListType = "EventList";

  constructor(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>>, parent: EventList) {
    super(uri, document, yml, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        // this.entries.push(new ElementEntry<U>(pair, this));
        this.addChild(new EventEntry(pair, this));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  getPublishDiagnosticsParams() {
    return {
      uri: this.document.uri,
      diagnostics: this.children.flatMap(e => e.getDiagnostics())
    } as PublishDiagnosticsParams;
  }

  getSemanticTokens() {
    return [
      ...this.semanticTokens,
      ...this.children.flatMap(e => {
        return e.getSemanticTokens();
      })
    ];
  }

  getHoverInfo(offset: number) {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return this.children.flatMap(e => e.getHoverInfo(offset));
    }
    return [];
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    const key = this.children.find(e => e.elementKey.value === yamlPath[1])?.elementKey;
    if (key) {
      result.push({
        uri: this.uri!,
        offset: key.offsetStart,
      });
    }
    return result;
  }

  getEventEntries(id: string, packageUri?: string): EventEntry[] {
    if (!packageUri || this.parent.parent.isPackageUri(packageUri)) {
      return this.children
        .filter(entry => entry.elementKey.value === id);
    } else {
      return this.parent.getEventEntries(id, packageUri);
    }
  }

}
