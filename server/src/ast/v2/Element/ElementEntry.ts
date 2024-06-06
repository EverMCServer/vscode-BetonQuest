import { Pair, Scalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import ListElement from "betonquest-utils/betonquest/ListElement";
import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v2/Element";

import { ElementEntryType, AbstractNodeV2 } from "../../node";
import { ElementKind } from "./ElementKind";
import { ElementKey } from "./ElementKey";
import { ElementArguments } from "./ElementArguments";
import { ElementListSection } from "./ElementList";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { SemanticToken } from "../../../service/semanticTokens";

export abstract class ElementEntry<LE extends ListElement> extends AbstractNodeV2<ElementEntryType> {
  abstract type: ElementEntryType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: ElementListSection<LE, ElementEntry<LE>>;

  yml: Pair<Scalar<string>, Scalar<string>>;

  elementKey: ElementKey<LE>;
  elementKind?: ElementKind<LE>;
  elementArguments?: ElementArguments<LE>;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, kinds: _ElementKind<LE>[], parent: ElementListSection<LE, ElementEntry<LE>>) {
    super();
    this.uri = parent.uri;
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yml = pair;

    // Parse YAML key
    this.elementKey = this.newKey(pair.key);

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
    const kind = kinds.find(k => k.value === kindStr.toLowerCase()) ?? kinds.find(k => k.value === "*");
    const offsetKindStart = offsetStart + matched.index;
    const offsetKindEnd = offsetKindStart + kindStr.length;
    this.elementKind = this.newKind(kindStr, [offsetKindStart, offsetKindEnd], kind);

    // Parse Arguments
    const argumentsSourceStr = matched[3];
    if (!argumentsSourceStr) {
      // Check if the arguments missing any arguments by kinds list,
      // If so, throw diagnostic
      if (kind && kind.value !== "*" && kind.argumentsPatterns.mandatory.length > 0) {
        const _offsetStart = offsetKindEnd;
        this.addDiagnostic(
          [_offsetStart, offsetEnd],
          `Missing mandatory argument(s) for "${kindStr}"`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ElementArgumentsMissing,
        );
      }
      return;
    }
    const offsetArgumentsStart = offsetKindEnd ? offsetKindEnd + matched[2].length : undefined;
    // Parse each individual arguments
    this.elementArguments = this.newArguments(argumentsSourceStr, [offsetArgumentsStart, offsetEnd], indent, kind);
  }

  abstract newKey(key: Scalar<string>): ElementKey<LE>;
  abstract newKind(value: string, range: [number?, number?], kindConfig?: _ElementKind<LE>): ElementKind<LE>;
  abstract newArguments(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig?: _ElementKind<LE>): ElementArguments<LE>;

}