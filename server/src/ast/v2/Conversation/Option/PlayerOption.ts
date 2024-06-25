import { Pair, Scalar, YAMLMap, isScalar } from "yaml";

import { DiagnosticSeverity } from "vscode-languageserver";
import { SemanticTokenType } from "../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { HoverInfo } from "../../../../utils/hover";
import { isStringScalar } from "../../../../utils/yaml";
import { ConversationPlayerOptionType } from "../../../node";
import { AbstractNodeV2 } from "../../../v2";
import { ConversationSection } from "../Conversation";
import { Conditions } from "./Player/Conditions";
import { Events } from "./Player/Events";
import { Pointers } from "./Player/Pointers";
import { Text } from "./Player/Text";

export class PlayerOption extends AbstractNodeV2<ConversationPlayerOptionType> {
  readonly type: ConversationPlayerOptionType = "ConversationPlayerOption";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConversationSection;

  // Cache the parsed yaml document
  private yml: Pair<Scalar<string>, YAMLMap>;
  readonly id: string;
  readonly comment?: string;

  constructor(yml: Pair<Scalar<string>, YAMLMap>, parent: ConversationSection) {
    super();
    this.parent = parent;
    this.offsetStart = yml.key.range![0];
    this.offsetEnd = yml.value?.range![1] || yml.key.range![1];
    this.yml = yml;
    this.comment = yml.key.commentBefore?.split(/\n\n+/).slice(-1)[0] ?? undefined;

    // Parse ID
    this.id = this.yml.key.value;
    if (this.yml.key.range) {
      this.semanticTokens.push({
        offsetStart: this.yml.key.range[0],
        offsetEnd: this.yml.key.range[1],
        tokenType: SemanticTokenType.ConversationOptionPlayerID
      });
    }

    // Parse values
    this.yml.value?.items.forEach(pair => {
      if (isStringScalar(pair.key)) {
        switch (pair.key.value) {
          case "text":
            if (isStringScalar(pair.value) || pair.value instanceof YAMLMap) {
              this.addChild(new Text(pair.value, this));
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
              this.addChild(new Pointers(pair.value, this));
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
              this.addChild(new Conditions(pair.value, this));
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
              this.addChild(new Events(pair.value, this));
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

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = super.getHoverInfo(offset);
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return hoverInfo;
    }
    if (offset >= this.yml.key.range![0] && offset <= this.yml.key.range![1] && this.comment) {
      hoverInfo.push({
        content: this.comment,
        offset: [this.offsetStart, this.offsetEnd]
      });
    }
    return hoverInfo;
  }

}
