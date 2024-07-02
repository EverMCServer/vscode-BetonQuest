import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationPointersType } from "../../../../node";
import { DiagnosticCode } from "../../../../../utils/diagnostics";
import { SemanticTokenType } from "../../../../../service/semanticTokens";
import { getScalarSourceAndRange } from "../../../../../utils/yaml";
import { Pointer } from "./Pointer";
import { AbstractNodeV1 } from "../../../../v1";
import { PlayerOption } from "../PlayerOption";

export class Pointers extends AbstractNodeV1<ConversationPointersType> {
  readonly type: ConversationPointersType = "ConversationPointers";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: PlayerOption;

  private yml: Scalar<string>;
  private entriesStr: string;

  constructor(yml: Scalar<string>, parent: PlayerOption) {
    super();
    this.parent = parent;

    this.yml = yml;
    [this.entriesStr, [this.offsetStart, this.offsetEnd]] = getScalarSourceAndRange(this.yml);

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
      this.addChild(new Pointer(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

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

  getPointers(optionID?: string, conversationID?: string) {
    return this.getChildren<Pointer>('ConversationPlayerPointer', p =>
      (!optionID || p.optionID === optionID) &&
      (!conversationID || p.conversationID === conversationID)
    );
  }

}
