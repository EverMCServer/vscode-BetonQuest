import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional, ArgumentsPatterns } from "betonquest-utils/betonquest/Arguments";
import Objective from "betonquest-utils/betonquest/Objective";
import { ElementKind } from "betonquest-utils/betonquest/v2/Element";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { ObjectiveArgumentsType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ObjectiveArgumentMandatory } from "./ObjectiveArgumentMandatory";
import { ObjectiveArgumentOptional } from "./ObjectiveArgumentOptional";
import { ObjectiveEntry } from "./ObjectiveEntry";

export class ObjectiveArguments extends AbstractNodeV2<ObjectiveArgumentsType> {
  readonly type: ObjectiveArgumentsType = "ObjectiveArguments";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ObjectiveEntry;

  private indent: number;

  constructor(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig: ElementKind<Objective>, parent: ObjectiveEntry) {
    super();
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

    // Search ArgumentsPatterns from V2 Element List
    const argumentsPatterns: ArgumentsPatterns = kindConfig?.argumentsPatterns ?? { mandatory: [{ name: 'unspecified', format: '*', defaultValue: '' }] };

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
              const nonWhitespaceArgsPos = argumentsPatterns.mandatory.length - 1;
              argumentMandatoryStrs.push(argumentsStrs.slice(0, nonWhitespaceArgsPos).join()); // Normal mandatory args
              argumentMandatoryStrs.push(argumentsStrs.slice(nonWhitespaceArgsPos, pos + 1).join()); // Whitespaceargs
            } else if (argumentsStrs.length > 0) {
              argumentMandatoryStrs.push(argumentsStrs.slice(0, pos + 1).join());
            }
          } else {
            // No need to keep whitespaces
            argumentMandatoryStrs = argumentsStrs.slice(0, pos + 1);
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
    let dummymMandatoryArgumentCreated = false;
    patterns.forEach((pattern, i) => {
      const argStr = argumentMandatoryStrs[i];
      if (argStr) {
        const str = argStr.trimEnd();
        this.addChild(new ObjectiveArgumentMandatory(
          str,
          [offsetStart, offsetStart + str.length],
          pattern,
          this
        ));
        offsetStart += argStr.length;
      } else {
        // Missing mandatory Arugment.
        // Add Diagnotistics
        this.addDiagnostic(
          [offsetStart, offsetStart],
          `Missing mandatory argument: ${pattern.name}.\nExample value: ${pattern.defaultValue}`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentMandatoryMissing,
        );
        // Create dummy Argument for auto-complete
        if (!dummymMandatoryArgumentCreated) {
          this.addChild(new ObjectiveArgumentMandatory(
            "",
            [offsetStart, offsetStart],
            pattern,
            this
          ));
        }
        // Break on the first empty mandatory Argument, preventing multiple auto-complete being prompted
        dummymMandatoryArgumentCreated = true;
      }
    });
    return offsetStart;
  }

  private assignArgumentsOptional(argumentOptionalStrs: string[], offsetStart: number, patterns?: ArgumentsPatternOptional[]) {
    patterns?.forEach((pattern, i) => {
      const argStr = argumentOptionalStrs.find(argStr => argStr.startsWith(pattern.key + ":"))?.trimEnd();
      if (argStr) {
        const str = argStr?.trimEnd();
        this.addChild(new ObjectiveArgumentOptional(
          str,
          [offsetStart, offsetStart + str.length],
          pattern,
          this
        ));
        offsetStart += argStr.length;
      }
    });

    return offsetStart;
  }

  private _getArgumentMandatorys() {
    return this.getChildren<ObjectiveArgumentMandatory>('ObjectiveArgumentMandatory');
  }

  private _getArgumentOptionals() {
    return this.getChildren<ObjectiveArgumentOptional>('ObjectiveArgumentOptional');
  }

  getDiagnostics(): Diagnostic[] {
    const diagnostics: Diagnostic[] = this.diagnostics;
    // From Child arguments
    diagnostics.push(...this.children.flatMap(a => a.getDiagnostics()));
    return diagnostics;
  }

  getSemanticTokens(): SemanticToken[] {
    if (this.offsetStart === undefined || this.offsetEnd === undefined) {
      return [];
    }
    const semanticTokens: SemanticToken[] = [{
      offsetStart: this.offsetStart,
      offsetEnd: this.offsetEnd,
      tokenType: SemanticTokenType.InstructionArguments
    }];
    semanticTokens.push(...this.children.flatMap(a => a.getSemanticTokens()));
    return semanticTokens;
  }

  getHoverInfo(offset: number): HoverInfo[] {
    return [];
  }
}
