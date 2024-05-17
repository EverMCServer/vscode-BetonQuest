import { Scalar } from "yaml";

import { ConversationConditionsType, ConversationOptionType, NodeV1 } from "../../../node";
import { getScalarRangeByValue, getScalarSourceAndRange } from "../../../../utils/yaml";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { Condition } from "./Condition";

export class Conditions<PT extends NodeV1<ConversationOptionType>> extends NodeV1<ConversationConditionsType> {
  type: ConversationConditionsType = "ConversationConditions";
  protected uri: string;
  protected parent: PT;

  private yml: Scalar<string>; //<Scalar<string>, Scalar<string>>;
  private conditionsStr: string;
  private conditions: Condition<this>[] = [];

  constructor(yml: Scalar<string>, parent: PT) {
    super();
    this.uri = parent.getUri();
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
      const offsetEndTrimed = offsetStartTrimed - strTrimed.length;

      if (strTrimed.length === 0) {
        // Empty, throw diagnostics warn
        this._addDiagnostic(
          this.getRangeByOffset(offsetStartWithComma, offsetEnd),
          `Condition ID is empty.`,
          DiagnosticSeverity.Warning,
          DiagnosticCode.ElementIdEmpty,
          [
            {
              title: `Remove empty condition ID`,
              text: "",
              range: this.parent.getRangeByOffset(offsetStartWithComma, offsetEnd)
            }
          ]
        );
      }

      // Parse the Condition ID
      this.conditions.push(new Condition(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

    }
  }

  getDiagnostics(): Diagnostic[] {
    return [
      ...this.diagnostics,
      ...this.conditions.flatMap(c => c.getDiagnostics())
    ];
  }
}
