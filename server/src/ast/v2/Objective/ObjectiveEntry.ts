import { CompletionItem, CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { kinds } from "betonquest-utils/betonquest/v2/Objectives";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { ObjectiveEntryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ObjectiveArguments } from "./ObjectiveArguments";
import { ObjectiveKey } from "./ObjectiveKey";
import { ObjectiveKind } from "./ObjectiveKind";
import { ObjectiveListSection } from "./ObjectiveList";

export class ObjectiveEntry extends AbstractNodeV2<ObjectiveEntryType> {
  readonly type: ObjectiveEntryType = "ObjectiveEntry";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ObjectiveListSection;

  readonly yml: Pair<Scalar<string>, Scalar<string>>;
  readonly offsetKindEnd?: number;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: ObjectiveListSection) {
    super();
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yml = pair;
    this.offsetKindEnd = this.offsetEnd;

    // Parse YAML key
    this.addChild(new ObjectiveKey(pair.key, this));

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
    this.offsetKindEnd = offsetKindStart + kindStr.length;
    this.addChild(new ObjectiveKind(kindStr, [offsetKindStart, this.offsetKindEnd], kind, this));

    // Parse Arguments
    const argumentsSourceStr = matched[3];
    const offsetArgumentsStart = this.offsetKindEnd ? this.offsetKindEnd + matched[2].length : undefined;
    // Parse each individual arguments
    this.addChild(new ObjectiveArguments(argumentsSourceStr, [offsetArgumentsStart, offsetEnd], indent, kind, this));
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completionItems = [];
    // Prompt the Objective list
    if (this.offsetKindEnd && offset <= this.offsetKindEnd) {
      completionItems.push(...kinds.filter(k => k.value !== "*").flatMap(k => ({
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
