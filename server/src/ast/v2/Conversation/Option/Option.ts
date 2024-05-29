import { Pair, Scalar, YAMLMap, isScalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationOptionType, NodeV2 } from "../../../node";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { HoverInfo } from "../../../../utils/hover";
import { LocationLinkOffset } from "../../../../utils/location";
import { isStringScalar } from "../../../../utils/yaml";
import { Text } from "./Text";
import { ConversationSection } from "../Conversation";
import { Conditions } from "./Conditions";
import { Events } from "./Events";
import { Pointers } from "./Pointers";

export class Option<T extends ConversationOptionType> extends NodeV2<T> {
  type: T;
  uri: string;
  offsetStart: number;
  offsetEnd: number;
  parent: ConversationSection;

  // Cache the parsed yaml document
  yml: Pair<Scalar<string>, YAMLMap>;
  id: string;
  text?: Text;
  conditions?: Conditions<this>;
  events?: Events<this>;
  pointers?: Pointers<T>;

  semanticTokens: SemanticToken[] = [];

  constructor(type: T, yml: Pair<Scalar<string>, YAMLMap>, parent: ConversationSection) {
    super();
    this.type = type;
    this.uri = parent.uri;
    this.offsetStart = yml.key.range![0];
    this.offsetEnd = yml.value?.range![1] || yml.key.range![1];
    this.parent = parent;
    this.yml = yml;

    // Parse ID
    this.id = this.yml.key.value;
    if (this.yml.key.range) {
      this.semanticTokens.push({
        offsetStart: this.yml.key.range[0],
        offsetEnd: this.yml.key.range[1],
        tokenType: this.type === "ConversationNpcOption" ? SemanticTokenType.ConversationOptionNpcID : SemanticTokenType.ConversationOptionPlayerID
      });
    }

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
            this.addDiagnostic(
              [pair.key.range![0], pair.key.range![1]],
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
            if (isScalar<string>(pair.value) && typeof pair.value.value === 'string') {
              this.pointers = new Pointers(pair.value, this);
            } else {
              // TODO
            }
            break;
          case "condition":
            // Throw warning diagnostics, change to "*s"
            this.addDiagnostic(
              [pair.key.range![0], pair.key.range![1]],
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
            if (isScalar<string>(pair.value) && typeof pair.value.value === 'string') {
              this.conditions = new Conditions(pair.value, this);
            } else {
              // TODO
            }
            break;
          case "event":
            // Throw warning diagnostics, change to "*s"
            this.addDiagnostic(
              [pair.key.range![0], pair.key.range![1]],
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
            if (isScalar<string>(pair.value) && typeof pair.value.value === 'string') {
              this.events = new Events(pair.value, this);
            } else {
              // TODO
            }
            break;
          default:
            this.addDiagnostic(
              [pair.key.range![0], pair.key.range![1]],
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
      ...this.events?.getDiagnostics() ?? [],
      ...this.pointers?.getDiagnostics() ?? [],
    ];
  }

  getCodeActions(): CodeAction[] {
    return [
      ...this.codeActions,
      ...this.conditions?.getCodeActions() ?? [],
      ...this.events?.getCodeActions() ?? [],
      ...this.pointers?.getCodeActions() ?? [],
    ];
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = this.semanticTokens;
    semanticTokens.push(...this.conditions?.getSemanticTokens() || []);
    semanticTokens.push(...this.events?.getSemanticTokens() || []);
    semanticTokens.push(...this.pointers?.getSemanticTokens() || []);
    return semanticTokens;
  };

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return hoverInfo;
    }
    hoverInfo.push(...this.conditions?.getHoverInfo(offset) || []);
    hoverInfo.push(...this.events?.getHoverInfo(offset) || []);
    hoverInfo.push(...this.pointers?.getHoverInfo(offset) || []);
    return hoverInfo;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }

    return [
      ...this.conditions?.getDefinitions(offset) || [],
      ...this.events?.getDefinitions(offset) || [],
      ...this.pointers?.getDefinitions(offset) || [],
    ];
  }
}
