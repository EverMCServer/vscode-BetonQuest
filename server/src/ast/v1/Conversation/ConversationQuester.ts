import { Scalar, YAMLMap } from "yaml";

import { ConversationQuesterType } from "../../node";
import { ConversationQuesterTranslations } from "./ConversationQuesterTranslations";
import { AbstractText } from "./AbstractText";
import { Conversation } from "./Conversation";

export class ConversationQuester extends AbstractText<ConversationQuesterType, ConversationQuesterTranslations> {
  readonly type: ConversationQuesterType = 'ConversationQuester';
  readonly parent: Conversation;

  constructor(yml: Scalar | YAMLMap, parent: Conversation) {
    super(yml, parent);
    this.parent = parent;
  }

  newTranslations(pair: YAMLMap<Scalar<string>>): ConversationQuesterTranslations {
    return new ConversationQuesterTranslations(pair, this);
  }
}
