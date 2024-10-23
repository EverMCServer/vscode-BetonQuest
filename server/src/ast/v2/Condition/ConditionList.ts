import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Pair, Scalar, YAMLMap, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { ConditionListSectionType, ConditionListType } from "../../node";
import { PackageV2 } from "../Package";
import { Document, SectionCollection } from "../document";
import { ConditionEntry } from "./ConditionEntry";
import { ConditionKey } from "./ConditionKey";

export class ConditionList extends SectionCollection<ConditionListType> {
  readonly type: ConditionListType = "ConditionList";

  constructor(uri: string, parent: PackageV2) {
    super(uri, parent);
  }

  addSection(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>): void {
    this.children.push(new ConditionListSection(uri, document, yml, this));
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    return this.getChildren<ConditionListSection>('ConditionListSection', section => !documentUri || section.getUri() === documentUri).flatMap(section => section.getPublishDiagnosticsParams());
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    return this.children.map(section => (section as ConditionListSection).getLocations(yamlPath, sourceUri));
  }

  getConditionEntries(id: string, packageUri?: string): ConditionEntry[] {
    if (!packageUri || this.parent.isPackageUri(packageUri)) {
      return this.children
        .flatMap(section => (section as ConditionListSection).getConditionEntries(id));
    } else {
      return this.parent.getConditionEntries(id, packageUri);
    }
  }
}

export class ConditionListSection extends Document<ConditionListSectionType> {
  readonly type: ConditionListSectionType = "ConditionListSection";
  readonly parent: ConditionList;

  constructor(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>, parent: ConditionList) {
    super(uri, document, yml);
    this.parent = parent;

    // Parse Elements
    this.yml.value?.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        // this.entries.push(new ElementEntry<U>(pair, this));
        this.addChild(new ConditionEntry(pair, this));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  _getConditionEntries(id?: string) {
    return this.getChildren<ConditionEntry>('ConditionEntry', e => e.getChild<ConditionKey>('ConditionKey', id === undefined ? undefined : e => e.value === id));
  }

  getPublishDiagnosticsParams() {
    return {
      uri: this.document.uri,
      diagnostics: this.children.flatMap(e => e._getDiagnostics())
    } as PublishDiagnosticsParams;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    // const entry = this.getChild<ConditionEntry>('ConditionEntry', e => e.getChild<ConditionKey>('ConditionKey', e => e.value === yamlPath[1]));
    const entry = this._getConditionEntries(yamlPath[1])[0];
    if (entry) {
      result.push({
        uri: this.uri,
        offset: entry.offsetStart,
      });
    }
    return result;
  }

  getConditionEntries(id: string, packageUri?: string): ConditionEntry[] {
    if (!packageUri || this.parent.parent.isPackageUri(packageUri)) {
      return this._getConditionEntries(id);
    } else {
      return this.parent.getConditionEntries(id, packageUri);
    }
  }

}
