import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { SemanticTokenType } from "../../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../../utils/diagnostics";
import { HoverInfo } from "../../../../../utils/hover";
import { LocationLinkOffset } from "../../../../../utils/location";
import { ConversationNpcPointerType } from "../../../../node";
import { AbstractNodeV2 } from "../../../../v2";
import { Pointers } from "./Pointers";

export class Pointer extends AbstractNodeV2<ConversationNpcPointerType> {
  readonly type: ConversationNpcPointerType = "ConversationNpcPointer";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: Pointers;

  // Cache content
  readonly withExclamationMark: boolean;
  readonly package: string = "";
  readonly conversationID: string;
  readonly optionID: string;

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: Pointers) {
    super();
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
    // https://betonquest.org/2.0/Documentation/Features/Conversations/#cross-conversation-pointers
    if (str.includes(".")) {
      const pos = str.indexOf(".");
      this.conversationID = str.slice(0, pos);
      this.optionID = str.slice(pos + 1);
      if (this.optionID.includes(".")) {
        // 2+ seprators ".", resolve for Package
        const pos = this.optionID.indexOf(".");
        this.package = this.conversationID;
        this.conversationID = this.optionID.slice(0, pos);
        this.optionID = this.optionID.slice(pos + 1);
      }
      // Check number of "."
      if (this.optionID.includes(".")) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Extra seprator "." founded in path. Special characters "." is NOT allowed when naming a Package, Conversation or Option.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.CrossPackageCrossConversationPointerInvalidCharacter
        );
      }
    } else {
      this.conversationID = this.parent.parent.parent.parent.conversationID;
      this.optionID = str;
    }

    // Generate Semantic Tokens
    this.semanticTokens.push({
      offsetStart: this.offsetStart + (this.withExclamationMark ? 1 : 0),
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.ConversationOptionPlayerID
    });
  }

  getDiagnostics(): Diagnostic[] {
    const diagnostics = super.getDiagnostics();
    if (this.getTargetNodes().length < 1) {
      diagnostics.push(this.makeDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `The Conversation Option "${this.optionID}" does not exist.`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ConversationOptionPointerUndefined
      ));
    }
    return diagnostics;
  }

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfos: HoverInfo[] = this.getTargetNodes().filter(n => n.comment).flatMap(n => ({
      content: n.comment!,
      offset: [this.offsetStart, this.offsetEnd]
    }));
    return hoverInfos;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    // Check empty optionID
    if (this.optionID === "" && this.conversationID === "") {
      return [];
    } else if (this.optionID === "") {
      // Return "first" of the target Conversation.
      return this.getPackages(this.getPackageUri(this.package))
        .flatMap(p => p.getConversations(this.conversationID))
        .flatMap(c => c.getConversationSections())
        .flatMap(s => s.getFirst())
        .flatMap(f => ({
          originSelectionRange: [this.offsetStart, this.offsetEnd],
          targetUri: f.getUri(),
          targetRange: [f.offsetStart, f.offsetEnd],
          targetSelectionRange: [f.offsetStart, f.offsetEnd],
        } as LocationLinkOffset));
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
      "ConversationPlayerOption",
      this.optionID,
      this.conversationID,
      this.getPackageUri(this.package));
  }
}
