import { CompletionItem, CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { kinds } from "betonquest-utils/betonquest/v2/Conditions";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { ConditionEntryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArguments } from "./ConditionArguments";
import { ConditionKey } from "./ConditionKey";
import { ConditionKind } from "./ConditionKind";
import { ConditionListSection } from "./ConditionList";

export class ConditionEntry extends AbstractNodeV2<ConditionEntryType> {
  readonly type: ConditionEntryType = "ConditionEntry";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionListSection;

  readonly yml: Pair<Scalar<string>, Scalar<string>>;
  private offsetValueStart?: number;
  private offsetKindStart?: number;
  private offsetKindEnd?: number;
  private kindString: string = "";
  private argumentsString: string = "";

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: ConditionListSection) {
    super();
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yml = pair;

    // Parse YAML key
    this.addChild(new ConditionKey(this.yml.key, this));

    // Parse kind and arguments
    const [source, [offsetStart, offsetEnd, indent]] = getScalarSourceAndRange(this.yml.value);
    this.offsetValueStart = offsetStart;
    this.offsetKindStart = offsetStart;
    this.offsetKindEnd = offsetEnd;
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
    // Update offsetEnd if value is un-quoted string
    if (this.yml.value?.srcToken?.type === "scalar") {
      this.offsetEnd = offsetEnd;
    }
    const regex = /(\S+)(\s*.*)/s;
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
    this.kindString = matched[1];
    const kind = kinds.find(k => k.value === this.kindString.toLowerCase()) ?? kinds.find(k => k.value === "*")!;
    this.offsetKindStart = offsetStart + matched.index;
    this.offsetKindEnd = this.offsetKindStart + this.kindString.length;
    this.addChild(new ConditionKind(this.kindString, [this.offsetKindStart, this.offsetKindEnd], kind, this));

    // Parse Arguments
    this.argumentsString = matched[2];
    const offsetArgumentsStart = this.offsetKindEnd;
    // Parse each individual arguments
    this.addChild(new ConditionArguments(this.argumentsString, [offsetArgumentsStart, offsetEnd], indent, kind, this));
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completionItems = [];
    // Prompt the Condition kind list
    if (
      this.yml.srcToken?.sep && this.yml.srcToken.sep[1] && this.yml.srcToken.sep[1].type === 'space'
      && this.offsetKindStart && this.offsetKindEnd &&
      (
        this.offsetValueStart && this.offsetValueStart <= offset && (this.offsetValueStart === this.offsetKindStart && this.offsetKindStart === offset || offset < this.offsetKindStart) ||
        this.offsetKindStart < offset && offset <= this.offsetKindEnd
      )
    ) {
      completionItems.push(...kinds
        .filter(k => k.value !== "*")
        .flatMap(k => ({
          label: k.value,
          kind: CompletionItemKind.Constructor, // TODO: move it onto SemanticTokenType etc.
          detail: k.display,
          documentation: k.description?.toString()
        }))
      );
    }
    completionItems.push(...super.getCompletions(offset, documentUri));
    return completionItems;
  }
}
