import { Pair, Scalar, YAMLMap } from "yaml";

import { ConversationPlayerOptionType, ConversationPlayerOptionsType } from "../../../node";
import { Conversation } from "./../Conversation";
import { AbstractOptions } from "./AbstractOptions";
import { PlayerOption } from "./PlayerOption";

export class PlayerOptions extends AbstractOptions<ConversationPlayerOptionType> {
  type: ConversationPlayerOptionsType = 'ConversationPlayerOptions';

  constructor(yml: YAMLMap, parent: Conversation) {
    super(yml, parent);

    // TODO

    // ...
  }

  newAbstractOption(yml: Pair<Scalar<string>, YAMLMap>): PlayerOption {
    return new PlayerOption(yml, this);
  }
}
