import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import MATERIAL_LIST from "betonquest-utils/bukkit/Data/MaterialList";

import { ArgumentBlockIdType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentBlockID extends AbstractNodeV2<ArgumentBlockIdType> {
  readonly type: ArgumentBlockIdType = 'ArgumentBlockID';
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

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    return ArgumentBlockID.getCompletions();
  }

  static getCompletions(): CompletionItem[] {
    return MATERIAL_LIST.filter(e => e.isBlock()).map(e => ({
      label: e.getBukkitId(),
      kind: CompletionItemKind.EnumMember,
      detail: "Block ID",
      documentation: "Bukkit Block ID"
    }));
  }

}
