import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { kinds } from "betonquest-utils/betonquest/v1/Events";

import { EventEntryType, Node } from "../../node";
import { EventKind } from "./EventKind";
import { EventKey } from "./EventKey";
import { EventArguments } from "./EventArguments";
import { EventList } from "./EventList";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";

export class EventEntry implements Node<EventEntryType> {
  type: EventEntryType = "EventEntry";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventList;
  diagnostics?: Diagnostic[] = [];

  yaml: Pair<Scalar<string>, Scalar<string>>;

  eventKey: EventKey;
  eventKind?: EventKind;
  eventArguments?: EventArguments;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: EventList) {
    this.uri = parent.uri;
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yaml = pair;

    // Parse YAML key
    this.eventKey = new EventKey(pair.key, this);

    // Parse kind and arguments
    const [source, [offsetStart, offsetEnd, indent]] = getScalarSourceAndRange(pair.value);
    if (!source || typeof source !== 'string') {
      // Missing or incorrect instructions
      this.diagnostics?.push({
        severity: DiagnosticSeverity.Error,
        code: DiagnosticCode.ElementInstructionMissing,
        message: `Missing or incorrect instructions: ${source}`,
        range: this.getRangeByOffset(offsetStart, offsetEnd)
      });
      return;
    }
    const regex = /(\S+)(\s*)(.*)/s;
    let matched = regex.exec(source);

    // Parse kind
    if (!matched || matched.length < 2) {
      // Missing kind
      this.diagnostics?.push({
        severity: DiagnosticSeverity.Error,
        code: DiagnosticCode.ElementInstructionMissing,
        message: `Missing or incorrect instructions: ${source}`,
        range: this.getRangeByOffset(offsetStart, offsetEnd)
      });
      return;
    }
    const kindStr = matched[1];
    const offsetKindStart = offsetStart + (pair.value?.srcToken?.type === 'block-scalar' ? 0 : matched.index);
    const offsetKindEnd = offsetKindStart + kindStr.length;
    this.eventKind = new EventKind(kindStr, [offsetStart, offsetKindEnd], this);

    // Parse Arguments
    const argumentsSourceStr = matched[3];
    if (!argumentsSourceStr) {
      // Check if kind do not need any arguments by kinds list,
      // If not, throw diagnostic
      const kind = kinds.find(k => k.value === kindStr);
      if (kind && kind.argumentsPatterns.mandatory.length > 0) {
        const _offsetStart = offsetKindEnd;
        this.diagnostics?.push({
          severity: DiagnosticSeverity.Error,
          code: DiagnosticCode.ElementArgumentsMissing,
          message: `Missing mandatory argument(s) for "${kindStr}"`,
          range: this.getRangeByOffset(_offsetStart, offsetEnd)
        });
      }
      return;
    }
    const offsetArgumentsStart = offsetKindEnd ? offsetKindEnd + matched[2].length : undefined;
    // Parse each individual arguments
    this.eventArguments = new EventArguments(kindStr, argumentsSourceStr, [offsetArgumentsStart, offsetEnd], indent, this);
  }

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return this.parent!.getRangeByOffset(offsetStart, offsetEnd);
  }

  getDiagnostics() {
    const diagnostics: Diagnostic[] = [];
    // From this.diagnostics
    if (this.diagnostics) {
      diagnostics.push(...this.diagnostics);
    }
    // From Child arguments
    if (this.eventArguments) {
      diagnostics.push(...this.eventArguments.getDiagnostics());
    }
    return diagnostics;
  }
}