import { DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { ConversationStopType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { Conversation } from "./Conversation";

export class ConversationStop extends AbstractNodeV1<ConversationStopType> {
  readonly type: ConversationStopType = 'ConversationStop';
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: Conversation;

  // Cache the parsed yaml document
  private yml: Pair<Scalar<string>, Scalar>;
  private value?: boolean;

  constructor(yml: Pair<Scalar<string>, Scalar>, offset: [offsetStart: number, offsetEnd: number], parent: Conversation) {
    super();
    this.offsetStart = offset[0];
    this.offsetEnd = offset[1];
    this.parent = parent;

    this.yml = yml;

    // Check YAML value type
    if (typeof this.yml.value?.value === 'string') {
      // Parse string
      switch (this.yml.value.value.trim().toLowerCase()) {
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
        offsetStart: this.yml.value.range![0],
        offsetEnd: this.yml.value.range![1],
        tokenType: SemanticTokenType.Boolean
      });
    } else if (typeof this.yml.value?.value === 'boolean') {
      this.value = this.yml.value.value;

      // Add Semantic Tokens
      this.semanticTokens.push({
        offsetStart: this.yml.value.range![0],
        offsetEnd: this.yml.value.range![1],
        tokenType: SemanticTokenType.Boolean
      });
    } else if (this.yml.value?.value === null) {
    } else {
      // Incorecct value, throw diagnostics warning + quick actions
      this._addDiagnosticValueTypeIncorrect();
    }
  }

  private _addDiagnosticValueTypeIncorrect() {
    this.addDiagnostic(
      [this.yml.value!.range![0]!, this.yml.value!.range![1]],
      `Incorrect value "${this.yml.value?.value}"`,
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