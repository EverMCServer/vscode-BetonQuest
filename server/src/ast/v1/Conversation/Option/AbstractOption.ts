import { Pair, Scalar, YAMLMap } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationOptionType, Node } from "../../../node";
import { AbstractOptions } from "./AbstractOptions";
import { isStringScalar } from "../../../../utils/yaml";
import { Text } from "./Text";
import { DiagnosticCode } from "../../../../utils/diagnostics";

export abstract class AbstractOption<T extends ConversationOptionType> extends Node<T> {
  abstract type: T;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: AbstractOptions<T>;

  // Cache the parsed yaml document
  yml: Pair<Scalar<string>, YAMLMap>;
  text?: Text;

  constructor(yml: Pair<Scalar<string>, YAMLMap>, parent: AbstractOptions<T>) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;

    this.yml.value?.items.forEach(pair => {
      if (isStringScalar(pair.key)) {
        switch (pair.key.value) {
          case "text":
            if (isStringScalar(pair.value) || pair.value instanceof YAMLMap) {
              this.text = new Text(pair.value, this);
            }
            break;
          case "pointer":
            // Throw warning diagnostics, change to "*s"
            this._addDiagnostic(
              this.getRangeByOffset(pair.key.range![0], pair.key.range![1]),
              `It should be renamed to "${pair.key.value}s"`,
              DiagnosticSeverity.Warning,
              DiagnosticCode.YamlKeyAlternativeNaming,
              [
                {
                  title: `Rename to "${pair.key.value}s"`,
                  text: `${pair.key.value}s`
                }
              ]
            );
          case "pointers":
            break;
          case "condition":
            // Throw warning diagnostics, change to "*s"
            this._addDiagnostic(
              this.getRangeByOffset(pair.key.range![0], pair.key.range![1]),
              `It should be renamed to "${pair.key.value}s"`,
              DiagnosticSeverity.Warning,
              DiagnosticCode.YamlKeyAlternativeNaming,
              [
                {
                  title: `Rename to "${pair.key.value}s"`,
                  text: `${pair.key.value}s`
                }
              ]
            );
          case "conditions":
            break;
          case "event":
            // Throw warning diagnostics, change to "*s"
            this._addDiagnostic(
              this.getRangeByOffset(pair.key.range![0], pair.key.range![1]),
              `It should be renamed to "${pair.key.value}s"`,
              DiagnosticSeverity.Warning,
              DiagnosticCode.YamlKeyAlternativeNaming,
              [
                {
                  title: `Rename to "${pair.key.value}s"`,
                  text: `${pair.key.value}s`
                }
              ]
            );
          case "events":
            break;
          default:
            this._addDiagnostic(
              this.getRangeByOffset(pair.key.range![0], pair.key.range![1]),
              `Unknown key "${pair.key.value}"`,
              DiagnosticSeverity.Warning,
              DiagnosticCode.YamlKeyUnknown
            );
            break;
        }
      }

      // TODO: throw diagnostics: incorrect yaml value
    });
    // TODO

    // ...
  }

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return this.parent.parent.getRangeByOffset(offsetStart, offsetEnd);
  }
}
