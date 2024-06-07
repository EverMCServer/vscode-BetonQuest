import { YAMLMap, Scalar } from "yaml";
import { ConversationQuesterTranslationsType } from "../../node";
import { AbstractTextTranslations } from "./AbstractTextTranslations";
import { ConversationQuester } from "./ConversationQuester";

export class ConversationQuesterTranslations extends AbstractTextTranslations<ConversationQuesterTranslationsType> {
  readonly type: ConversationQuesterTranslationsType = 'ConversationQuesterTranslations';
  readonly parent: ConversationQuester;

  constructor(yml: YAMLMap<Scalar<string>>, parent: ConversationQuester) {
    super(yml, parent);
    this.parent = parent;
  }
}
