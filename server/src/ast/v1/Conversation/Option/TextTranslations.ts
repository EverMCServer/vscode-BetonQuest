import { ConversationTextTranslationsType } from "../../../node";
import { AbstractTextTranslations } from "../AbstractTextTranslations";

export class TextTranslations extends AbstractTextTranslations<ConversationTextTranslationsType> {
  type: ConversationTextTranslationsType = 'ConversationTextTranslations';
}
