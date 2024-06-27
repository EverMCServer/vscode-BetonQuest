import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationFirstType } from "../../node";
import { Conversation } from "./Conversation";
import { SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { FirstPointer } from "./FirstPointer";
import { AbstractNodeV1 } from "../../v1";

export class First extends AbstractNodeV1<ConversationFirstType> {
  readonly type: ConversationFirstType = 'ConversationFirst';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: Conversation;

  private yml: Scalar;
  private entriesStr: string;

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.parent = parent;

    [this.entriesStr, [this.offsetStart, this.offsetEnd]] = getScalarSourceAndRange(yml);
    if (typeof yml.value !== 'string') {
      this.addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        "Invalid string value",
        DiagnosticSeverity.Error,
        DiagnosticCode.ValueContentIncorrect,
        [
          {
            title: "Clear value",
            text: `""`,
          }
        ]
      );
    }
    this.yml = yml;

    // Split and parse IDs
    const regex = /(,?)([^,]*)/g; // /(,?)([^,]*)/g
    let matched: RegExpExecArray | null;
    while ((matched = regex.exec(this.entriesStr)) !== null && matched[0].length > 0) {
      const str = matched[2];
      const offsetStartWithComma = this.offsetStart + matched.index;
      const offsetStart = offsetStartWithComma + matched[1].length;
      const offsetEnd = offsetStart + str.length;
      const strTrimedStart = str.trimStart();
      const strTrimed = strTrimedStart.trimEnd();
      const offsetStartTrimed = offsetStart + (str.length - strTrimedStart.length);
      const offsetEndTrimed = offsetStartTrimed + strTrimed.length;

      if (strTrimed.length === 0) {
        // Empty, throw diagnostics warn
        this.addDiagnostic(
          [offsetStartWithComma, offsetEnd],
          `Pointer ID is empty.`,
          DiagnosticSeverity.Warning,
          DiagnosticCode.ElementIdEmpty,
          [
            {
              title: `Remove empty Pointer ID`,
              text: "",
            }
          ]
        );
      }

      // Parse the Option ID
      this.addChild(new FirstPointer(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

      // Add semantic tokens for seprator ","
      if (matched[1].length > 0) {
        this.semanticTokens.push({
          offsetStart: offsetStartWithComma,
          offsetEnd: offsetStartWithComma + 1,
          tokenType: SemanticTokenType.Operator
        });
      }
    }
  }

  getFirstPointers(optionID?: string) {
    return this.getChildren<FirstPointer>('ConversationFirstPointer', p => !optionID || p.optionID === optionID);
  }
}
