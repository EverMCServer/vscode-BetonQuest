import { Scalar, YAMLMap, isMap, isScalar } from "yaml";

import { ConversationOptionType, ConversationTypes, NodeV1 } from "../../node";
import { Conversation } from "./Conversation";
import { AbstractTextTranslations } from "./AbstractTextTranslations";
import { AbstractOption } from "./Option/AbstractOption";

export abstract class AbstractText<NT extends ConversationTypes, TT extends AbstractTextTranslations<ConversationTypes>> extends NodeV1<NT> {
  abstract type: NT;
  uri: string;
  parent: Conversation | AbstractOption<ConversationOptionType>;

  yml: Scalar | YAMLMap;
  contentType?: 'string' | 'translations';
  contentString?: string;
  contentTranslations?: TT;

  constructor(yml: Scalar | YAMLMap, parent: Conversation | AbstractOption<ConversationOptionType>) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];

    // Parse YAML
    if (isScalar(yml) && typeof yml.value === 'string') {
      this.contentType = 'string';
      this.contentString = yml.value;
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

  abstract newTranslations(pair: YAMLMap<Scalar<string>>): TT;
}
