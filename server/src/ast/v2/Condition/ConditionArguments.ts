import { CompletionItem, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentsPatternMandatory, ArgumentsPatternOptional, ArgumentsPatterns } from "betonquest-utils/betonquest/Arguments";
import Condition from "betonquest-utils/betonquest/Condition";
import { ElementKind } from "betonquest-utils/betonquest/v2/Element";

import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { HoverInfo } from "../../../utils/hover";
import { ConditionArgumentsType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConditionArgumentMandatory } from "./ConditionArgumentMandatory";
import { ConditionArgumentOptional } from "./ConditionArgumentOptional";
import { ConditionEntry } from "./ConditionEntry";

export class ConditionArguments extends AbstractNodeV2<ConditionArgumentsType> {
  readonly type: ConditionArgumentsType = "ConditionArguments";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionEntry;

  private argumentsStrs: string[] = [];
  private indent: number;
  private kindConfig: ElementKind<Condition>;
  private isMandatoryArgumentIncomplete: boolean = false;

  constructor(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig: ElementKind<Condition>, parent: ConditionEntry) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;
    this.indent = indent;
    this.kindConfig = kindConfig;

    // Split argumentsStr by whitespaces, with respect to quotes ("")
    const regex = /(?:\"[^\"]*?\"|\'[^\']*?\')\s*|\S+\s*/g; // keep quotes and tailing whitespaces
    // const regex = /((?:\"[^\"]*?\"|\'[^\']*?\'))|(\S+)/g; // keep quotes
    // const regex = /(?:\"([^\"]*?)\"|\'([^\']*?)\')|(\S+)/g; // without quotes or whitespaces
    let matched: RegExpExecArray | null;
    let posInit: number | undefined;
    while ((matched = regex.exec(argumentsSourceStr)) !== null) {
      posInit = posInit ?? matched.index;
      this.argumentsStrs.push(matched[0]);
    }

    // Search ArgumentsPatterns from V2 Element List
    const argumentsPatterns: ArgumentsPatterns = this.kindConfig.argumentsPatterns ?? { mandatory: [{ name: 'unspecified', format: '*', defaultValue: '' }] };

    // Cache arguments
    let argumentOptionalStrs: string[] = [];
    let argumentMandatoryStrs: string[] = [];

    if (argumentsPatterns.optional && argumentsPatterns.optional.length > 0) {
      // With optional args
      if (argumentsPatterns.optionalAtFirst) {
        // Optional at begining
        for (let pos = 0; pos < this.argumentsStrs.length && pos < argumentsPatterns.optional.length; pos++) {
          // Check if this is an existing optional arg. If so, append it.
          const found = argumentsPatterns.optional?.find(p => this.argumentsStrs[pos].startsWith(p.key + ":"));
          if (found) {
            argumentOptionalStrs.push(this.argumentsStrs[pos]);
            continue;
          }
          // If there are no more optional args, append the rest as mandatory args.
          if (argumentsPatterns.keepWhitespaces) {
            // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
            if (argumentsPatterns.mandatory.length > 1) {
              const nonWhitespaceArgsPos = pos + argumentsPatterns.mandatory.length - 1;
              argumentMandatoryStrs.push(this.argumentsStrs.slice(pos, nonWhitespaceArgsPos).join()); // Normal mandatory args
              argumentMandatoryStrs.push(this.argumentsStrs.slice(nonWhitespaceArgsPos).join()); // Whitespace args
            } else {
              argumentMandatoryStrs.push(this.argumentsStrs.slice(pos).join());
            }
          } else {
            // No need to keep whitespaces
            argumentMandatoryStrs = this.argumentsStrs.slice(pos);
          }
          break;
        }
        // this.argumentsStrs = [...argumentOptionalStrs, ...argumentMandatoryStrs];
      } else {
        // Optional at end
        for (let pos = this.argumentsStrs.length - 1; pos > -1; pos--) {
          // Check if this is an existing optional arg. If so, append it.
          const found = argumentsPatterns.optional.find(p => this.argumentsStrs[pos].startsWith(p.key + ":"));
          if (found) {
            argumentOptionalStrs.unshift(this.argumentsStrs[pos]);
            continue;
          }
          // If there are no more optional args, append the rest as mandatory args.
          if (argumentsPatterns.keepWhitespaces) {
            // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
            if (argumentsPatterns.mandatory.length > 1 && this.argumentsStrs.length > 1) {
              const nonWhitespaceArgsPos = argumentsPatterns.mandatory.length - 1;
              argumentMandatoryStrs.push(this.argumentsStrs.slice(0, nonWhitespaceArgsPos).join()); // Normal mandatory args
              argumentMandatoryStrs.push(this.argumentsStrs.slice(nonWhitespaceArgsPos, pos + 1).join()); // Whitespaceargs
            } else if (this.argumentsStrs.length > 0) {
              argumentMandatoryStrs.push(this.argumentsStrs.slice(0, pos + 1).join());
            }
          } else {
            // No need to keep whitespaces
            argumentMandatoryStrs = this.argumentsStrs.slice(0, pos + 1);
          }
          break;
        }
        // this.argumentsStrs = [...argumentOptionalStrs, ...argumentMandatoryStrs];
      }
    } else {
      // No optional arg, only mandatory
      if (argumentsPatterns.keepWhitespaces) {
        // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
        if (argumentsPatterns.mandatory.length > 1 && this.argumentsStrs.length > 1) {
          const nonWhitespaceArgsPos = argumentsPatterns.mandatory.length - 1;
          argumentMandatoryStrs.push(this.argumentsStrs.slice(0, nonWhitespaceArgsPos).join()); // Normal mandatory args
          argumentMandatoryStrs.push(this.argumentsStrs.slice(nonWhitespaceArgsPos).join()); // Whitespaceargs
        } else if (this.argumentsStrs.length > 0) {
          argumentMandatoryStrs = [this.argumentsStrs.join()];
        }
      } else {
        // No need to keep whitespaces
        argumentMandatoryStrs = this.argumentsStrs;
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
    let previousStrOffsetEnd = offsetStart;
    patterns.forEach((pattern, i) => {
      const argStr = argumentMandatoryStrs[i];
      if (argStr) {
        const str = argStr.trimEnd();
        this.addChild(new ConditionArgumentMandatory(
          str,
          [offsetStart, offsetStart + str.length],
          pattern,
          this
        ));
        previousStrOffsetEnd = offsetStart + str.length;
        offsetStart += argStr.length;
      } else {
        // Missing mandatory Arugment.
        // Add Diagnotistics
        this.addDiagnostic(
          [previousStrOffsetEnd, offsetStart],
          `Missing mandatory argument: ${pattern.name}.\nExample value: ${pattern.defaultValue}`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentMandatoryMissing,
        );
        // Create dummy Argument for auto-complete
        if (!this.isMandatoryArgumentIncomplete) {
          this.addChild(new ConditionArgumentMandatory(
            "",
            [offsetStart, offsetStart],
            pattern,
            this
          ));
        }
        // Break on the first empty mandatory Argument, preventing multiple auto-complete being prompted
        this.isMandatoryArgumentIncomplete = true;
      }
    });
    return offsetStart;
  }

  private assignArgumentsOptional(argumentOptionalStrs: string[], offsetStart: number, patterns?: ArgumentsPatternOptional[]) {
    // Cache founded patterns for un-entered optional arguments auto-complete promption
    const foundPatterns: ArgumentsPatternOptional[] = [];

    // Parse optional argument
    argumentOptionalStrs.forEach(argStr => {
      const str = argStr.trimEnd();
      const pattern = patterns?.find(p => argStr.startsWith(p.key + ":"));
      if (pattern) {
        foundPatterns.push(pattern);
        this.addChild(new ConditionArgumentOptional(
          str,
          [offsetStart, offsetStart + str.length],
          pattern,
          this
        ));
      } else {
        // Ignore unknown optional argument key
      }
      offsetStart += argStr.length;
    });

    // Create dummy Argument for auto-complete
    if (!this.isMandatoryArgumentIncomplete) { // Create dummy args / prompt optional auto-complete only when mandatory argument is complete.
      patterns?.filter(p => !foundPatterns.find(f => f.key === p.key)).forEach((pattern, i) => {
        this.addChild(new ConditionArgumentOptional(
          "",
          [offsetStart, offsetStart],
          pattern,
          this
        ));
      });
    }

    return offsetStart;
  }

  private _getArgumentMandatorys() {
    return this.getChildren<ConditionArgumentMandatory>('ConditionArgumentMandatory');
  }

  private _getArgumentOptionals() {
    return this.getChildren<ConditionArgumentOptional>('ConditionArgumentOptional');
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

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    return [
      ...super.getCompletions(offset, documentUri)
    ];
  }
}
