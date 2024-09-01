import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentObjectiveIdType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ObjectiveKey } from "../Objective/ObjectiveKey";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentObjectiveID extends AbstractNodeV2<ArgumentObjectiveIdType> {
  readonly type: ArgumentObjectiveIdType = 'ArgumentObjectiveID';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentValue;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;
  }

  private getObjectiveIDs() {
    return (this.getAllObjectiveEntries()
      .map(e => e.getChild<ObjectiveKey>("ObjectiveKey"))
      .filter(e => e !== undefined) as ObjectiveKey[])
      .map<[string, string]>(e => [
        e.value,
        e.getPackagePath().join("-")
      ]);
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // return ArgumentConditionID.getCompletions();
    const packagePath = this.getPackagePath().join("-");
    return this.getObjectiveIDs().map(e => ({
      label: e[0],
      kind: CompletionItemKind.EnumMember,
      detail: e[0],
      documentation: "Package: " + e[1], // Package path
      insertText: (packagePath === e[1] ? "" : e[1] + ".") + e[0]
    }));
  }

}
