import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional, ArgumentsPatterns } from "betonquest-utils/betonquest/Arguments";
import { ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Condition from "betonquest-utils/betonquest/Condition";

import { ConditionArgumentsType, Node } from "../../node";
import { ConditionEntry } from "./ConditionEntry";
import { ConditionArgument } from "./ConditionArgument";
import { ConditionArgumentMandatory } from "./ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./ConditionArgumentOptional";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";

export class ConditionArguments implements Node<ConditionArgumentsType> {
  type: ConditionArgumentsType = "ConditionArguments";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: ConditionEntry;

  diagnostics: Diagnostic[] = [];

  indent: number;
  // argumentsStrs: string[] = [];
  argumentsMandatory: ConditionArgument[] = [];
  argumentsOptional: ConditionArgument[] = [];

  constructor(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig?: ElementKind<Condition>, parent?: ConditionEntry) {
    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;
    this.indent = indent;

    // Split argumentsStr by whitespaces, with respect to quotes ("")
    let argumentsStrs: string[] = [];
    const regex = /(?:\"[^\"]*?\"|\'[^\']*?\')\s*|\S+\s*/g; // keep quotes and tailing whitespaces
    // const regex = /((?:\"[^\"]*?\"|\'[^\']*?\'))|(\S+)/g; // keep quotes
    // const regex = /(?:\"([^\"]*?)\"|\'([^\']*?)\')|(\S+)/g; // without quotes or whitespaces
    let matched: RegExpExecArray | null;
    let posInit: number | undefined;
    while ((matched = regex.exec(argumentsSourceStr)) !== null) {
      posInit = posInit ?? matched.index;
      argumentsStrs.push(matched[0]);
    }

    // Search ArgumentsPatterns from V1 Condition List
    const argumentsPatterns: ArgumentsPatterns = kindConfig?.argumentsPatterns ?? { mandatory: [{ name: 'unspecified', type: '*', defaultValue: '' }] };

    // Cache arguments
    let argumentOptionalStrs: string[] = [];
    let argumentMandatoryStrs: string[] = [];

    if (argumentsPatterns.optional && argumentsPatterns.optional.length > 0) {
      // With optional args
      if (argumentsPatterns.optionalAtFirst) {
        // Optional at begining
        for (let pos = 0; pos < argumentsStrs.length && pos < argumentsPatterns.optional.length; pos++) {
          // Check if this is an existing optional arg. If so, append it.
          const found = argumentsPatterns.optional?.find(p => argumentsStrs[pos].startsWith(p.key + ":"));
          if (found) {
            argumentOptionalStrs.push(argumentsStrs[pos]);
            continue;
          }
          // If there are no more optional args, append the rest as mandatory args.
          if (argumentsPatterns.keepWhitespaces) {
            // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
            if (argumentsPatterns.mandatory.length > 1) {
              const nonWhitespaceArgsPos = pos + argumentsPatterns.mandatory.length - 1;
              argumentMandatoryStrs.push(argumentsStrs.slice(pos, nonWhitespaceArgsPos).join()); // Normal mandatory args
              argumentMandatoryStrs.push(argumentsStrs.slice(nonWhitespaceArgsPos).join()); // Whitespace args
            } else {
              argumentMandatoryStrs.push(argumentsStrs.slice(pos).join());
            }
          } else {
            // No need to keep whitespaces
            argumentMandatoryStrs = argumentsStrs.slice(pos);
          }
          break;
        }
        // this.argumentsStrs = [...argumentOptionalStrs, ...argumentMandatoryStrs];
      } else {
        // Optional at end
        for (let pos = argumentsStrs.length - 1; pos > -1; pos--) {
          // Check if this is an existing optional arg. If so, append it.
          const found = argumentsPatterns.optional.find(p => argumentsStrs[pos].startsWith(p.key + ":"));
          if (found) {
            argumentOptionalStrs.unshift(argumentsStrs[pos]);
            continue;
          }
          // If there are no more optional args, append the rest as mandatory args.
          if (argumentsPatterns.keepWhitespaces) {
            // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
            if (argumentsPatterns.mandatory.length > 1 && argumentsStrs.length > 1) {
              const nonWhitespaceArgsPos = pos - 1;
              argumentMandatoryStrs.push(argumentsStrs.slice(0, nonWhitespaceArgsPos).join()); // Normal mandatory args
              argumentMandatoryStrs.push(argumentsStrs.slice(nonWhitespaceArgsPos, pos).join()); // Whitespaceargs
            } else if (argumentsStrs.length > 0) {
              argumentMandatoryStrs.push(argumentsStrs.slice(0, pos).join());
            }
          } else {
            // No need to keep whitespaces
            argumentMandatoryStrs = argumentsStrs.slice(0, pos);
          }
          break;
        }
        // this.argumentsStrs = [...argumentOptionalStrs, ...argumentMandatoryStrs];
      }
    } else {
      // No optional arg, only mandatory
      if (argumentsPatterns.keepWhitespaces) {
        // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
        if (argumentsPatterns.mandatory.length > 1 && argumentsStrs.length > 1) {
          const nonWhitespaceArgsPos = argumentsPatterns.mandatory.length - 1;
          argumentMandatoryStrs.push(argumentsStrs.slice(0, nonWhitespaceArgsPos).join()); // Normal mandatory args
          argumentMandatoryStrs.push(argumentsStrs.slice(nonWhitespaceArgsPos).join()); // Whitespaceargs
        } else if (argumentsStrs.length > 0) {
          argumentMandatoryStrs = [argumentsStrs.join()];
        }
      } else {
        // No need to keep whitespaces
        argumentMandatoryStrs = argumentsStrs;
      }
      // this.argumentsStrs = argumentMandatoryStrs;
    }

    // Calculate arguments range and parse them
    let offsetStart = this.offsetStart ?? 0;
    if (argumentsPatterns.optionalAtFirst) {
      // Parse optional arguments
      offsetStart = this.assignArgumentsOptional(argumentOptionalStrs, offsetStart, argumentsPatterns.optional);
      // Parse mandatory arguments
      this.assignArgumentsMandatory(argumentMandatoryStrs, offsetStart, argumentsPatterns.mandatory);
    } else {
      // Parse mandatory arguments
      offsetStart = this.assignArgumentsMandatory(argumentMandatoryStrs, offsetStart, argumentsPatterns.mandatory);
      // Parse optional arguments
      this.assignArgumentsOptional(argumentOptionalStrs, offsetStart, argumentsPatterns.optional);
    }
  }

  private assignArgumentsMandatory(argumentMandatoryStrs: string[], offsetStart: number, patterns: ArgumentsPatternMandatory[]) {
    patterns.forEach((pattern, i) => {
      const argStr = argumentMandatoryStrs[i];
      if (argStr) {
        const str = argStr.trimEnd();
        this.argumentsMandatory.push(new ConditionArgumentMandatory(
          str,
          [offsetStart, offsetStart + str.length],
          pattern,
          this
        ));
        offsetStart += argStr.length;
      } else {
        // Missing mandatory Arugment.
        // Add Diagnotistics
        this.diagnostics.push({
          severity: DiagnosticSeverity.Error,
          code: DiagnosticCode.ArgumentMandatoryMissing,
          message: `Missing mandatory argument: ${pattern.name}.\nExample value: ${pattern.defaultValue}`,
          range: this.parent!.getRangeByOffset(offsetStart, offsetStart)
        });
        // Create dummy Argument
        this.argumentsMandatory.push(new ConditionArgumentMandatory(
          "",
          [offsetStart, offsetStart],
          pattern,
          this
        ));
      }
    });
    return offsetStart;
  }

  private assignArgumentsOptional(argumentOptionalStrs: string[], offsetStart: number, patterns?: ArgumentsPatternOptional[]) {
    argumentOptionalStrs.forEach(argStr => {
      const str = argStr.trimEnd();
      const pattern = patterns?.find(p => argStr.startsWith(p.key + ":"))!;
      this.argumentsOptional.push(new ConditionArgumentOptional(
        str,
        [offsetStart, offsetStart + str.length],
        pattern,
        this
      ));
      offsetStart += argStr.length;
    });
    return offsetStart;
  }

  getDiagnostics(): Diagnostic[] {
    const diagnostics: Diagnostic[] = this.diagnostics;
    // From Child arguments
    if (this.argumentsMandatory) {
      diagnostics.push(...this.argumentsMandatory.flatMap(a => a.getDiagnostics()));
    }
    if (this.argumentsOptional) {
      diagnostics.push(...this.argumentsOptional.flatMap(a => a.getDiagnostics()));
    }
    return diagnostics;
  }

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    if (this.offsetStart !== undefined && this.offsetEnd !== undefined && this.offsetStart <= offset && this.offsetEnd >= offset) {
      return [];
    }
    return [];
  }
}