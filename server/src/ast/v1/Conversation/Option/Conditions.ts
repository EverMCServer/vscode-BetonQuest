import { Scalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationConditionsType, ConversationOptionType } from "../../../node";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { HoverInfo } from "../../../../utils/hover";
import { LocationLinkOffset } from "../../../../utils/location";
import { getScalarSourceAndRange } from "../../../../utils/yaml";
import { Condition } from "./Condition";
import { AbstractNodeV1 } from "../../../v1";

export class Conditions<PT extends AbstractNodeV1<ConversationOptionType>> extends AbstractNodeV1<ConversationConditionsType> {
  readonly type: ConversationConditionsType = "ConversationConditions";
  readonly uri: string;
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: PT;

  private yml: Scalar<string>; //<Scalar<string>, Scalar<string>>;
  private conditionsStr: string;
  // private conditions: Condition<this>[] = [];

  constructor(yml: Scalar<string>, parent: PT) {
    super();
    this.uri = parent.uri;
    this.parent = parent;

    this.yml = yml;
    [this.conditionsStr, [this.offsetStart, this.offsetEnd]] = getScalarSourceAndRange(this.yml);

    // Split and parse condition IDs
    const regex = /(,?)([^,]*)/g; // /(,?)([^,]*)/g
    let matched: RegExpExecArray | null;
    while ((matched = regex.exec(this.conditionsStr)) !== null && matched[0].length > 0) {
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
          `Condition ID is empty.`,
          DiagnosticSeverity.Warning,
          DiagnosticCode.ElementIdEmpty,
          [
            {
              title: `Remove empty condition ID`,
              text: ""
            }
          ]
        );
      }

      // Parse the Condition ID
      this.addChild(new Condition(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

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
