import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import { ObjectiveListType } from "../../node";
import { PackageV1 } from "../Package";
import { Document } from "../document";
import { ObjectiveEntry } from "./ObjectiveEntry";

export class ObjectiveList extends Document<ObjectiveListType> {
  readonly type: ObjectiveListType = "ObjectiveList";

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super(uri, document, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        this.addChild(new ObjectiveEntry(pair, this));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    const key = this.getChild<ObjectiveEntry>('ObjectiveEntry', e => e.elementKey.value === yamlPath[1])?.elementKey;
    if (key) {
      result.push({
        uri: this.uri!,
        offset: key.offsetStart,
      });
    }
    return result;
  }

  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] { // TODO: optimize let packageUri be optional
    if (this.parent.isPackageUri(packageUri)) {
      return this.getChildren<ObjectiveEntry>('ObjectiveEntry', entry => entry.elementKey.value === id);
    } else {
      return this.parent.getObjectiveEntries(id, packageUri);
    }
  }

}
