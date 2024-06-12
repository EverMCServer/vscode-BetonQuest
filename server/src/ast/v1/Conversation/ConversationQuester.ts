import { Scalar, YAMLMap, isMap, isScalar } from "yaml";

import { ConversationQuesterType } from "../../node";
import { ConversationQuesterTranslations } from "./ConversationQuesterTranslations";
import { Conversation } from "./Conversation";
import { AbstractNodeV1 } from "../../v1";
import { SemanticTokenType } from "../../../service/semanticTokens";

export class ConversationQuester extends AbstractNodeV1<ConversationQuesterType> {
  readonly type: ConversationQuesterType = 'ConversationQuester';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: Conversation;

  private yml: Scalar | YAMLMap;
  private contentType?: 'string' | 'translations';
  private contentString?: string;
  private contentTranslations?: ConversationQuesterTranslations; // TODO

  constructor(yml: Scalar | YAMLMap, parent: Conversation) {
    super();
    this.parent = parent;

    this.yml = yml;
    this.offsetStart = this.yml.range![0];
    this.offsetEnd = this.yml.range![1];

    // Parse YAML
    if (isScalar(yml) && typeof yml.value === 'string') {
      this.contentType = 'string';
      this.contentString = yml.value;

      // Add Semantic Tokens
      this.semanticTokens.push({
        offsetStart: this.offsetStart,
        offsetEnd: this.offsetEnd,
        tokenType: SemanticTokenType.String
      });
    } else if (isMap<Scalar<string>>(yml)) {
      this.contentType = 'translations';
      this.contentTranslations = new ConversationQuesterTranslations(yml, this); // TODO: replace
    }

  }

}
