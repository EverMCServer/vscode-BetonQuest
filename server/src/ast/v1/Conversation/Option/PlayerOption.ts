import { Pair, Scalar, YAMLMap } from "yaml";

import { ConversationPlayerOptionType } from "../../../node";
import { Conversation } from "../Conversation";
import { Option } from "./Option";

export class PlayerOption extends Option<"ConversationPlayerOption"> {
  readonly type: ConversationPlayerOptionType = "ConversationPlayerOption";
  readonly parent: Conversation;

  constructor(yml: Pair<Scalar<string>, YAMLMap>, parent: Conversation) {
    super("ConversationPlayerOption", yml, parent);
    this.parent = parent;
  }

}
