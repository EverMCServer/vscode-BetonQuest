import { CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import ENTITY_TYPE_LIST from "betonquest-utils/bukkit/Data/EntityTypeList";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { ArgumentEntityType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentEntity extends AbstractNodeV1<ArgumentEntityType> {
  readonly type: ArgumentEntityType = 'ArgumentEntity';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentValue;

  private argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    if (offset === this.offsetEnd) {
      return ArgumentEntity.getCompletions();
    }
    return [];
  }

  static getCompletions(): CompletionItem[] {
    return ENTITY_TYPE_LIST.map(e => ({
      label: e.getBukkitId(),
      kind: CompletionItemKind.EnumMember,
      detail: "Entity ID",
      documentation: "Bukkit Entity ID"
    }));
  }

  getDiagnostics(): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    // if (!ENTITY_TYPE_LIST.some(e => e.isIdMatched(this.argumentStr))) {
    if (!this.argumentStr.trim()) {
      diagnostics.push(this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        "Missing Entity ID",
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentValueMissing
      ));
    }
    return diagnostics;
  }

}
