import { YAMLMap, Scalar } from "yaml";
import { ConversationTextTranslationsType } from "../../../node";
import { AbstractTextTranslations } from "../AbstractTextTranslations";
import { Text } from "./Text";

export class TextTranslations extends AbstractTextTranslations<ConversationTextTranslationsType> {
  readonly type: ConversationTextTranslationsType = 'ConversationTextTranslations';
  readonly parent: Text;

  constructor(yml: YAMLMap<Scalar<string>>, parent: Text) {
    super(yml, parent);
    this.parent = parent;
  }
}
