import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import { ConditionListType } from "../../node";
import { PackageV1 } from "../Package";
import { Document } from "../document";
import { ConditionEntry } from "./ConditionEntry";
import { ConditionKey } from "./ConditionKey";

export class ConditionList extends Document<ConditionListType> {
  readonly type: ConditionListType = "ConditionList";

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super(uri, document, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        this.addChild(new ConditionEntry(pair, this));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  _getConditionEntries(id?: string) {
    return this.getChildren<ConditionEntry>('ConditionEntry', e => e.getChild<ConditionKey>('ConditionKey', id === undefined ? undefined : e => e.value === id));
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    this
      .getChildren<ConditionEntry>('ConditionEntry')
      .flatMap(e => e.getChildren<ConditionKey>('ConditionKey', k => k.value === yamlPath[1]))
      .forEach(k => {
        result.push({
          uri: this.uri,
          offset: k.offsetStart
        });
      });
    return result;
  }

  getConditionEntries(id: string, packageUri: string): ConditionEntry[] { // TODO: optimize let packageUri be optional
    if (this.parent.isPackageUri(packageUri)) {
      return this.getChildren<ConditionEntry>('ConditionEntry', e => e.getChild<ConditionKey>('ConditionKey')?.value === id);
    } else {
      return this.parent.getConditionEntries(id, packageUri);
    }
  }

}
