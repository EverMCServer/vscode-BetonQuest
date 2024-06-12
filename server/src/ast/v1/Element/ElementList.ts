import { Pair, Scalar, isPair, isScalar } from "yaml";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";
import ListElement from "betonquest-utils/betonquest/ListElement";

import { Document } from "../document";
import { ElementListType } from "../../node";
import { PackageV1 } from "../Package";
import { ElementEntry } from "./ElementEntry";
import { ConditionEntry } from "../Condition/ConditionEntry";

export abstract class ElementList<LE extends ListElement, Entry extends ElementEntry<LE>> extends Document<ElementListType> {
  abstract type: ElementListType;

  // entries: Entry[] = [];

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super(uri, document, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      if (isScalar<string>(pair.value) && isPair<Scalar<string>, Scalar<string>>(pair)) {
        this.addEntry(pair);
      } else {
        // TODO: Add diagnostic
      }
    });
  }

  /**
   * Add new entry onto the children list
   * @param pair YAML Pair
   */
  abstract addEntry(pair: Pair<Scalar<string>, Scalar<string>>): void;

  /**
   * Get entry from the children list
   * @param pair YAML Pair
   */
  abstract getEntry(cb?: (child: Entry) => boolean): Entry | undefined;

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    const key = this.getEntry(e => e.elementKey.value === yamlPath[1])?.elementKey;
    if (key) {
      result.push({
        uri: this.uri!,
        offset: key.offsetStart,
      });
    }
    return result;
  }

}
