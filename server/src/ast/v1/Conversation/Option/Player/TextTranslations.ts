import { YAMLMap, Scalar } from "yaml";
import { ConversationTextTranslationsType } from "../../../../node";
import { Text } from "./Text";
import { AbstractNodeV1 } from "../../../../v1";

export class TextTranslations extends AbstractNodeV1<ConversationTextTranslationsType> {
  readonly type: ConversationTextTranslationsType = 'ConversationTextTranslations';
  readonly parent: Text;

  constructor(yml: YAMLMap<Scalar<string>>, parent: Text) {
    super();
    this.parent = parent;
  }
}
