import { Pair, Scalar } from "yaml";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import ListElement from "betonquest-utils/betonquest/ListElement";
import { ElementKind as _ElementKind } from "betonquest-utils/betonquest/v1/Element";

import { ElementEntryType, Node } from "../../node";
import { ElementKind } from "./ElementKind";
import { ElementKey } from "./ElementKey";
import { ElementArguments } from "./ElementArguments";
import { ElementList } from "./ElementList";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";

export abstract class ElementEntry<LE extends ListElement> implements Node<ElementEntryType> {
  abstract type: ElementEntryType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: ElementList<LE>;
  diagnostics?: Diagnostic[] = [];

  yaml: Pair<Scalar<string>, Scalar<string>>;

  elementKey: ElementKey<LE>;
  elementKind?: ElementKind<LE>;
  elementArguments?: ElementArguments<LE>;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, kinds: _ElementKind<LE>[], parent: ElementList<LE>) {
    this.uri = parent.uri;
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yaml = pair;

    // Parse YAML key
    this.elementKey = this.newKey(pair.key);

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
    this.elementArguments = this.newArguments(argumentsSourceStr, [offsetArgumentsStart, offsetEnd], indent, kind);
  }

  abstract newKey(key: Scalar<string>): ElementKey<LE>;
  abstract newKind(value: string, range: [number?, number?], kindConfig?: _ElementKind<LE>): ElementKind<LE>;
  abstract newArguments(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig?: _ElementKind<LE>): ElementArguments<LE>;

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return this.parent.getRangeByOffset(offsetStart, offsetEnd);
  }

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

  getHoverInfo(uri: string, offset: number) {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      const hoverInfo = [this.elementKey.getHoverInfo(uri, offset)];
      if (this.elementKind) {
        hoverInfo.push(this.elementKind.getHoverInfo(uri, offset));
      }
      if (this.elementArguments) {
        hoverInfo.push(this.elementArguments.getHoverInfo(uri, offset));
      }
      return hoverInfo.flat();
    }
    return [];
  }
}