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

  private offsets: [offsetStart: number, stringStart: number, offsetEnd: number];

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, stringStart: number, offsetEnd: number],
    parent: ConditionArgumentMandatory | ConditionArgumentOptional,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[2];
    this.parent = parent;

    this.offsets = offsets;
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    if (this.offsets[0] < offset && offset <= this.offsets[1] || offset === this.offsets[2]) {
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
