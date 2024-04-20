import { ConversationQuesterTranslationsType } from "../../node";
import { AbstractTextTranslations } from "./AbstractTextTranslations";

export class ConversationQuesterTranslations extends AbstractTextTranslations<ConversationQuesterTranslationsType> {
  type: ConversationQuesterTranslationsType = 'ConversationQuesterTranslations';
}
