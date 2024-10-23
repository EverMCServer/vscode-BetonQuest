import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Pair, Scalar, YAMLMap, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { EventListSectionType, EventListType } from "../../node";
import { PackageV2 } from "../Package";
import { Document, SectionCollection } from "../document";
import { EventEntry } from "./EventEntry";
import { EventKey } from "./EventKey";

export class EventList extends SectionCollection<EventListType> {
  readonly type: EventListType = "EventList";

  constructor(uri: string, parent: PackageV2) {
    super(uri, parent);
  }

  addSection(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>): void {
    this.children.push(new EventListSection(uri, document, yml, this));
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    return this.getChildren<EventListSection>('EventListSection', section => !documentUri || section.getUri() === documentUri).flatMap(section => section.getPublishDiagnosticsParams());
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return this.children.map(section => (section as EventListSection).getLocations(yamlPath, sourceUri));
  }

  getEventEntries(id: string, packageUri?: string): EventEntry[] {
    if (!packageUri || this.parent.isPackageUri(packageUri)) {
      return this.children
        .flatMap(section => (section as EventListSection).getEventEntries(id));
    } else {
      return this.parent.getEventEntries(id, packageUri);
    }
  }
}

export class EventListSection extends Document<EventListSectionType> {
  readonly type: EventListSectionType = "EventListSection";
  readonly parent: EventList;

  constructor(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>, parent: EventList) {
    super(uri, document, yml);
    this.parent = parent;

    // Parse Elements
    this.yml.value?.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        // this.entries.push(new ElementEntry<U>(pair, this));
        this.addChild(new EventEntry(pair, this));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  _getEventEntries(id?: string) {
    return this.getChildren<EventEntry>('EventEntry', e => e.getChild<EventKey>('EventKey', id === undefined ? undefined : e => e.value === id));
  }

  getPublishDiagnosticsParams() {
    return {
      uri: this.document.uri,
      diagnostics: this.children.flatMap(e => e._getDiagnostics())
    } as PublishDiagnosticsParams;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    // const entry = this.getChild<EventEntry>('EventEntry', e => e.getChild<EventKey>('EventKey', e => e.value === yamlPath[1]));
    const entry = this._getEventEntries(yamlPath[1])[0];
    if (entry) {
      result.push({
        uri: this.uri,
        offset: entry.offsetStart,
      });
    }
    return result;
  }

  getEventEntries(id: string, packageUri?: string): EventEntry[] {
    if (!packageUri || this.parent.parent.isPackageUri(packageUri)) {
      return this._getEventEntries(id);
    } else {
      return this.parent.getEventEntries(id, packageUri);
    }
  }

}
