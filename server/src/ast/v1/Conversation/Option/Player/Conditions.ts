import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationConditionsType } from "../../../../node";
import { DiagnosticCode } from "../../../../../utils/diagnostics";
import { SemanticTokenType } from "../../../../../service/semanticTokens";
import { getScalarSourceAndRange } from "../../../../../utils/yaml";
import { Condition } from "./Condition";
import { AbstractNodeV1 } from "../../../../v1";
import { PlayerOption } from "../PlayerOption";

export class Conditions extends AbstractNodeV1<ConversationConditionsType> {
  readonly type: ConversationConditionsType = "ConversationConditions";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: PlayerOption;

  private yml: Scalar<string>; //<Scalar<string>, Scalar<string>>;
  private conditionsStr: string;

  constructor(yml: Scalar<string>, parent: PlayerOption) {
    super();
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

      // Add semantic tokens for separator ","
      if (matched[1].length > 0) {
        this.semanticTokens.push({
          offsetStart: offsetStartWithComma,
          offsetEnd: offsetStartWithComma + 1,
          tokenType: SemanticTokenType.Operator
        });
      }
    }
  }

  getConditions(conditionID?: string, packageUri?: string) {
    return this.getChildren<Condition>('ConversationCondition', e => (!conditionID || e.id === conditionID) && (!packageUri || this.getPackageUri(e.package) === packageUri));
  }

}
