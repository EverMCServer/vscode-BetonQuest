import { Pair, Scalar, YAMLMap, isScalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationOptionType, NodeV1 } from "../../../node";
import { isStringScalar } from "../../../../utils/yaml";
import { Text } from "./Text";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { Conversation } from "../Conversation";
import { Conditions } from "./Conditions";

export class Option<T extends ConversationOptionType> extends NodeV1<T> {
  type: T;
  uri: string;
  offsetStart?: number; // TODO
  offsetEnd?: number; // TODO
  parent: Conversation;

  // Cache the parsed yaml document
  yml: Pair<Scalar<string>, YAMLMap>;
  text?: Text;
  conditions?: Conditions<this>; // TODO

  constructor(type: T, yml: Pair<Scalar<string>, YAMLMap>, parent: Conversation) {
    super();
    this.type = type;
    this.uri = parent.uri;
    this.offsetStart = yml.key.range![0];
    this.offsetEnd = yml.value?.range![1];
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
            // TODO

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
            // TODO
            if (isScalar<string>(pair.value) && typeof pair.value.value === 'string') {
              this.conditions = new Conditions(pair.value, this);
            } else {
              // TODO
            }
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
            // TODO
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

  getDiagnostics(): Diagnostic[] {
    return [
      ...this.diagnostics,
      ...this.conditions?.getDiagnostics() ?? [],
    ];
  }

  getCodeActions(): CodeAction[] {
    return [
      ...this.codeActions,
      ...this.conditions?.getCodeActions() ?? [],
    ];
  }
}
