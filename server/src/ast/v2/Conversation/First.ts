import { Scalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationFirstType, NodeV2 } from "../../node";
import { ConversationSection } from "./Conversation";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { FirstPointer } from "./FirstPointer";

export class First extends NodeV2<ConversationFirstType> {
  type: ConversationFirstType = 'ConversationFirst';
  protected uri: string;
  offsetStart: number;
  offsetEnd: number;
  parent: ConversationSection;

  private yml: Scalar;
  private entriesStr: string;
  private entries: FirstPointer[] = [];

  private semanticTokens: SemanticToken[] = [];

  constructor(yml: Scalar, parent: ConversationSection) {
    super();
    this.uri = parent.getUri();
    this.parent = parent;

    [this.entriesStr, [this.offsetStart, this.offsetEnd]] = getScalarSourceAndRange(yml);
    if (typeof yml.value !== 'string') {
      this.addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        "Invalid string value",
        DiagnosticSeverity.Error,
        DiagnosticCode.ValueContentIncorrect,
        [
          {
            title: "Clear value",
            text: `""`,
          }
        ]
      );
    }
    this.yml = yml;

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
      this.entries.push(new FirstPointer(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

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
      ...this.entries.flatMap(c => c.getDiagnostics())
    ];
  }

  getCodeActions(): CodeAction[] {
    return [
      ...this.codeActions,
      ...this.entries.flatMap(e => e.getCodeActions())
    ];
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [...this.semanticTokens];
    semanticTokens.push(...this.entries.flatMap(c => c.getSemanticTokens()));
    return semanticTokens;
  };

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return hoverInfo;
    }
    hoverInfo.push(...this.entries.flatMap(e => e.getHoverInfo(offset)));
    return hoverInfo;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }

    return this.entries.flatMap(c => c.getDefinitions(offset));
  }
}