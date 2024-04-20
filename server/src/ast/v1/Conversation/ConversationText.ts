import { Scalar, YAMLMap } from "yaml";

import { ConversationTextType } from "../../node";
import { ConversationTextTranslations } from "./ConversationTranslations";
import { AbstractText } from "./AbstractText";

export class ConversationText extends AbstractText<ConversationTextType, ConversationTextTranslations> {
  type: ConversationTextType = 'ConversationText';

  newTranslations(uri: string, pair: YAMLMap<Scalar<string>, Scalar<string>>): ConversationTextTranslations {
      return new ConversationTextTranslations(uri, pair, this);
  }
}
