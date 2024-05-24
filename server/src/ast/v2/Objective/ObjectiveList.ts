import { Pair, Scalar, YAMLMap } from "yaml";

import Objective from "betonquest-utils/betonquest/Objective";

import { ObjectiveListType } from "../../node";
import { ObjectiveEntry } from "./ObjectiveEntry";
import { ElementList, ElementListSection } from "../Element/ElementList";
import { TextDocument } from "vscode-languageserver-textdocument";

export class ObjectiveList extends ElementList<Objective> {
  type: ObjectiveListType = "ObjectiveList";

  addSection(uri: string, document: TextDocument, yml: YAMLMap<Scalar<string>, unknown>): void {
    this.entriesSections.push(new ObjectiveListSection(uri, document, yml, this));
  }

  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] {
    return this.entriesSections.flatMap(section => section.getObjectiveEntries(id, packageUri));
  }
}

export class ObjectiveListSection extends ElementListSection<Objective> {
  type: ObjectiveListType = "ObjectiveList";

  newEntry(pair: Pair<Scalar<string>, Scalar<string>>): ObjectiveEntry {
    return new ObjectiveEntry(pair, this);
  }

}
