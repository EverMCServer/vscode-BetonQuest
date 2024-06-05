import { Scalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationConditionsType, ConversationOptionType, AbstractNodeV1 } from "../../../node";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { HoverInfo } from "../../../../utils/hover";
import { LocationLinkOffset } from "../../../../utils/location";
import { getScalarSourceAndRange } from "../../../../utils/yaml";
import { Condition } from "./Condition";

export class Conditions<PT extends AbstractNodeV1<ConversationOptionType>> extends AbstractNodeV1<ConversationConditionsType> {
  type: ConversationConditionsType = "ConversationConditions";
  protected uri: string;
  offsetStart: number;
  offsetEnd: number;
  protected parent: PT;

  private yml: Scalar<string>; //<Scalar<string>, Scalar<string>>;
  private conditionsStr: string;
  private conditions: Condition<this>[] = [];

  private semanticTokens: SemanticToken[] = [];

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
      this.conditions.push(new Condition(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

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

  getDiagnostics(): Diagnostic[] {
    return [
      ...this.diagnostics,
      ...this.conditions.flatMap(c => c.getDiagnostics())
    ];
  }

  getCodeActions(): CodeAction[] {
    return [
      ...this.codeActions,
      ...this.conditions.flatMap(c=> c.getCodeActions())
    ];
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [...this.semanticTokens];
    semanticTokens.push(...this.conditions.flatMap(c => c.getSemanticTokens()));
    return semanticTokens;
  };

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return hoverInfo;
    }
    hoverInfo.push(...this.conditions.flatMap(c => c.getHoverInfo(offset)));
    return hoverInfo;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }

    return this.conditions.flatMap(c => c.getDefinitions(offset));
  }
}
