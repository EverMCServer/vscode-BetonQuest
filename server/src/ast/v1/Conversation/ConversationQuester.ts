import { Pair, Scalar, YAMLMap, isMap, isScalar } from "yaml";

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

  private yml: Pair<Scalar<string>, Scalar<string> | YAMLMap>;
  private contentType?: 'string' | 'translations';
  private contentString?: string;
  private contentTranslations?: ConversationQuesterTranslations; // TODO

  constructor(yml: Pair<Scalar<string>, Scalar<string> | YAMLMap>, offset: [offsetStart: number, offsetEnd: number], parent: Conversation) {
    super();
    this.offsetStart = offset[0];
    this.offsetEnd = offset[1];
    this.parent = parent;

    this.yml = yml;

    // Parse YAML
    if (isScalar(yml.value) && typeof yml.value.value === 'string') {
      this.contentType = 'string';
      this.contentString = yml.value.value;

      // Add Semantic Tokens
      this.semanticTokens.push({
        offsetStart: yml.value.range![0],
        offsetEnd: yml.value.range![1],
        tokenType: SemanticTokenType.String
      });
    } else if (isMap<Scalar<string>>(yml.value)) {
      this.contentType = 'translations';
      this.contentTranslations = new ConversationQuesterTranslations(yml.value, this); // TODO: replace
    }

  }

}
