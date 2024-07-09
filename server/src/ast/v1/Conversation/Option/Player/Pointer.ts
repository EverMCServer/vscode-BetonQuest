import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { SemanticTokenType } from "../../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../../utils/diagnostics";
import { HoverInfo } from "../../../../../utils/hover";
import { LocationLinkOffset } from "../../../../../utils/location";
import { ConversationPlayerPointerType } from "../../../../node";
import { AbstractNodeV1 } from "../../../../v1";
import { Pointers } from "./Pointers";

export class Pointer extends AbstractNodeV1<ConversationPlayerPointerType> {
  readonly type: ConversationPlayerPointerType = "ConversationPlayerPointer";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: Pointers;

  // Cache content
  readonly withExclamationMark: boolean;
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
    // https://betonquest.org/1.12/User-Documentation/Conversations/#cross-conversation-pointers
    if (str.includes(".")) {
      const pos = str.indexOf(".");
      this.conversationID = str.slice(0, pos);
      this.optionID = str.slice(pos + 1);
      // Check number of "."
      if (this.optionID.includes(".")) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Extra seprator "." founded in path. Please avoide using special characters like ".", "-" or "_" when naming a Conversation or Pointer.`,
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
    const hoverInfos: HoverInfo[] = this.getTargetNodes().filter(n => n.comment).flatMap(n => ({
      content: n.comment!,
      offset: [this.offsetStart, this.offsetEnd]
    }));
    return hoverInfos;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    // Check empty optionID
    if (this.optionID === "") {
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
      this.getPackageUri());
  }
}
