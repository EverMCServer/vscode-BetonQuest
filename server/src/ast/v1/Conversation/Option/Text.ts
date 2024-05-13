import { Scalar, YAMLMap } from "yaml";

import { ConversationTextType } from "../../../node";
import { TextTranslations } from "./TextTranslations";
import { AbstractText } from "../AbstractText";

export class Text extends AbstractText<ConversationTextType, TextTranslations> {
  type: ConversationTextType = 'ConversationText';

  newTranslations(pair: YAMLMap<Scalar<string>>): TextTranslations {
    return new TextTranslations(pair, this);
  }
}
