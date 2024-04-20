import { Scalar, YAMLMap } from "yaml";

import { ConversationQuesterType } from "../../node";
import { ConversationQuesterTranslations } from "./ConversationQuesterTranslations";
import { AbstractText } from "./AbstractText";

export class ConversationQuester extends AbstractText<ConversationQuesterType, ConversationQuesterTranslations> {
  type: ConversationQuesterType = 'ConversationQuester';

  newTranslations(uri: string, pair: YAMLMap<Scalar<string>, Scalar<string>>): ConversationQuesterTranslations {
    return new ConversationQuesterTranslations(uri, pair, this);
  }
}
