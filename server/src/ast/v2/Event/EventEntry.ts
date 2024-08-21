import { CompletionItem, CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { Kinds } from "betonquest-utils/betonquest/v2/Events";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { EventEntryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { EventArguments } from "./EventArguments";
import { EventKey } from "./EventKey";
import { EventKind } from "./EventKind";
import { EventListSection } from "./EventList";

export class EventEntry extends AbstractNodeV2<EventEntryType> {
  readonly type: EventEntryType = "EventEntry";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: EventListSection;

  readonly yml: Pair<Scalar<string>, Scalar<string>>;
  readonly offsetKindEnd?: number;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: EventListSection) {
    super();
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[2];
    this.parent = parent;
    this.yml = pair;
    this.offsetKindEnd = this.offsetEnd;

    // Parse YAML key
    this.addChild(new EventKey(pair.key, this));

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
    const kinds = Kinds.get();
    const kind = kinds.find(k => k.value === kindStr.toLowerCase()) ?? kinds.find(k => k.value === "*")!;
    const offsetKindStart = offsetStart + matched.index;
    this.offsetKindEnd = offsetKindStart + kindStr.length;
    this.addChild(new EventKind(kindStr, [offsetKindStart, this.offsetKindEnd], kind, this));

    // Parse Arguments
    const argumentsSourceStr = matched[3];
    const offsetArgumentsStart = this.offsetKindEnd ? this.offsetKindEnd + matched[2].length : undefined;
    // Parse each individual arguments
    this.addChild(new EventArguments(argumentsSourceStr, [offsetArgumentsStart, offsetEnd], indent, kind, this));
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completionItems = [];
    // Prompt the Event list
    if (this.offsetKindEnd && offset <= this.offsetKindEnd) {
      completionItems.push(...Kinds.get().filter(k => k.value !== "*").flatMap(k => ({
        label: k.value,
        kind: CompletionItemKind.Constructor, // TODO: move it onto SemanticTokenType etc.
        detail: k.display,
        documentation: k.description?.toString()
      })));
    }
    completionItems.push(...super.getCompletions(offset, documentUri));
    return completionItems;
  }
}
