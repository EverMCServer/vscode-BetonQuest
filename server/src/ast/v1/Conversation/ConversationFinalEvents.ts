import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationFinalEventsType } from "../../node";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { SemanticTokenType } from "../../../service/semanticTokens";
import { getScalarRangeByValue, getSourceByValue } from "../../../utils/yaml";
import { Conversation } from "./Conversation";
import { Event } from "./Option/Event";
import { AbstractNodeV1 } from "../../v1";

export class ConversationFinalEvents extends AbstractNodeV1<ConversationFinalEventsType> {
  readonly type: ConversationFinalEventsType = 'ConversationFinalEvents';
  readonly uri: string;
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: Conversation;

  // Cache the parsed yaml document
  private yml: Scalar;

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;
    [this.offsetStart, this.offsetEnd] = getScalarRangeByValue(this.yml);

    const str = getSourceByValue(this.yml);
    // Check value type
    if (typeof str === 'string') {
      // Parse Events with RegEx
      const regex = /(,?)([^,]*)/g; // /([^\s,]+)/gm;
      let matched: RegExpExecArray | null;
      while ((matched = regex.exec(str)) !== null && matched[0].length > 0) {
        const str = matched[2];
        const strTrimed = str.trim();
        const offsetStartWithComma = this.offsetStart + matched.index;
        const offsetStart = offsetStartWithComma + matched[1].length;
        const offsetEnd = offsetStart + str.length;

        // Check leading & tailing empty spaces
        if (strTrimed !== str) {
          // Throw diagnostics & quick fix
          this.addDiagnostic(
            [offsetStart, offsetEnd],
            `Event IDs in "final_events" can not be separated with leading or tailing spaces.`,
            DiagnosticSeverity.Error,
            DiagnosticCode.ValueFormatIncorrect,
            [
              {
                title: "Remove leading & tailing empty spaces",
                text: strTrimed
              }
            ]
          );
        }

        // Check if any spaces in the middle
        if (strTrimed.match(/\s+/)) {
          const correctStr = strTrimed.replace(/\s+/g, "_");
          this.addDiagnostic(
            [offsetStart, offsetEnd],
            `Event ID cannot contains empty spaces. Do you mean "${correctStr}"?.`,
            DiagnosticSeverity.Error,
            DiagnosticCode.ElementIdSyntax,
            [
              {
                title: `Change to "${correctStr}"`,
                text: correctStr
              },
              {
                title: `Remove "${strTrimed}"`,
                range: [offsetStartWithComma, offsetEnd],
                text: ""
              }
            ]
          );
        }

        // Create Event
        this.addChild(
          new Event<this>(
            str,
            [offsetStart, offsetEnd],
            this
          )
        );

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
}
