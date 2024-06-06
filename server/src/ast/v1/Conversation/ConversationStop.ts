import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationStopType } from "../../node";
import { Conversation } from "./Conversation";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { AbstractNodeV1 } from "../../v1";

export class ConversationStop extends AbstractNodeV1<ConversationStopType> {
  readonly type: ConversationStopType = 'ConversationStop';
  readonly uri: string;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: Conversation;

  // Cache the parsed yaml document
  private yml: Scalar;
  private value?: boolean;

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.uri = parent.uri;
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