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

  private range: [offsetStart: number, stringStart: number, offsetEnd: number];

  constructor(
    argumentStr: string,
    range: [offsetStart: number, stringStart: number, offsetEnd: number],
    parent: ConditionArgumentMandatory | ConditionArgumentOptional,
  ) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[2];
    this.parent = parent;

    this.range = range;
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    if (this.range[0] < offset && offset <= this.range[1] || offset === this.range[2]) {
      return ENTITY_TYPE_LIST.map(e => ({
        label: e.getBukkitId(),
        kind: CompletionItemKind.EnumMember,
        detail: "Entity ID",
        documentation: "Bukkit Entity ID"
      }));
    }
    return [];
  }

}
