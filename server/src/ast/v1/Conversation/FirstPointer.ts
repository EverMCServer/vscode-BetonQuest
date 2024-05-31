import { DiagnosticSeverity } from "vscode-languageserver";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { ConversationPointerType, NodeType, NodeV1 } from "../../node";
import { First } from "./First";

export class FirstPointer extends NodeV1<NodeType> {
  type: ConversationPointerType = "ConversationPointer";
  protected uri: string;
  protected offsetStart: number;
  protected offsetEnd: number;
  protected parent: First;

  // Cache content
  protected withExclamationMark: boolean;
  protected package: string = "";
  protected conversationID: string;
  protected optionID: string;

  private semanticTokens: SemanticToken[] = [];

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: First) {
    super();
    this.uri = parent.getUri();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    // Parse ID string.
    let str = idString;
    // Parse exclamation mark
    if ((this.withExclamationMark = str.startsWith("!")) === true) {
      str = str.substring(1);
    }
    // Check illigal characters
    if (str.match(/\s/)) {
      // TODO this._addDiagnostic();
      this.addDiagnostic(
        [this.offsetStart + (this.withExclamationMark ? 1 : 0), this.offsetEnd],
        "An ID cannot contains any spaces",
        DiagnosticSeverity.Error,
        DiagnosticCode.ValueIdContainsSpace,
        [
          {
            title: "Remove spaces",
            text: str.replace(/\s/g, "")
          }
        ]
      );
    }
    // Parse package package, Conversation ID, Pointer ID
    if (str.includes(".")) {
      const splited = str.split(".", 3); // TODO: check number of "."
      this.package = splited[0];
      this.conversationID = splited[1];
      this.optionID = splited[2];
    } else {
      this.conversationID = this.parent.parent.conversationID;
      this.optionID = str;
    }

    // Generate Semantic Tokens
    this.semanticTokens.push({
      offsetStart: this.offsetStart + (this.withExclamationMark ? 1 : 0),
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.ConversationOptionNpcID
    });
  }

  // getDiagnostics(): Diagnostic[] {
  //   return [
  //     ...this.diagnostics,
  //   ];
  // }

  // getCodeActions(): CodeAction[] {
  //   return [
  //     ...this.codeActions,
  //   ];
  // }

  getSemanticTokens(): SemanticToken[] {
    return this.semanticTokens;
  };

  getHoverInfo(offset: number): HoverInfo[] {
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return [];
    }
    const hoverInfos: HoverInfo[] = this.getTargetNodes().filter(n => n.comment).flatMap(n => ({
      content: n.comment!,
      offset: [this.offsetStart, this.offsetEnd]
    }));
    return hoverInfos;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }
    const locations: LocationLinkOffset[] = this.getTargetNodes().flatMap(n => ({
      originSelectionRange: [this.offsetStart, this.offsetEnd],
      targetUri: n.getUri(),
      targetRange: [n.offsetStart!, n.offsetEnd!],
      targetSelectionRange: [n.offsetStart!, n.offsetEnd!]
    }));
    return locations;
  }

  getTargetNodes() {
    return this.getConversationOptions(
      "ConversationNpcOption",
      this.optionID,
      this.conversationID,
      this.getPackageUri(this.package));
  }
}
