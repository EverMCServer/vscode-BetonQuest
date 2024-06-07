import { Pair, Scalar, YAMLMap } from "yaml";

import { ConversationNpcOptionType } from "../../../node";
import { Conversation } from "../Conversation";
import { Option } from "./Option";

export class NpcOption extends Option<"ConversationNpcOption"> {
  readonly type: ConversationNpcOptionType = "ConversationNpcOption";
  readonly parent: Conversation;

  constructor(yml: Pair<Scalar<string>, YAMLMap>, parent: Conversation) {
    super("ConversationNpcOption", yml, parent);
    this.parent = parent;
  }

}
