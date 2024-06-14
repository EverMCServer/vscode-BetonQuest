import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationEventsType } from "../../../../node";
import { DiagnosticCode } from "../../../../../utils/diagnostics";
import { SemanticTokenType } from "../../../../../service/semanticTokens";
import { getScalarSourceAndRange } from "../../../../../utils/yaml";
import { Event } from "./Event";
import { AbstractNodeV2 } from "../../../../v2";
import { NpcOption } from "../NpcOption";

export class Events extends AbstractNodeV2<ConversationEventsType> {
  readonly type: ConversationEventsType = "ConversationEvents";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: NpcOption;

  private yml: Scalar<string>; //<Scalar<string>, Scalar<string>>;
  private eventsStr: string;

  constructor(yml: Scalar<string>, parent: NpcOption) {
    super();
    this.parent = parent;

    this.yml = yml;
    [this.eventsStr, [this.offsetStart, this.offsetEnd]] = getScalarSourceAndRange(this.yml);

    // Split and parse Event IDs
    const regex = /(,?)([^,]*)/g; // /(,?)([^,]*)/g
    let matched: RegExpExecArray | null;
    while ((matched = regex.exec(this.eventsStr)) !== null && matched[0].length > 0) {
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
          `Event ID is empty.`,
          DiagnosticSeverity.Warning,
          DiagnosticCode.ElementIdEmpty,
          [
            {
              title: `Remove empty Event ID`,
              text: "",
            }
          ]
        );
      }

      // Parse the Event ID
      this.addChild(new Event(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

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
