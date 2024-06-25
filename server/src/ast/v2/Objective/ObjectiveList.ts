import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { ObjectiveListType } from "../../node";
import { PackageV2 } from "../Package";
import { Document, SectionCollection } from "../document";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { ObjectiveKey } from "./ObjectiveKey";

export class ObjectiveList extends SectionCollection<ObjectiveListType> {
  type: ObjectiveListType = "ObjectiveList";

  constructor(uri: string, parent: PackageV2) {
    super(uri, parent);
  }

  addSection(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>, unknown>): void {
    this.children.push(new ObjectiveListSection(uri, document, yml, this));
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    return this.getChildren<ObjectiveListSection>('ObjectiveList', section => !documentUri || section.getUri() === documentUri).flatMap(section => section.getPublishDiagnosticsParams());
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return this.children.flatMap(section => (section as ObjectiveListSection).getLocations(yamlPath, sourceUri));
  }

  getObjectiveEntries(id: string, packageUri?: string): ObjectiveEntry[] {
    if (!packageUri || this.parent.isPackageUri(packageUri)) {
      return this.children
        .flatMap(section => (section as ObjectiveListSection).getObjectiveEntries(id));
    } else {
      return this.parent.getObjectiveEntries(id, packageUri);
    }
  }
}

export class ObjectiveListSection extends Document<ObjectiveListType> {
  type: ObjectiveListType = "ObjectiveList";
  parent: ObjectiveList;

  constructor(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>>, parent: ObjectiveList) {
    super(uri, document, yml);
    this.parent = parent;

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        // this.entries.push(new ElementEntry<U>(pair, this));
        this.addChild(new ObjectiveEntry(pair, this));
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

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    const key = this.getChild<ObjectiveEntry>('ObjectiveEntry')?.getChild<ObjectiveKey>('ObjectiveKey', e => e.value === yamlPath[1]);
    if (key) {
      result.push({
        uri: this.uri!,
        offset: key.offsetStart,
      });
    }
    return result;
  }

  getObjectiveEntries(id: string, packageUri?: string): ObjectiveEntry[] {
    if (!packageUri || this.parent.parent.isPackageUri(packageUri)) {
      return this.getChildren<ObjectiveEntry>('ObjectiveEntry', e => e.getChild<ObjectiveKey>('ObjectiveKey')?.value === id);
    } else {
      return this.parent.getObjectiveEntries(id, packageUri);
    }
  }

}
