import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Pair, Scalar, YAMLMap, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { ObjectiveListSectionType, ObjectiveListType } from "../../node";
import { PackageV2 } from "../Package";
import { Document, SectionCollection } from "../document";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { ObjectiveKey } from "./ObjectiveKey";

export class ObjectiveList extends SectionCollection<ObjectiveListType> {
  readonly type: ObjectiveListType = "ObjectiveList";

  constructor(uri: string, parent: PackageV2) {
    super(uri, parent);
  }

  addSection(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>): void {
    this.children.push(new ObjectiveListSection(uri, document, yml, this));
  }

  getPublishDiagnosticsParams(): PublishDiagnosticsParams[] {
    return this.getChildren<ObjectiveListSection>('ObjectiveListSection').flatMap(section => section.getPublishDiagnosticsParams());
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return this.children.map(section => (section as ObjectiveListSection).getLocations(yamlPath, sourceUri));
  }

  getObjectiveEntries(id?: string, packageUri?: string): ObjectiveEntry[] {
    if (!packageUri || this.parent.isPackageUri(packageUri)) {
      return this.children
        .flatMap(section => (section as ObjectiveListSection).getObjectiveEntries(id));
    } else {
      return this.parent.getObjectiveEntries(id, packageUri);
    }
  }
}

export class ObjectiveListSection extends Document<ObjectiveListSectionType> {
  readonly type: ObjectiveListSectionType = "ObjectiveListSection";
  readonly parent: ObjectiveList;

  constructor(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>, parent: ObjectiveList) {
    super(uri, document, yml);
    this.parent = parent;

    // Parse Elements
    this.yml.value?.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        // this.entries.push(new ElementEntry<U>(pair, this));
        this.addChild(new ObjectiveEntry(pair, this));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  _getObjectiveEntries(id?: string) {
    return this.getChildren<ObjectiveEntry>('ObjectiveEntry', e => e.getChild<ObjectiveKey>('ObjectiveKey', id === undefined ? undefined : e => e.value === id));
  }

  getPublishDiagnosticsParams() {
    return {
      uri: this.document.uri,
      diagnostics: this.children.flatMap(e => e._getDiagnostics())
    } as PublishDiagnosticsParams;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    // const entry = this.getChild<ObjectiveEntry>('ObjectiveEntry', e => e.getChild<ObjectiveKey>('ObjectiveKey', e => e.value === yamlPath[1]));
    const entry = this._getObjectiveEntries(yamlPath[1])[0];
    if (entry) {
      result.push({
        uri: this.uri,
        offset: entry.offsetStart,
      });
    }
    return result;
  }

  getObjectiveEntries(id?: string, packageUri?: string): ObjectiveEntry[] {
    if (!packageUri || this.parent.parent.isPackageUri(packageUri)) {
      return this._getObjectiveEntries(id);
    } else {
      return this.parent.getObjectiveEntries(id, packageUri);
    }
  }

}
