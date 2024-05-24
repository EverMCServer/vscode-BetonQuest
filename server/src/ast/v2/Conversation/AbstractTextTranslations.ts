import { Scalar, YAMLMap, isScalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationTypes, NodeV2 } from "../../node";
import { AbstractText } from "./AbstractText";
import { DiagnosticCode } from "../../../utils/diagnostics";

export abstract class AbstractTextTranslations<N extends ConversationTypes> extends NodeV2<N> {
  abstract type: N;
  uri: string;
  parent: AbstractText<ConversationTypes, AbstractTextTranslations<N>>;

  yml: YAMLMap<Scalar<string>>;

  contentStrings: [lang: string, text: Scalar<string>][] = [];

  constructor(yml: YAMLMap<Scalar<string>>, parent: AbstractText<ConversationTypes, AbstractTextTranslations<N>>) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];

    // Check YAML type
    yml.items.forEach(pair => {
      if (isScalar<string>(pair.value)) {
        this.contentStrings.push([pair.key.value, pair.value]);
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
