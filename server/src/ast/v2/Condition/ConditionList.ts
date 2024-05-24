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

  getConditionEntries(id: string, packageUri: string): ConditionEntry[] {
    return this.entriesSections.flatMap(section => section.getConditionEntries(id, packageUri));
  }
}

export class ConditionListSection extends ElementListSection<Condition> {
  type: ConditionListType = "ConditionList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ConditionEntry {
    return new ConditionEntry(pair, this);
  }

}
