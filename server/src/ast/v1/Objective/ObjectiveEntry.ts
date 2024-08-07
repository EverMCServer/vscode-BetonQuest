import { CompletionItem, CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { kinds } from "betonquest-utils/betonquest/v1/Objectives";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { ObjectiveEntryType } from "../../node";
import { AbstractNodeV1 } from "../../v1";
import { ObjectiveArguments } from "./ObjectiveArguments";
import { ObjectiveKey } from "./ObjectiveKey";
import { ObjectiveKind } from "./ObjectiveKind";
import { ObjectiveList } from "./ObjectiveList";

export class ObjectiveEntry extends AbstractNodeV1<ObjectiveEntryType> {
  readonly type: ObjectiveEntryType = "ObjectiveEntry";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ObjectiveList;

  readonly yml: Pair<Scalar<string>, Scalar<string>>;
  private offsetKindEnd?: number;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: ObjectiveList) {
    super();
    this.parent = parent;
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[2];
    this.yml = pair;
    this.offsetKindEnd = this.offsetEnd;

    // Parse YAML key
    this.addChild(new ObjectiveKey(this.yml.key, this));

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