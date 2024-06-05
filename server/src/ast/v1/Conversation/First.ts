import { Scalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationFirstType } from "../../node";
import { Conversation } from "./Conversation";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { FirstPointer } from "./FirstPointer";
import { AbstractNodeV1 } from "../../v1";

export class First extends AbstractNodeV1<ConversationFirstType> {
  type: ConversationFirstType = 'ConversationFirst';
  uri: string;
  offsetStart: number;
  offsetEnd: number;
  parent: Conversation;

  private yml: Scalar;
  private entriesStr: string;
  private entries: FirstPointer[] = [];

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.uri = parent.uri;
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
      this.entries.push(new FirstPointer(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

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
}