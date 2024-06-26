import { YAMLMap, Scalar } from "yaml";
import { ConversationTextTranslationsType } from "../../../../node";
import { Text } from "./Text";
import { AbstractNodeV2 } from "../../../../v2";

export class TextTranslations extends AbstractNodeV2<ConversationTextTranslationsType> {
  readonly type: ConversationTextTranslationsType = 'ConversationTextTranslations';
  readonly parent: Text;

  constructor(yml: YAMLMap<Scalar<string>>, parent: Text) {
    super();
    this.parent = parent;
  }
}
