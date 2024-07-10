import { DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { LocationLinkOffset } from "../../../utils/location";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { ConversationFirstType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConversationSection } from "./Conversation";
import { FirstPointer } from "./FirstPointer";

export class First extends AbstractNodeV2<ConversationFirstType> {
  readonly type: ConversationFirstType = 'ConversationFirst';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConversationSection;

  readonly yml: Pair<Scalar<string>, Scalar<string>>;
  readonly entriesStr: string;

  constructor(yml: Pair<Scalar<string>, Scalar<string>>, offset: [offsetStart: number, offsetEnd: number], parent: ConversationSection) {
    super();
    this.offsetStart = offset[0];
    this.offsetEnd = offset[1];
    this.parent = parent;

    this.yml = yml;

    const [entriesStr, [valueOffsetStart, valueOffsetEnd]] = getScalarSourceAndRange(yml.value);
    this.entriesStr = entriesStr;
    if (typeof yml.value?.value !== 'string') {
      this.addDiagnostic(
        [valueOffsetStart, valueOffsetEnd],
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

    // Split and parse IDs
    const regex = /(,?)([^,]*)/g; // /(,?)([^,]*)/g
    let matched: RegExpExecArray | null;
    while ((matched = regex.exec(this.entriesStr)) !== null && matched[0].length > 0) {
      const str = matched[2];
      const offsetStartWithComma = valueOffsetStart + matched.index;
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
      this.addChild(new FirstPointer(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

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

  getFirstPointers(optionID?: string, conversationID?: string, packageUri?: string) {
    return this.getChildren<FirstPointer>('ConversationFirstPointer', p =>
      (!optionID || p.optionID === optionID) &&
      (!conversationID || p.conversationID === conversationID) &&
      (!packageUri || p.getPackageUri(p.package) === packageUri)
    );
  }

  getDefinitions(offset: number, documentUri?: string | undefined): LocationLinkOffset[] {
    // TODO: create a standalone node for the YAML key
    if (offset < this.yml.key.range![0] || offset > this.yml.key.range![1]) {
      return super.getDefinitions(offset, documentUri);
    }
    // Return self so VSCode will show its References instead
    return [{
      originSelectionRange: [this.yml.key.range![0], this.yml.key.range![1]],
      targetUri: this.getUri(),
      targetRange: [this.yml.key.range![0], this.yml.key.range![1]],
      targetSelectionRange: [this.yml.key.range![0], this.yml.key.range![1]],
    }];
  }

  getReferences(offset: number, documentUri?: string | undefined): LocationLinkOffset[] {
    // TODO: create a standalone node for the YAML key
    if (offset < this.yml.key.range![0] || offset > this.yml.key.range![1]) {
      return [];
    }
    return [
      ...this.getPackages()
        .flatMap(p => p.getConversations())
        .flatMap(c => c.getConversationSections())
        .flatMap(s => s.getFirst())
        .flatMap(f => f.getFirstPointers())
        .filter(p => this.getPackageUri(p.package) === this.getPackageUri() && p.conversationID === this.parent.parent.conversationID && p.optionID === "")
        .flatMap(p => ({
          originSelectionRange: [this.offsetStart, this.offsetEnd],
          targetUri: p.getUri(),
          targetRange: [p.offsetStart, p.offsetEnd],
          targetSelectionRange: [p.offsetStart, p.offsetEnd],
        } as LocationLinkOffset)),
      ...this.getPackages()
        .flatMap(p => p.getConversations())
        .flatMap(c => c.getConversationSections())
        .flatMap(s => s.getPlayerOptions())
        .flatMap(o => o.getPointers())
        .flatMap(p => p.getPointers())
        .filter(p => this.getPackageUri(p.package) === this.getPackageUri() && p.conversationID === this.parent.parent.conversationID && p.optionID === "")
        .flatMap(p => ({
          originSelectionRange: [this.offsetStart, this.offsetEnd],
          targetUri: p.getUri(),
          targetRange: [p.offsetStart, p.offsetEnd],
          targetSelectionRange: [p.offsetStart, p.offsetEnd],
        } as LocationLinkOffset)),
    ];
  }
}
