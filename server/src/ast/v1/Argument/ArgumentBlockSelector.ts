import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

// eslint-disable-next-line @typescript-eslint/naming-convention
import MATERIAL_LIST from "betonquest-utils/bukkit/Data/MaterialList";

import { ArgumentBlockSelectorType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ArgumentValue } from "./ArgumentValue";

export class ArgumentBlockSelector extends AbstractNodeV1<ArgumentBlockSelectorType> {
  readonly type: ArgumentBlockSelectorType = 'ArgumentBlockSelector';
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
    return ArgumentBlockSelector.getCompletions();
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
