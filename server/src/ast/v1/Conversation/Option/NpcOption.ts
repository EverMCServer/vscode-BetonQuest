import { Pair, Scalar, YAMLMap } from "yaml";

import { ConversationNpcOptionType } from "../../../node";
import { AbstractOption } from "./AbstractOption";
import { NpcOptions } from "./NpcOptions";

export class NpcOption extends AbstractOption<ConversationNpcOptionType> {
  type: ConversationNpcOptionType = 'ConversationNpcOption';

  constructor(yml: Pair<Scalar<string>, YAMLMap>, parent: NpcOptions) {
    super(yml, parent);
  }
}
