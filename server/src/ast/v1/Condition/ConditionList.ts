import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import { ConditionListType } from "../../node";
import { PackageV1 } from "../Package";
import { Document } from "../document";
import { ConditionEntry } from "./ConditionEntry";

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

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    const key = this.getChild<ConditionEntry>('ConditionEntry', e => e.elementKey.value === yamlPath[1])?.elementKey;
    if (key) {
      result.push({
        uri: this.uri!,
        offset: key.offsetStart,
      });
    }
    return result;
  }

  getConditionEntries(id: string, packageUri: string): ConditionEntry[] { // TODO: optimize let packageUri be optional
    if (this.parent.isPackageUri(packageUri)) {
      return this.getChildren<ConditionEntry>('ConditionEntry', entry => entry.elementKey.value === id);
    } else {
      return this.parent.getConditionEntries(id, packageUri);
    }
  }

}
