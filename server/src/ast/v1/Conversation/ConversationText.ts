import { Scalar, YAMLMap } from "yaml";

import { ConversationTextType } from "../../node";
import { ConversationTextTranslations } from "./ConversationTranslations";
import { AbstractText } from "./AbstractText";

export class ConversationText extends AbstractText<ConversationTextType, ConversationTextTranslations> {
  type: ConversationTextType = 'ConversationText';

  newTranslations(pair: YAMLMap<Scalar<string>>): ConversationTextTranslations {
    return new ConversationTextTranslations(pair, this);
  }
}
