import { Pair, Scalar, YAMLMap } from "yaml";

import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionListType } from "../../node";
import { ConditionEntry } from "./ConditionEntry";
import { ElementList, ElementListSection } from "../Element/ElementList";
import { TextDocument } from "vscode-languageserver-textdocument";

export class ConditionList extends ElementList<Condition> {
  type: ConditionListType = "ConditionList";

  addSection(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>, unknown>): void {
    this.entriesSections.push(new ConditionListSection(uri, document, yml, this));
  }

  getConditionEntries(id: string, packageUri?: string): ConditionEntry[] {
    if (!packageUri || this.parent.isPackageUri(packageUri)) {
      return this.entriesSections
        .flatMap(section => section.getConditionEntries(id));
    } else {
      return this.parent.getConditionEntries(id, packageUri);
    }
  }
}

export class ConditionListSection extends ElementListSection<Condition, ConditionEntry> {
  type: ConditionListType = "ConditionList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ConditionEntry {
    return new ConditionEntry(pair, this);
  }

  getConditionEntries(id: string, packageUri?: string): ConditionEntry[] {
    if (!packageUri || this.parent.parent.isPackageUri(packageUri)) {
      return this.entries
        .filter(entry => entry.elementKey.value === id);
    } else {
      return this.parent.getConditionEntries(id, packageUri);
    }
  }

}
