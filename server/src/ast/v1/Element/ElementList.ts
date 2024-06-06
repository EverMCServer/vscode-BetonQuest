import { Pair, Scalar, isPair, isScalar } from "yaml";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { Document } from "../document";
import { ElementListType } from "../../node";
import { PackageV1 } from "../Package";
import { ElementEntry } from "./ElementEntry";

export abstract class ElementList<LE extends ListElement, Entry extends ElementEntry<LE>> extends Document<ElementListType> {
  abstract type: ElementListType;

  entries: Entry[] = [];

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super(uri, document, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        this.entries.push(this.newEntry(pair));
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  abstract newEntry(pair: Pair<Scalar<string>, Scalar<string>>): Entry;

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
