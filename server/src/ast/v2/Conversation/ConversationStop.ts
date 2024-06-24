import { DiagnosticSeverity } from "vscode-languageserver";
import { Scalar } from "yaml";

import { SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { ConversationStopType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConversationSection } from "./Conversation";

export class ConversationStop extends AbstractNodeV2<ConversationStopType> {
  readonly type: ConversationStopType = 'ConversationStop';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConversationSection;

  // Cache the parsed yaml document
  private yml: Scalar;
  private value?: boolean;

  constructor(yml: Scalar, parent: ConversationSection) {
    super();
    this.parent = parent;
    this.yml = yml;

    this.offsetStart = yml.range?.[0];
    this.offsetEnd = yml.range?.[1];

    // Check YAML value type
    if (typeof this.yml.value === 'string') {
      // Parse string
      switch (this.yml.value.trim().toLowerCase()) {
        case 'true':
          this.value = true;
          break;
        case 'false':
          this.value = false;
          break;
        case '':
          // Not set, keep it undefined
          break;
        default:
          // Incorecct value, throw diagnostics warning + quick actions
          this._addDiagnosticValueTypeIncorrect();
          break;
      }

      // Add Semantic Tokens
      this.semanticTokens.push({
        offsetStart: this.offsetStart!,
        offsetEnd: this.offsetEnd!,
        tokenType: SemanticTokenType.Boolean
      });
    } else if (typeof this.yml.value === 'boolean') {
      this.value = this.yml.value;

      // Add Semantic Tokens
      this.semanticTokens.push({
        offsetStart: this.offsetStart!,
        offsetEnd: this.offsetEnd!,
        tokenType: SemanticTokenType.Boolean
      });
    } else if (this.yml.value === null) {
    } else {
      // Incorecct value, throw diagnostics warning + quick actions
      this._addDiagnosticValueTypeIncorrect();
    }
  }

  private _addDiagnosticValueTypeIncorrect() {
    this.addDiagnostic(
      [this.offsetStart!, this.offsetEnd!],
      `Incorrect value "${this.yml.value}"`,
      DiagnosticSeverity.Error,
      DiagnosticCode.ValueContentIncorrect,
      [
        {
          title: `Remove value`,
          text: `""`
        },
        {
          title: `Change value to "true"`,
          text: "true"
        },
        {
          title: `Change value to "false"`,
          text: "false"
        }
      ]
    );
  }
}