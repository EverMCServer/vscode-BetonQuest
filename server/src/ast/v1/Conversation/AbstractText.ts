import { Scalar, YAMLMap, isMap, isScalar } from "yaml";

import { ConversationOptionType, ConversationTypes } from "../../node";
import { Conversation } from "./Conversation";
import { AbstractTextTranslations } from "./AbstractTextTranslations";
import { Option } from "./Option/Option";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { AbstractNodeV1 } from "../../v1";

export abstract class AbstractText<NT extends ConversationTypes, TT extends AbstractTextTranslations<ConversationTypes>> extends AbstractNodeV1<NT> {
  abstract type: NT;
  uri: string;
  protected offsetStart: number;
  protected offsetEnd: number;
  parent: Conversation | Option<ConversationOptionType>;

  semanticTokens: SemanticToken[] = [];

  yml: Scalar | YAMLMap;
  contentType?: 'string' | 'translations';
  contentString?: string;
  contentTranslations?: TT;

  constructor(yml: Scalar | YAMLMap, parent: Conversation | Option<ConversationOptionType>) {
    super();
    this.uri = parent.uri;
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
      this.contentTranslations = this.newTranslations(yml);
    }

  }

  getDiagnostics() {
    return [
      ...this.diagnostics,
      ...this.contentTranslations?.getDiagnostics() ?? []
    ];
  }

  getSemanticTokens() {
    return [...this.semanticTokens, ...this.contentTranslations?.getSemanticTokens() || []];
  }

  abstract newTranslations(pair: YAMLMap<Scalar<string>>): TT;
}
