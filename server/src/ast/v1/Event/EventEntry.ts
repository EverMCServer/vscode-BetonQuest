import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { EventEntryType, Node } from "../../node";
import { EventKind } from "./EventKind";
import { EventKey } from "./EventKey";
import { EventOptions } from "./EventOptions";
import { EventList } from "./EventList";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { kinds } from "betonquest-utils/betonquest/v1/Events";

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
  eventOptions?: EventOptions;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: EventList) {
    this.uri = parent.uri;
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yaml = pair;

    // Parse YAML key
    this.eventKey = new EventKey(pair.key, this);

    // Parse kind and arguments
    const contentStr = pair.value?.value;
    if (!contentStr || typeof contentStr !== 'string') {
      // Missing or incorrect instructions
      const _offsetEnd = pair.value?.range?.[1] ?? 0;
      const _offsetStart = pair.value?.value.length ? _offsetEnd - pair.value.value.length : _offsetEnd;
      this.diagnostics?.push({
        severity: DiagnosticSeverity.Error,
        code: DiagnosticCode.ElementInstructionMissing,
        message: `Missing or incorrect instructions: ${contentStr}`,
        range: this.getRangeByOffset(_offsetStart, _offsetEnd)
      });
      return;
    }
    const regex = /(\S+)(\s*)(.*)/s;
    let matched = regex.exec(contentStr);

    // Parse kind
    if (!matched || matched.length < 2) {
      // Missing kind
      const _offsetEnd = pair.value?.range?.[1] ?? 0;
      const _offsetStart = pair.value?.value.length ? _offsetEnd - pair.value.value.length : _offsetEnd;
      this.diagnostics?.push({
        severity: DiagnosticSeverity.Error,
        code: DiagnosticCode.ElementInstructionMissing,
        message: `Missing or incorrect instructions: ${contentStr}`,
        range: this.getRangeByOffset(_offsetStart, _offsetEnd)
      });
      return;
    }
    const kindStr = matched[1];
    const offsetKindStart = pair.value?.range?.[1] ? pair.value?.range?.[1] - matched[0].length + matched.index : 0;
    const offsetKindEnd = offsetKindStart + kindStr.length;
    this.eventKind = new EventKind(kindStr, [offsetKindStart, offsetKindEnd], this);

    // Parse Arguments
    const argumentsStr = matched[3];
    if (!argumentsStr) {
      // TODO: Check if kind do not need any arguments by kinds list,
      // If so, throw diagnostic
      const kind = kinds.find(k => k.value === kindStr);
      if (kind && kind.argumentsPatterns.mandatory.length > 0) {
        const _offsetStart = offsetKindEnd;
        const _offsetEnd = pair.value?.range?.[1] ?? _offsetStart;
        this.diagnostics?.push({
          severity: DiagnosticSeverity.Error,
          code: DiagnosticCode.ElementArgumentsMissing,
          message: `Missing mandatory argument(s) for "${kindStr}"`,
          range: this.getRangeByOffset(_offsetStart, _offsetEnd)
        });
      }
      return;
    }
    const offsetArgumentsStart = offsetKindEnd ? offsetKindEnd + matched[2].length : undefined;
    const offsetArgumentsEnd = offsetArgumentsStart ? offsetArgumentsStart + argumentsStr.length : undefined;
    this.eventOptions = new EventOptions(kindStr, argumentsStr, [offsetArgumentsStart, offsetArgumentsEnd], this);
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
    // From Child options
    if (this.eventOptions) {
      diagnostics.push(...this.eventOptions.getDiagnostics());
    }
    return diagnostics;
  }
}