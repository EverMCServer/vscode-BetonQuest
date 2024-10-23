import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { NodeType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ConditionEntry } from "../Condition/ConditionEntry";
import { ConditionKey } from "../Condition/ConditionKey";
import { EventEntry } from "../Event/EventEntry";
import { EventKey } from "../Event/EventKey";
import { ObjectiveEntry } from "../Objective/ObjectiveEntry";
import { ObjectiveKey } from "../Objective/ObjectiveKey";
import { ConversationFinalEvents } from "./ConversationFinalEvents";
import { Conditions as NpcConditions } from "./Option/Npc/Conditions";
import { Events as NpcEvents } from "./Option/Npc/Events";
import { Conditions as PlayerConditions } from "./Option/Player/Conditions";
import { Events as PlayerEvents } from "./Option/Player/Events";
import { title } from "process";

export abstract class AbstractID<T extends NodeType, PT extends ConversationFinalEvents | NpcConditions | NpcEvents | PlayerConditions | PlayerEvents, ET extends ConditionEntry | EventEntry | ObjectiveEntry> extends AbstractNodeV1<T> {
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: PT;

  // Cache content
  protected withExclamationMark: boolean;
  readonly package: string = "";
  readonly id: string;

  constructor(idString: string, range: [number, number], parent: PT) {
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
    // Parse package path
    if (str.includes(".")) {
      const pos = str.indexOf(".");
      this.package = str.slice(0, pos);
      this.id = str.slice(pos + 1);
      // Check number of "."
      if (this.id.includes(".")) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Extra separator "." founded in path. Please avoide using special characters like ".", "-" or "_" when naming a Condition, Event or Objective.`,
          DiagnosticSeverity.Warning,
          DiagnosticCode.CrossPackageCrossConversationPointerInvalidCharacter
        );
      }
      // Check invalid patterns in the package-path, e.g. "--"
      if (this.package.includes("--")) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Invalid pattern is found in package naming. Special characters like ".", "-" or "_" are NOT allowed when naming a Package.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.CrossPackageCrossConversationPointerInvalidCharacter
        );
      }
      // Check empty package name
      if (this.package === "") {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Package path is empty.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.CrossPackageCrossConversationPackagePathIsEmpty,
          [{
            title: `Remove separator "."`,
            text: `${this.withExclamationMark ? "!" : ""}${this.id}`,
            range: [this.offsetStart, this.offsetEnd]
          }]
        );
      }
    } else {
      this.id = str;
    }
  }

  // Method to get the kind of the AbstractID, e.g. "Event" or "Condition"
  abstract getIdKindName(): string;

  // Method to get the target nodes that this ID points to.
  abstract getTargetNodes(): ET[];

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [];
    if (this.withExclamationMark) {
      semanticTokens.push({
        offsetStart: this.offsetStart,
        offsetEnd: this.offsetStart + 1,
        tokenType: SemanticTokenType.Operator
      });
    }
    return semanticTokens;
  };

  getDiagnostics(): Diagnostic[] {
    const diagnostics = [];
    if (this.getTargetNodes().length < 1) {
      diagnostics.push(this.generateDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `The target ${this.getIdKindName()} "${this.id}" is not defined${this.package ? " in package \"" + this.package + "\"" : ""}.`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ConversationOptionPointerUndefined
      ));
    }
    return diagnostics;
  }

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return hoverInfo;
    }
    hoverInfo.push(...this.getTargetNodes().flatMap(n => {
      const hoverInfo = [
        ...n.getChild<ConditionKey | EventKey | ObjectiveKey>(['ConditionKey', 'EventKey', 'ObjectiveKey'])!
          .getHoverInfo().map(h => {
            h.offset = [this.offsetStart, this.offsetEnd];
            return h;
          })
      ];
      if (n.yml.value) {
        hoverInfo.unshift({
          content: n.yml.value.value,
          offset: [this.offsetStart, this.offsetEnd]
        });
      }
      return hoverInfo;
    }));
    return hoverInfo;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    return this.getTargetNodes().flatMap(n => ({
      originSelectionRange: [this.offsetStart + (this.withExclamationMark ? 1 : 0), this.offsetEnd],
      targetUri: n.getUri(),
      targetRange: [n.offsetStart!, n.offsetEnd!],
      targetSelectionRange: [n.offsetStart!, n.offsetEnd!]
    }));
  }
}
