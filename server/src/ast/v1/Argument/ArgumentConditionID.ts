import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentConditionIdType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ConditionKey } from "../Condition/ConditionKey";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentConditionID extends AbstractNodeV1<ArgumentConditionIdType> {
  readonly type: ArgumentConditionIdType = 'ArgumentConditionID';
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

  private getConditionIDs() {
    return (this.getAllConditionEntries()
      .map(e => e.getChild<ConditionKey>("ConditionKey"))
      .filter(e => e !== undefined) as ConditionKey[])
      .map<[string, string]>(e => [
        e.value,
        e.getPackagePath().join("-")
      ]);
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // return ArgumentConditionID.getCompletions();
    const packagePath = this.getPackagePath().join("-");
    return this.getConditionIDs().map(e => ({
      label: e[0],
      kind: CompletionItemKind.EnumMember,
      detail: e[0],
      documentation: "Package: " + e[1], // Package path
      insertText: (packagePath === e[1] ? "" : e[1] + ".") + e[0]
    }));
  }

}
