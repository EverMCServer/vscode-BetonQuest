import { Pair, Scalar } from "yaml";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import ListElement from "betonquest-utils/betonquest/ListElement";
import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";

import { ElementEntryType, NodeV1 } from "../../node";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { LocationLinkOffset } from "../../../utils/location";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { ElementKind } from "./ElementKind";
import { ElementKey } from "./ElementKey";
import { ElementArguments } from "./ElementArguments";
import { ElementList } from "./ElementList";
import { SemanticToken } from "../../../service/semanticTokens";

export abstract class ElementEntry<LE extends ListElement> extends NodeV1<ElementEntryType> {
  abstract type: ElementEntryType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: ElementList<LE, ElementEntry<LE>>;

  yml: Pair<Scalar<string>, Scalar<string>>;

  elementKey: ElementKey<LE>;
  elementKind?: ElementKind<LE>;
  elementArguments?: ElementArguments<LE>;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, kinds: _ElementKind<LE>[], parent: ElementList<LE, ElementEntry<LE>>) {
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
    const offsetKindStart = offsetStart + (pair.value?.srcToken?.type === 'block-scalar' ? 0 : matched.index);
    const offsetKindEnd = offsetKindStart + kindStr.length;
    this.elementKind = this.newKind(kindStr, [offsetKindStart, offsetKindEnd], kind);

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
    this.elementArguments = this.newArguments(argumentsSourceStr, [offsetArgumentsStart, offsetEnd], indent, kind);
  }

  abstract newKey(key: Scalar<string>): ElementKey<LE>;
  abstract newKind(value: string, range: [number?, number?], kindConfig?: _ElementKind<LE>): ElementKind<LE>;
  abstract newArguments(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig?: _ElementKind<LE>): ElementArguments<LE>;

  getDiagnostics() {
    const diagnostics: Diagnostic[] = [];
    // From this.diagnostics
    if (this.diagnostics) {
      diagnostics.push(...this.diagnostics);
    }
    // From Child arguments
    if (this.elementArguments) {
      diagnostics.push(...this.elementArguments.getDiagnostics());
    }
    return diagnostics;
  }

  getSemanticTokens(): SemanticToken[] {
    const tokens: SemanticToken[] = [];
    tokens.push(...this.elementKey.getSemanticTokens());
    if (this.elementKind) {
      tokens.push(...this.elementKind.getSemanticTokens());
    }
    if (this.elementArguments) {
      tokens.push(...this.elementArguments.getSemanticTokens());
    }
    return tokens;
  }

  getHoverInfo(uri: string, offset: number) {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      const hoverInfo = [...this.elementKey.getHoverInfo(offset)];
      if (this.elementKind) {
        hoverInfo.push(...this.elementKind.getHoverInfo(offset));
      }
      if (this.elementArguments) {
        hoverInfo.push(...this.elementArguments.getHoverInfo(offset));
      }
      return hoverInfo;
    }
    return [];
  }

  getDefinitions(offset: number, uri: string): LocationLinkOffset[] {
    // TODO
    return [];
  }
}