import { Scalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationEventsType, ConversationOptionType, NodeV2 } from "../../../node";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { SemanticToken } from "../../../../service/semanticTokens";
import { HoverInfo } from "../../../../utils/hover";
import { LocationLinkOffset } from "../../../../utils/location";
import { getScalarSourceAndRange } from "../../../../utils/yaml";
import { Event } from "./Event";

export class Events<PT extends NodeV2<ConversationOptionType>> extends NodeV2<ConversationEventsType> {
  type: ConversationEventsType = "ConversationEvents";
  protected uri: string;
  offsetStart: number;
  offsetEnd: number;
  protected parent: PT;

  private yml: Scalar<string>; //<Scalar<string>, Scalar<string>>;
  private eventsStr: string;
  private events: Event<this>[] = [];

  private semanticTokens: SemanticToken[] = [];

  constructor(yml: Scalar<string>, parent: PT) {
    super();
    this.uri = parent.getUri();
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
      this.events.push(new Event(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

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

  getDiagnostics(): Diagnostic[] {
    return [
      ...this.diagnostics,
      ...this.events.flatMap(c => c.getDiagnostics())
    ];
  }

  getCodeActions(): CodeAction[] {
    return [
      ...this.codeActions,
      ...this.events.flatMap(e=> e.getCodeActions())
    ];
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [...this.semanticTokens];
    semanticTokens.push(...this.events.flatMap(c => c.getSemanticTokens()));
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
