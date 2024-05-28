import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationFinalEventsType, NodeV1 } from "../../node";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { SemanticToken } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { getScalarRangeByValue, getSourceByValue } from "../../../utils/yaml";
import { Conversation } from "./Conversation";
import { Event } from "./Option/Event";

export class ConversationFinalEvents extends NodeV1<ConversationFinalEventsType> {
  type: ConversationFinalEventsType = 'ConversationFinalEvents';
  uri: string;
  offsetStart: number;
  offsetEnd: number;
  parent: Conversation;

  // Cache the parsed yaml document
  yml: Scalar;
  events: Event<this>[] = [];

  private semanticTokens: SemanticToken[] = [];

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
        this.events.push(
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
            tokenType: "operator",
          });
        }
      }
    }
  }

  getDiagnostics() {
    const diagnostics = this.diagnostics;
    this.events.forEach(event => diagnostics.push(...event.getDiagnostics()));
    return diagnostics;
  }

  getCodeActions() {
    return this.codeActions;
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [...this.semanticTokens];
    semanticTokens.push(...this.events.flatMap(event => event.getSemanticTokens()));
    return semanticTokens;
  };

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return hoverInfo;
    }
    hoverInfo.push(...this.events.flatMap(e => e.getHoverInfo(offset)));
    return hoverInfo;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }

    return this.events.flatMap(c => c.getDefinitions(offset));
  }
}
