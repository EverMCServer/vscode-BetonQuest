import { Scalar, YAMLMap, isMap, isScalar } from "yaml";

import { SemanticTokenType } from "../../../service/semanticTokens";
import { ConversationQuesterType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConversationSection } from "./Conversation";
import { ConversationQuesterTranslations } from "./ConversationQuesterTranslations";

export class ConversationQuester extends AbstractNodeV2<ConversationQuesterType> {
  readonly type: ConversationQuesterType = 'ConversationQuester';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConversationSection;

  private yml: Scalar | YAMLMap;
  private contentType?: 'string' | 'translations';
  private contentString?: string;
  private contentTranslations?: ConversationQuesterTranslations; // TODO

  constructor(yml: Scalar | YAMLMap, parent: ConversationSection) {
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
