import { Pair, Scalar, YAMLMap } from "yaml";

import { ConversationNpcOptionType, ConversationNpcOptionsType } from "../../../node";
import { Conversation } from "./../Conversation";
import { AbstractOptions } from "./AbstractOptions";
import { NpcOption } from "./NpcOption";

export class NpcOptions extends AbstractOptions<ConversationNpcOptionType> {
  type: ConversationNpcOptionsType = 'ConversationNpcOptions';

  constructor(yml: YAMLMap, parent: Conversation) {
    super(yml, parent);
  }

  newAbstractOption(yml: Pair<Scalar<string>, YAMLMap>): NpcOption {
    return new NpcOption(yml, this);
  }
}
