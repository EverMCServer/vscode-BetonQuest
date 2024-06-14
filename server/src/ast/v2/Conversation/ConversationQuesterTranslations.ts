import { YAMLMap, Scalar, isScalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationQuesterTranslationsType } from "../../node";
import { ConversationQuester } from "./ConversationQuester";
import { AbstractNodeV1 } from "../../v1";
import { SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";

export class ConversationQuesterTranslations extends AbstractNodeV1<ConversationQuesterTranslationsType> {
  readonly type: ConversationQuesterTranslationsType = 'ConversationQuesterTranslations';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConversationQuester;

  private yml: YAMLMap<Scalar<string>>;
  contentStrings: [lang: string, text: Scalar<string>][] = [];

  constructor(yml: YAMLMap<Scalar<string>>, parent: ConversationQuester) {
    super();
    this.parent = parent;

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
