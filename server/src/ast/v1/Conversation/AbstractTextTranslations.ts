import { Scalar, YAMLMap, isScalar } from "yaml";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationTypes, Node } from "../../node";
import { AbstractText } from "./AbstractText";
import { DiagnosticCode } from "../../../utils/diagnostics";

export abstract class AbstractTextTranslations<N extends ConversationTypes> implements Node<N> {
  abstract type: N;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: AbstractText<ConversationTypes, AbstractTextTranslations<N>>;
  diagnostics: Diagnostic[] = [];

  yml: YAMLMap<Scalar<string>>;

  constructor(uri: string, yml: YAMLMap<Scalar<string>>, parent: AbstractText<ConversationTypes, AbstractTextTranslations<N>>) {
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;

    // Check YAML type
    yml.items.forEach(pair => {
      if (!isScalar<string>(pair.value)) {
        // Throw incorrect value diagnostics
        const offsetStart = (pair.value as Scalar)?.range?.[0];
        const offsetEnd = (pair.value as Scalar)?.range?.[1];
        if (offsetStart && offsetEnd) {
          this.diagnostics.push({
            range: this.parent.parent!.getRangeByOffset(offsetStart, offsetEnd),
            message: `Incorrect value. It should be a string.`,
            severity: DiagnosticSeverity.Error,
            source: 'BetonQuest',
            code: DiagnosticCode.ValueTypeIncorrect
          });
        }
      }
    });
  }

  getDiagnostics() {
    return this.diagnostics;
  }
}
