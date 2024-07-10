import { DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { ConversationFinalEventsType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConversationSection } from "./Conversation";
import { ConversationFinalEvent } from "./ConversationFinalEvent";

export class ConversationFinalEvents extends AbstractNodeV2<ConversationFinalEventsType> {
  readonly type: ConversationFinalEventsType = 'ConversationFinalEvents';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConversationSection;

  // Cache the parsed yaml document
  private yml: Pair<Scalar<string>, Scalar>;

  constructor(yml: Pair<Scalar<string>, Scalar>, offset: [offsetStart: number, offsetEnd: number], parent: ConversationSection) {
    super();
    this.offsetStart = offset[0];
    this.offsetEnd = offset[1];
    this.parent = parent;

    this.yml = yml;
    const [str, [valueOffsetStart, valueOffsetEnd]] = getScalarSourceAndRange(yml.value);

    // Check value type
    if (typeof str === 'string') {
      // Parse Events with RegEx
      const regex = /(,?)([^,]*)/g; // /([^\s,]+)/gm;
      let matched: RegExpExecArray | null;
      while ((matched = regex.exec(str)) !== null && matched[0].length > 0) {
        const str = matched[2];
        const strTrimed = str.trim();
        const offsetStartWithComma = valueOffsetStart + matched.index;
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
          new ConversationFinalEvent(
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

  getFinalEvents(eventID?: string, packageUri?: string) {
    return this.getChildren<ConversationFinalEvent>('ConversationEvent', e => (!eventID || e.id === eventID) && (!packageUri || this.getPackageUri(e.package) === packageUri));
  }
}
