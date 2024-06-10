import { Scalar, YAMLMap } from "yaml";

import { ConversationOptionType, ConversationTextType } from "../../../node";
import { TextTranslations } from "./TextTranslations";
import { AbstractText } from "../AbstractText";
import { Option } from "./Option";

export class Text<OT extends ConversationOptionType> extends AbstractText<ConversationTextType, TextTranslations<OT>> {
  readonly type: ConversationTextType = 'ConversationText';
  readonly parent: Option<OT>;

  constructor(yml: Scalar | YAMLMap, parent: Option<OT>) {
    super(yml, parent);
    this.parent = parent;
  }

  newTranslations(pair: YAMLMap<Scalar<string>>): TextTranslations<OT> {
    return new TextTranslations(pair, this);
  }
}
