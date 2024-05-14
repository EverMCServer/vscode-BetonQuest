import { Pair, Scalar, YAMLMap } from "yaml";

import { ConversationNpcOptionType } from "../../../node";
import { AbstractOption } from "./AbstractOption";
import { Conversation } from "../Conversation";

export class NpcOption extends AbstractOption<ConversationNpcOptionType> {
  type: ConversationNpcOptionType = 'ConversationNpcOption';

  constructor(yml: Pair<Scalar<string>, YAMLMap>, parent: Conversation) {
    super(yml, parent);
  }
}
