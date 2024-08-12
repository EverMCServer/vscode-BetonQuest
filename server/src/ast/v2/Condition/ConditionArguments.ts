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

// TODO: rename to "parameters"
export class ConditionArguments extends AbstractNodeV2<ConditionArgumentsType> {
  readonly type: ConditionArgumentsType = "ConditionArguments";
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionEntry;

  private argumentsStrs: string[] = [];
  private indent: number;
  readonly kindConfig: ElementKind<Condition>;

  private isMandatoryArgumentIncomplete: boolean = false;

  // Cache splited argument strings
  readonly argumentMandatoryStrs: string[] = [];
  readonly argumentOptionalStrs: string[] = [];

  /**
   * Cache the key offsets of each devided argument
   * `<offsetStart>argument_string<stringEnd>(empty_spaces)<offsetEnd>`
   */
  private keyOffsets: [offsetStart: number, stringEnd: number, offsetEnd: number][] = [];

  constructor(argumentsSourceStr: string, range: [number?, number?], indent: number, kindConfig: ElementKind<Condition>, parent: ConditionEntry) {
    super();
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;
    this.indent = indent;
    this.kindConfig = kindConfig;

    // Split argumentsStr by whitespaces, with respect to quotes ("")
    // const regex = /(?:\"[^\"]*?\"|\'[^\']*?\')\s*|\S+\s*/g; // keep quotes and tailing whitespaces
    const regex = /\s*(?:\"[^\"]*?\"|\'[^\']*?\')|\s*\S*/g; // keep quotes and heading whitespaces
    // const regex = /((?:\"[^\"]*?\"|\'[^\']*?\'))|(\S+)/g; // keep quotes
    // const regex = /(?:\"([^\"]*?)\"|\'([^\']*?)\')|(\S+)/g; // without quotes or whitespaces
    let matched: RegExpExecArray | null;
    while ((matched = regex.exec(argumentsSourceStr)) !== null) {
      if (!matched[0]) {
        break;
      }
      this.argumentsStrs.push(matched[0]);
    }

    // Search ArgumentsPatterns from V2 Element List
    const argumentsPatterns: ArgumentsPatterns = this.kindConfig.argumentsPatterns ?? { mandatory: [{ name: 'unspecified', format: '*', defaultValue: '' }] };

    if (argumentsPatterns.optional && argumentsPatterns.optional.length > 0) {
      // With optional args
      if (argumentsPatterns.optionalAtFirst) {
        // Optional at begining
        for (let pos = 0; pos < this.argumentsStrs.length && pos < argumentsPatterns.optional.length; pos++) {
          // Check if this is an existing optional arg. If so, append it.
          const found = argumentsPatterns.optional?.find(p => this.argumentsStrs[pos].trimStart().startsWith(p.key));
          if (found) {
            this.argumentOptionalStrs.push(this.argumentsStrs[pos]);
            continue;
          }
          // If there are no more optional args, append the rest as mandatory args.
          if (argumentsPatterns.keepWhitespaces) {
            // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
            if (argumentsPatterns.mandatory.length > 1) {
              const nonWhitespaceArgsPos = pos + argumentsPatterns.mandatory.length - 1;
              this.argumentMandatoryStrs.push(this.argumentsStrs.slice(pos, nonWhitespaceArgsPos).join()); // Normal mandatory args
              this.argumentMandatoryStrs.push(this.argumentsStrs.slice(nonWhitespaceArgsPos).join()); // Whitespace args
            } else {
              this.argumentMandatoryStrs.push(this.argumentsStrs.slice(pos).join());
            }
          } else {
            // No need to keep whitespaces
            this.argumentMandatoryStrs = this.argumentsStrs.slice(pos, argumentsPatterns.mandatory.length);
            // TODO: Throw warning on extra arguments
          }
          break;
        }
        // this.argumentsStrs = [...argumentOptionalStrs, ...argumentMandatoryStrs];
      } else {
        // Optional at end
        for (let pos = this.argumentsStrs.length - 1; pos > -1; pos--) {
          // Check if this is an existing optional arg. If so, append it.
          const found = argumentsPatterns.optional.find(p => this.argumentsStrs[pos].trimStart().startsWith(p.key));
          if (found) {
            this.argumentOptionalStrs.unshift(this.argumentsStrs[pos]);
            continue;
          }
          // If there are no more optional args, append the rest as mandatory args.
          if (argumentsPatterns.keepWhitespaces) {
            // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
            if (argumentsPatterns.mandatory.length > 1 && this.argumentsStrs.length > 1) {
              const nonWhitespaceArgsPos = argumentsPatterns.mandatory.length - 1;
              this.argumentMandatoryStrs.push(this.argumentsStrs.slice(0, nonWhitespaceArgsPos).join()); // Normal mandatory args
              this.argumentMandatoryStrs.push(this.argumentsStrs.slice(nonWhitespaceArgsPos, pos + 1).join()); // Whitespaceargs
            } else if (this.argumentsStrs.length > 0) {
              this.argumentMandatoryStrs.push(this.argumentsStrs.slice(0, pos + 1).join());
            }
          } else {
            // No need to keep whitespaces
            // Only put the required amount of  arguments into the mandatory array, the rest goes to optional array
            if (pos + 1 > this.kindConfig.argumentsPatterns.mandatory.length) {
              this.argumentMandatoryStrs = this.argumentsStrs.slice(0, this.kindConfig.argumentsPatterns.mandatory.length);
              this.argumentOptionalStrs.unshift(...this.argumentsStrs.slice(this.kindConfig.argumentsPatterns.mandatory.length, pos + 1));
            } else {
              this.argumentMandatoryStrs = this.argumentsStrs.slice(0, pos + 1);
            }
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
          this.argumentMandatoryStrs.push(this.argumentsStrs.slice(0, nonWhitespaceArgsPos).join()); // Normal mandatory args
          this.argumentMandatoryStrs.push(this.argumentsStrs.slice(nonWhitespaceArgsPos).join()); // Whitespaceargs
        } else if (this.argumentsStrs.length > 0) {
          this.argumentMandatoryStrs = [this.argumentsStrs.join()];
        }
      } else {
        // No need to keep whitespaces
        this.argumentMandatoryStrs = this.argumentsStrs.slice(0, argumentsPatterns.mandatory.length);
        // TODO: Throw warning on extra arguments
      }
      // this.argumentsStrs = argumentMandatoryStrs;
    }

    // Calculate arguments range and parse them
    let offsetStart = this.offsetStart ?? 0;
    if (argumentsPatterns.optionalAtFirst) {
      // Parse optional arguments
      offsetStart = this.assignArgumentsOptional(this.argumentOptionalStrs, offsetStart, argumentsPatterns.optional);
      // Parse mandatory arguments
      this.assignArgumentsMandatory(this.argumentMandatoryStrs, offsetStart, argumentsPatterns.mandatory);
    } else {
      // Parse mandatory arguments
      offsetStart = this.assignArgumentsMandatory(this.argumentMandatoryStrs, offsetStart, argumentsPatterns.mandatory);
      // Parse optional arguments
      this.assignArgumentsOptional(this.argumentOptionalStrs, offsetStart, argumentsPatterns.optional);
    }
  }

  private assignArgumentsMandatory(argumentMandatoryStrs: string[], offsetStart: number, patterns: ArgumentsPatternMandatory[]) {
    argumentMandatoryStrs.forEach((argStr, i) => {
      const pattern = patterns[i];
      const str = argStr.trimStart();
      const offsets: [offsetStart: number, stringStart: number, offsetEnd: number] = [offsetStart, offsetStart + argStr.length - str.length, offsetStart + argStr.length];
      this.keyOffsets.push(offsets);
      if (str) {
        this.addChild(new ConditionArgumentMandatory(
          str,
          offsets, // [offsets[1], offsets[2]],
          pattern,
          this
        ));
        offsetStart = offsets[2];
      } else {
        // Missing mandatory arugment.
        // Add Diagnotistics
        this.addDiagnostic(
          [offsets[0], offsets[2]],
          `Missing mandatory argument: ${pattern.name}.\nExample value: ${pattern.defaultValue}`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentMandatoryMissing,
        );
        // Mark mandatory argument is incomplete.
        this.isMandatoryArgumentIncomplete = true;
        // Add dummy mandatory arugment for auto-complete promption
        this.addChild(new ConditionArgumentMandatory(
          str,
          offsets, // [offsets[1], offsets[2]],
          pattern,
          this
        ));
      }
    });
    return offsetStart;
  }

  private assignArgumentsOptional(argumentOptionalStrs: string[], offsetStart: number, patterns?: ArgumentsPatternOptional[]) {
    // Cache founded patterns for un-entered optional arguments auto-complete promption
    const foundPatterns: ArgumentsPatternOptional[] = [];

    // Parse optional argument
    argumentOptionalStrs.forEach(argStr => {
      const str = argStr.trimStart();
      const offsets: [offsetStart: number, stringStart: number, offsetEnd: number] = [offsetStart, offsetStart + argStr.length - str.length, offsetStart + argStr.length];
      this.keyOffsets.push(offsets);
      offsetStart = offsets[2];
      if (str) {
        const pattern = patterns?.find(p => str.startsWith(p.key));
        if (pattern) {
          foundPatterns.push(pattern);
          this.addChild(new ConditionArgumentOptional(
            str,
            offsets,
            pattern,
            this
          ));
          return;
        }
      }
      // Create dummy optional arguments for auto-complete promption
      // this.kindConfig.argumentsPatterns.optional?.filter(p => !foundPatterns.some(f => f.key === p.key))
      //   .forEach(p => {
      //     this.addChild(new ConditionArgumentOptional(
      //       str,
      //       offsets,
      //       p,
      //       this
      //     ));
      //   });
      this.addChild(new ConditionArgumentOptional(
        str,
        offsets,
        undefined,
        this
      ));
    });


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
    // // Prompt argument suggestions
    // // 1. Iterate keyOffsets, check if the offset is in the desired range.
    // const i = this.keyOffsets.findIndex(keyOffset => keyOffset[0] < offset && offset <= keyOffset[1]);
    // if (i > -1) {
    //   // 2. Determine if mandatory arg should be prompted
    //   // const mandatoryCount = this.argumentMandatoryStrs.filter(s => s.trim()).length;
    //   if (
    //     // mandatoryCount < this.kindConfig.argumentsPatterns.mandatory.length && // Not enough mandatory arguments
    //     i < this.kindConfig.argumentsPatterns.mandatory.length // Position is in between desinated range
    //   ) {
    //     console.log("Prompt mandatory"); // DEBUG
    //   }

    //   // 3. Determine if optional arg should be prompted
    //   // const optionalCount = this.argumentOptionalStrs.filter(s => s.trim()).length;
    //   if (
    //     // this.kindConfig.argumentsPatterns.optional && // There are optional arguments
    //     // optionalCount < this.kindConfig.argumentsPatterns.optional?.length &&  // Not enough optional arguments
    //     i >= this.kindConfig.argumentsPatterns.mandatory.length // Position is in between desinated range
    //   ) {
    //     console.log("Prompt optional"); // DEBUG
    //   }
    // }
    return [
      ...super.getCompletions(offset, documentUri)
    ];
  }
}
