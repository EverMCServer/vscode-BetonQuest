import { CompletionItem, CompletionItemKind } from "vscode-languageserver";

import ENTITY_TYPE_LIST from "betonquest-utils/bukkit/Data/EntityTypeList";

import { ArgumentEntityType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";

export class ArgumentEntity extends AbstractNodeV2<ArgumentEntityType> {
  readonly type: ArgumentEntityType = 'ArgumentEntity';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArgumentMandatory | ConditionArgumentOptional;

  constructor(
    argumentStr: string,
    range: [number?, number?],
    parent: ConditionArgumentMandatory | ConditionArgumentOptional,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    return ENTITY_TYPE_LIST.map(e => ({
      label: e.getBukkitId(),
      kind: CompletionItemKind.EnumMember,
      detail: "Entity ID",
      documentation: "Bukkit Entity ID"
    }));
  }

}
