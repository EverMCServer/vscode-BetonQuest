import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import { ArgumentEventIdType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { EventKey } from "../Event/EventKey";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentEventID extends AbstractNodeV1<ArgumentEventIdType> {
  readonly type: ArgumentEventIdType = 'ArgumentEventID';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ArgumentValue;

  constructor(
    argumentStr: string,
    range: [number?, number?],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;
  }

  private getEventIDs() {
    return (this.getAllEventEntries()
      .map(e => e.getChild<EventKey>("EventKey"))
      .filter(e => e !== undefined) as EventKey[])
      .map<[string, string]>(e => [
        e.value,
        e.getPackagePath().join("-")
      ]);
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    // return ArgumentConditionID.getCompletions();
    const packagePath = this.getPackagePath().join("-");
    return this.getEventIDs().map(e => ({
      label: e[0],
      kind: CompletionItemKind.EnumMember,
      detail: e[0],
      documentation: "Package: " + e[1], // Package path
      insertText: (packagePath === e[1] ? "" : e[1] + ".") + e[0]
    }));
  }

}
