import { YAMLMap, Scalar } from "yaml";
import { ConversationOptionType, ConversationTextTranslationsType } from "../../../node";
import { AbstractTextTranslations } from "../AbstractTextTranslations";
import { Text } from "./Text";

export class TextTranslations<OT extends ConversationOptionType> extends AbstractTextTranslations<ConversationTextTranslationsType> {
  readonly type: ConversationTextTranslationsType = 'ConversationTextTranslations';
  readonly parent: Text<OT>;

  constructor(yml: YAMLMap<Scalar<string>>, parent: Text<OT>) {
    super(yml, parent);
    this.parent = parent;
  }
}
