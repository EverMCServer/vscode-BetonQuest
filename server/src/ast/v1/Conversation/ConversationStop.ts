import { Scalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationStopType, Node } from "../../node";
import { Conversation } from "./Conversation";
import { DiagnosticCode } from "../../../utils/diagnostics";

export class ConversationStop extends Node<ConversationStopType> {
  type: ConversationStopType = 'ConversationStop';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // Cache the parsed yaml document
  yml: Scalar;
  value?: boolean;

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
    } else if (typeof this.yml.value === 'boolean') {
      this.value = this.yml.value;
    } else if (this.yml.value === null) {
    } else {
      // Incorecct value, throw diagnostics warning + quick actions
      this._addDiagnosticValueTypeIncorrect();
    }
  }

  private _addDiagnosticValueTypeIncorrect() {
    this._addDiagnostic(
      this.parent!.getRangeByOffset(this.offsetStart!, this.offsetEnd!),
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
        }
      ]
    );
  }
}