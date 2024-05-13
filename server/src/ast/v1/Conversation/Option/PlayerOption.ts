import { Pair, Scalar, YAMLMap } from "yaml";

import { ConversationPlayerOptionType } from "../../../node";
import { AbstractOption } from "./AbstractOption";
import { PlayerOptions } from "./PlayerOptions";

export class PlayerOption extends AbstractOption<ConversationPlayerOptionType> {
  type: ConversationPlayerOptionType = 'ConversationPlayerOption';

  constructor(yml: Pair<Scalar<string>, YAMLMap>, parent: PlayerOptions) {
    super(yml, parent);
  }
}
