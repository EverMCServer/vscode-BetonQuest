import { DiagnosticSeverity } from "vscode-languageserver";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { LocationLinkOffset } from "../../../utils/location";
import { NodeType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
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

export abstract class AbstractID<T extends NodeType, PT extends ConversationFinalEvents | NpcConditions | NpcEvents | PlayerConditions | PlayerEvents, ET extends ConditionEntry | EventEntry | ObjectiveEntry> extends AbstractNodeV2<T> {
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
        "An ID cannot contains any spaces...",
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
      // Check number of "."
      if ((str.match(/\./g) || []).length > 1) {
        this.addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Extra seprator "." founded in path. Please make sure special characters like ".", "-" or "_" are NOT being used when naming a Package, Conversation or Pointer.`,
          DiagnosticSeverity.Error,
          DiagnosticCode.CrossPackageCrossConversationPointerInvalidCharacter
        );
      }
    } else {
      this.id = str;
    }
  }

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
