import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, isPair, isScalar } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import { ObjectiveListType } from "../../node";
import { PackageV1 } from "../Package";
import { Document } from "../document";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { ObjectiveKey } from "./ObjectiveKey";

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

  _getObjectiveEntries(id?: string) {
    return this.getChildren<ObjectiveEntry>('ObjectiveEntry', e => e.getChild<ObjectiveKey>('ObjectiveKey', id === undefined ? undefined : e => e.value === id));
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    this
      .getChildren<ObjectiveEntry>('ObjectiveEntry')
      .flatMap(e => e.getChildren<ObjectiveKey>('ObjectiveKey', k => k.value === yamlPath[1]))
      .forEach(k => {
        result.push({
          uri: this.uri,
          offset: k.offsetStart
        });
      });
    return result;
  }

  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] { // TODO: optimize let packageUri be optional
    if (this.parent.isPackageUri(packageUri)) {
      return this.getChildren<ObjectiveEntry>('ObjectiveEntry', e => e.getChild<ObjectiveKey>('ObjectiveKey')?.value === id);
    } else {
      return this.parent.getObjectiveEntries(id, packageUri);
    }
  }

}
