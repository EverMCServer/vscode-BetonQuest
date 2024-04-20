import { ConversationTextTranslationsType } from "../../node";
import { AbstractTextTranslations } from "./AbstractTextTranslations";

export class ConversationTextTranslations extends AbstractTextTranslations<ConversationTextTranslationsType> {
  type: ConversationTextTranslationsType = 'ConversationTextTranslations';
}
