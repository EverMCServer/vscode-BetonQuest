import { Scalar, YAMLMap, isMap, isScalar } from "yaml";

import { ConversationTextType } from "../../../../node";
import { TextTranslations } from "./TextTranslations";
import { NpcOption } from "../NpcOption";
import { SemanticTokenType } from "../../../../../service/semanticTokens";
import { AbstractNodeV1 } from "../../../../v1";

export class Text extends AbstractNodeV1<ConversationTextType> {
  readonly type: ConversationTextType = 'ConversationText';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: NpcOption;

  private yml: Scalar | YAMLMap;
  private contentType?: 'string' | 'translations';
  private contentString?: string;
  private contentTranslations?: TextTranslations; // TODO

  constructor(yml: Scalar | YAMLMap, parent: NpcOption) {
    super();
    this.yml = yml;
    this.parent = parent;
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
      this.contentTranslations = new TextTranslations(yml, this);
    }
  }
}
