import { DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { kinds } from "betonquest-utils/betonquest/v1/Events";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { EventEntryType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { EventArguments } from "./EventArguments";
import { EventKey } from "./EventKey";
import { EventKind } from "./EventKind";
import { EventList } from "./EventList";

export class EventEntry extends AbstractNodeV1<EventEntryType> {
  readonly type: EventEntryType = "EventEntry";
  offsetStart?: number;
  offsetEnd?: number;
  readonly parent: EventList;

  yml: Pair<Scalar<string>, Scalar<string>>;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: EventList) {
    super();
    this.parent = parent;
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.yml = pair;

    // Parse YAML key
    this.addChild(new EventKey(this.yml.key, this));

    // Parse kind and arguments
    const [source, [offsetStart, offsetEnd, indent]] = getScalarSourceAndRange(pair.value);
    if (!source || typeof source !== 'string') {
      // Missing or incorrect instructions
      this.addDiagnostic(
        [offsetStart, offsetEnd],
        `Missing or incorrect instructions: ${source}`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ElementInstructionMissing,
      );
      return;
    }
    const regex = /(\S+)(\s*)(.*)/s;
    let matched = regex.exec(source);

    // Parse kind
    if (!matched || matched.length < 2) {
      // Missing kind
      this.addDiagnostic(
        [offsetStart, offsetEnd],
        `Missing or incorrect instructions: ${source}`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ElementInstructionMissing,
      );
      return;
    }
    const kindStr = matched[1];
    const kind = kinds.find(k => k.value === kindStr.toLowerCase()) ?? kinds.find(k => k.value === "*")!;
    const offsetKindStart = offsetStart + matched.index;
    const offsetKindEnd = offsetKindStart + kindStr.length;
    this.addChild(new EventKind(kindStr, [offsetKindStart, offsetKindEnd], kind, this));

    // Parse Arguments
    const argumentsSourceStr = matched[3];
    if (!argumentsSourceStr) {
      // Check if the arguments missing any arguments by kinds list,
      // If so, throw diagnostic
      if (kind && kind.value !== "*" && kind.argumentsPatterns.mandatory.length > 0) {
        this.addDiagnostic(
          [offsetKindEnd, offsetEnd],
          `Missing mandatory argument(s) for "${kindStr}"`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ElementArgumentsMissing,
        );
      }
      return;
    }
    const offsetArgumentsStart = offsetKindEnd ? offsetKindEnd + matched[2].length : undefined;
    // Parse each individual arguments
    this.addChild(new EventArguments(argumentsSourceStr, [offsetArgumentsStart, offsetEnd], indent, kind, this));
  }
}