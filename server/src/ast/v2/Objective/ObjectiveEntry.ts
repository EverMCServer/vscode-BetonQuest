import { CompletionItem, CompletionItemKind, DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import Objective from "betonquest-utils/betonquest/Objective";
import { Kinds } from "betonquest-utils/betonquest/v2/Objectives";
import { ElementKind } from "betonquest-utils/betonquest/v2/Element";

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
  private offsetValueStart?: number;
  private offsetKindStart?: number;
  private offsetKindEnd?: number;
  readonly kindConfig?: ElementKind<Objective>;
  readonly keyString: string;
  private kindString: string = "";
  private argumentsString: string = "";

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: ObjectiveListSection) {
    super();
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yml = pair;

    // Parse YAML key
    this.keyString = this.yml.key.value;
    this.addChild(new ObjectiveKey(this.yml.key, this));

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
    const kinds = Kinds.get();
    this.kindConfig = kinds.find(k => k.value.toLocaleLowerCase() === this.kindString.toLowerCase()) ?? kinds.find(k => k.value === "*")!;
    this.offsetKindStart = offsetStart + matched.index;
    this.offsetKindEnd = this.offsetKindStart + this.kindString.length;
    this.addChild(new ObjectiveKind(this.kindString, [this.offsetKindStart, this.offsetKindEnd], this));

    // Parse Arguments
    this.argumentsString = matched[2];
    const offsetArgumentsStart = this.offsetKindEnd;
    // Parse each individual arguments
    this.addChild(new ObjectiveArguments(this.argumentsString, [offsetArgumentsStart, offsetEnd], indent, this));
  }

  isKind(kindToCheck: string) {
    return this.kindString.toLowerCase() === kindToCheck.toLowerCase();
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completionItems = [];
    // Prompt the Objective kind list
    if (
      this.yml.srcToken?.sep && this.yml.srcToken.sep[1] && this.yml.srcToken.sep[1].type === 'space'
      && this.offsetKindStart && this.offsetKindEnd &&
      (
        this.offsetValueStart && this.offsetValueStart <= offset && (this.offsetValueStart === this.offsetKindStart && this.offsetKindStart === offset || offset < this.offsetKindStart) ||
        this.offsetKindStart < offset && offset <= this.offsetKindEnd
      )
    ) {
      completionItems.push(...Kinds.get()
        .filter(k => k.value !== "*")
        .flatMap(k => ({
          label: k.value,
          kind: CompletionItemKind.Constructor, // TODO: move it onto SemanticTokenType etc.
          detail: k.display,
          documentation: k.description?.toString()
        }))
      );
    }
    return completionItems;
  }
}
