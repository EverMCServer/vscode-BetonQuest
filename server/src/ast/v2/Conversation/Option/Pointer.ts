import { DiagnosticSeverity } from "vscode-languageserver";

import { SemanticToken, SemanticTokenType } from "../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { HoverInfo } from "../../../../utils/hover";
import { LocationLinkOffset } from "../../../../utils/location";
import { ConversationOptionType, ConversationPointerType, NodeType, NodeV2 } from "../../../node";
import { Pointers } from "./Pointers";

export class Pointer<T extends ConversationOptionType> extends NodeV2<NodeType> {
  type: ConversationPointerType = "ConversationPointer";
  protected uri: string;
  protected offsetStart: number;
  protected offsetEnd: number;
  protected parent: Pointers<T>;

  // Cache content
  protected withExclamationMark: boolean;
  protected package: string = "";
  protected id: string;

  private semanticTokens: SemanticToken[] = [];

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: Pointers<T>) {
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
    // Parse package path
    if (str.includes(".")) {
      const splited = str.split(".", 2);
      this.package = splited[0];
      this.id = splited[1];
    } else {
      this.id = str;
    }

    // Generate Semantic Tokens
    this.semanticTokens.push({
      offsetStart: this.offsetStart + (this.withExclamationMark ? 1 : 0),
      offsetEnd: this.offsetEnd,
      tokenType: this.parent.parent.type === "ConversationNpcOption" ? SemanticTokenType.ConversationOptionPlayerID : SemanticTokenType.ConversationOptionNpcID
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
    // TODO ...
    return [];
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }
    // TODO
    return [];
  }
}
