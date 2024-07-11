import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { ConversationFirstPointerType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { First } from "./First";

export class FirstPointer extends AbstractNodeV2<ConversationFirstPointerType> {
  readonly type: ConversationFirstPointerType = "ConversationFirstPointer";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: First;

  // Cache content
  readonly withExclamationMark: boolean;
  readonly package: string = "";
  readonly conversationID: string;
  readonly optionID: string;

  constructor(idString: string, range: [offsetStart: number, offsetEnd: number], parent: First) {
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
    if (str.includes(".")) {
      const pos = str.indexOf(".");
      this.conversationID = str.slice(0, pos);
      this.optionID = str.slice(pos + 1);
      if (this.optionID.includes(".")) {
        // 2+ separators ".", resolve for Package
        const pos = this.optionID.indexOf(".");
        this.package = this.conversationID;
        this.conversationID = this.optionID.slice(0, pos);
        this.optionID = this.optionID.slice(pos + 1);
      }
      // Check number of "."
      if (this.optionID.includes(".")) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Extra separator "." founded in path. Special characters "." is NOT allowed when naming a Package, Conversation or Option.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.CrossPackageCrossConversationPointerInvalidCharacter
        );
      }
    } else {
      this.conversationID = this.parent.parent.parent.conversationID;
      this.optionID = str;
    }

    // Generate Semantic Tokens
    this.semanticTokens.push({
      offsetStart: this.offsetStart + (this.withExclamationMark ? 1 : 0),
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.ConversationOptionNpcID
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
    if (this.optionID === "" && this.conversationID !== "") {
      return [];
    } else if (this.optionID === "") {
      // TODO: return "first" of the target Conversation.
      return [];
    } else {
      return this.getTargetNodes().filter(n => n.comment).flatMap(n => ({
        content: n.comment!,
        offset: [this.offsetStart, this.offsetEnd]
      } as HoverInfo));
    }
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
          targetSelectionRange: [f.yml.key.range![0], f.yml.key.range![1]],
        } as LocationLinkOffset));
    } else {
      // Return the actural Option of the target Conversation.
      return this.getTargetNodes().flatMap(n => ({
        originSelectionRange: [this.offsetStart, this.offsetEnd],
        targetUri: n.getUri(),
        targetRange: [n.offsetStart!, n.offsetEnd!],
        targetSelectionRange: [n.offsetStart!, n.offsetEnd!]
      } as LocationLinkOffset));
    }
  }

  getTargetNodes() {
    return this.getConversationOptions(
      "ConversationNpcOption",
      this.optionID,
      this.conversationID,
      this.getPackageUri(this.package));
  }
}
