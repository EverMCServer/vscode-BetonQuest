import { Scalar, YAMLMap, isScalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationTypes } from "../../node";
import { AbstractText } from "./AbstractText";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { SemanticTokenType } from "../../../service/semanticTokens";
import { AbstractNodeV1 } from "../../v1";

export abstract class AbstractTextTranslations<N extends ConversationTypes> extends AbstractNodeV1<N> {
  abstract readonly type: N;
  readonly uri: string;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;

  private yml: YAMLMap<Scalar<string>>;

  contentStrings: [lang: string, text: Scalar<string>][] = [];

  constructor(yml: YAMLMap<Scalar<string>>, parent: AbstractText<ConversationTypes, AbstractTextTranslations<N>>) {
    super();
    this.uri = parent.uri;
    this.yml = yml;
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];

    // Check YAML type
    yml.items.forEach(pair => {
      if (isScalar<string>(pair.value)) {
        this.contentStrings.push([pair.key.value, pair.value]);

        // Add Semantic Tokens
        this.semanticTokens.push({
          offsetStart: pair.value.range![0],
          offsetEnd: pair.value.range![1],
          tokenType: SemanticTokenType.String
        });
      } else {
        // Throw incorrect value diagnostics
        const offsetStart = (pair.value as Scalar)?.range?.[0];
        const offsetEnd = (pair.value as Scalar)?.range?.[1];
        if (offsetStart && offsetEnd) {
          this.addDiagnostic(
            [offsetStart, offsetEnd],
            `Incorrect value. It should be a string.`,
            DiagnosticSeverity.Error,
            DiagnosticCode.ValueTypeIncorrect
          );
        }
      }
    });
  }

}
