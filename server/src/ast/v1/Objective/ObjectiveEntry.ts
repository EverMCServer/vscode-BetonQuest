import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { kinds } from "betonquest-utils/betonquest/v1/Objectives";

import { ObjectiveEntryType, Node } from "../../node";
import { ObjectiveKind } from "./ObjectiveKind";
import { ObjectiveKey } from "./ObjectiveKey";
import { ObjectiveArguments } from "./ObjectiveArguments";
import { ObjectiveList } from "./ObjectiveList";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";

export class ObjectiveEntry implements Node<ObjectiveEntryType> {
  type: ObjectiveEntryType = "ObjectiveEntry";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: ObjectiveList;
  diagnostics?: Diagnostic[] = [];

  yaml: Pair<Scalar<string>, Scalar<string>>;

  objectiveKey: ObjectiveKey;
  objectiveKind?: ObjectiveKind;
  objectiveArguments?: ObjectiveArguments;

  constructor(pair: Pair<Scalar<string>, Scalar<string>>, parent: ObjectiveList) {
    this.uri = parent.uri;
    this.offsetStart = pair.key?.range?.[0];
    this.offsetEnd = pair.value?.range?.[1];
    this.parent = parent;
    this.yaml = pair;

    // Parse YAML key
    this.objectiveKey = new ObjectiveKey(pair.key, this);

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
    this.objectiveKind = new ObjectiveKind(kindStr, [offsetKindStart, offsetKindEnd], kind, this);

    // Parse Arguments
    const argumentsSourceStr = matched[3];
    if (!argumentsSourceStr) {
      // Check if kind do not need any arguments by kinds list,
      // If not, throw diagnostic
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
    this.objectiveArguments = new ObjectiveArguments(argumentsSourceStr, [offsetArgumentsStart, offsetEnd], indent, kind, this);
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
    if (this.objectiveArguments) {
      diagnostics.push(...this.objectiveArguments.getDiagnostics());
    }
    return diagnostics;
  }

  getHoverInfo(uri: string, offset: number) {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      const hoverInfo = [this.objectiveKey.getHoverInfo(uri, offset)];
      if (this.objectiveKind) {
        hoverInfo.push(this.objectiveKind.getHoverInfo(uri, offset));
      }
      if (this.objectiveArguments) {
        hoverInfo.push(this.objectiveArguments.getHoverInfo(uri, offset));
      }
      return hoverInfo.flat();
    }
    return [];
  }
}