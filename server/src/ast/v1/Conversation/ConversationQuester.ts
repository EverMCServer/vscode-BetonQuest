import { Scalar, YAMLMap } from "yaml";

import { ConversationQuesterType } from "../../node";
import { ConversationQuesterTranslations } from "./ConversationQuesterTranslations";
import { AbstractText } from "./AbstractText";

export class ConversationQuester extends AbstractText<ConversationQuesterType, ConversationQuesterTranslations> {
  readonly type: ConversationQuesterType = 'ConversationQuester';

  newTranslations(pair: YAMLMap<Scalar<string>>): ConversationQuesterTranslations {
    return new ConversationQuesterTranslations(pair, this);
  }
}
