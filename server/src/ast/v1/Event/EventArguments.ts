import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ArgumentsPatterns } from "betonquest-utils/betonquest/Arguments";
import { kinds } from "betonquest-utils/betonquest/v1/Events";

import { EventArgumentsType, Node } from "../../node";
import { EventEntry } from "./EventEntry";
import { EventArgument } from "./EventArgument";
import { EventArgumentMandatory } from "./EventArgumentMandatory";
import { EventArgumentOptional } from "./EventArgumentOptional";
import { DiagnosticCode } from "../../../utils/diagnostics";

export class EventArguments implements Node<EventArgumentsType> {
  type: "EventArguments" = "EventArguments";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventEntry;

  diagnostics: Diagnostic[] = [];

  indent: number;
  argumentsStrs: string[] = [];
  arguments: EventArgument[] = [];

  constructor(kindStr: string, argumentsSourceStr: string, range: [number?, number?], indent: number, parent?: EventEntry) {
    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;
    this.indent = indent;

    // Search ArgumentsPatterns from V1 Event List
    const kindConfig = kinds.find(k => k.value === kindStr) ?? kinds.find(k => k.value === "*");
    const argumentsPatterns: ArgumentsPatterns = kindConfig?.argumentsPatterns ?? { mandatory: [{ name: 'unspecified', type: '*', defaultValue: '' }] };

    // Split argumentsStr by whitespaces, with respect to quotes ("")
    const regex = /(?:\"[^\"]*?\"|\'[^\']*?\')\s*|\S+\s*/g; // keep quotes and whitespaces
    // const regex = /((?:\"[^\"]*?\"|\'[^\']*?\'))|(\S+)/g; // keep quotes
    // const regex = /(?:\"([^\"]*?)\"|\'([^\']*?)\')|(\S+)/g; // without quotes or whitespaces
    let array1: RegExpExecArray | null;
    let posInit: number | undefined;
    while ((array1 = regex.exec(argumentsSourceStr)) !== null) {
      posInit = posInit ?? array1.index;
      let matched = array1[0];
      this.argumentsStrs.push(matched);
    }

    // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
    if (argumentsPatterns.keepWhitespaces) {
      let newArgStrs = [argumentsSourceStr];
      if (argumentsPatterns.optional && argumentsPatterns.optional.length) {
        // With optional args
        if (argumentsPatterns.optionalAtFirst) {
          this.argumentsStrs.every((v, i) => {
            if (/(?<!\\):/g.test(v)) {
              newArgStrs = [
                ...this.argumentsStrs.slice(0, i + argumentsPatterns.mandatory.length).map(value => value.replace(/\s$/, "")),
                this.argumentsStrs.slice(i + argumentsPatterns.mandatory.length).join('')
              ];
              return true;
            }
            return false;
          });
        } else {
          this.argumentsStrs.some((v, i) => {
            if (/(?<!\\):/g.test(v)) {
              newArgStrs = [
                ...this.argumentsStrs.slice(0, argumentsPatterns.mandatory.length - 1).map(value => value.replace(/\s$/, "")),
                this.argumentsStrs.slice(argumentsPatterns.mandatory.length - 1, i).join('').replace(/\s$/, ""),
                ...this.argumentsStrs.slice(i).map(value => value.replace(/\s$/, ""))
              ];
              return true;
            }
            return false;
          });
        }
      } else if (argumentsPatterns.mandatory.length > 1) {
        // No optional arg, only mandatory
        newArgStrs = [
          ...this.argumentsStrs.slice(0, argumentsPatterns.mandatory.length - 1).map(value => value.replace(/\s$/, "")),
          this.argumentsStrs.slice(argumentsPatterns.mandatory.length - 1).join('')
        ];
      }
      this.argumentsStrs = newArgStrs;
    }

    // // Cache parsed Arguments, for tracking
    // const parsedArguments: Map<number, boolean> = new Map();
    // this.argumentsStrs.forEach((_, i) => {
    //   parsedArguments.set(i, false);
    // });

    // // Create Arguments
    // if (argumentsPatterns.optionalAtFirst) {
    //   // Mode: optionals + mandatory

    //   let argumentStrOffsetCursor = 0; // Cache offset
    //   this.argumentsStrs.forEach((argumentStr, i) => {
    //     // Calculate offset
    //     const offsetStart = this.offsetStart ? this.offsetStart + argumentStrOffsetCursor : this.offsetStart;
    //     argumentStrOffsetCursor += argumentStr.length;
    //     const offsetEnd = this.offsetStart ? this.offsetStart + argumentStrOffsetCursor : this.offsetStart;
    //     // Parse mandatory arguments
    //     if (i === this.argumentsStrs.length - 1) {
    //       this.arguments.push(new EventArgument(argumentStr, [offsetStart, offsetEnd], argumentsPatterns.mandatory[0], this));
    //       return;
    //     }
    //     // Parse optional arguments
    //     // Find pattern from optional args
    //     const pattern = argumentsPatterns.optional?.find(pattern => {
    //       if (argumentStr.startsWith(pattern.key)) {
    //         return true;
    //       }
    //       return false;
    //     });
    //     if (pattern) {
    //       // Append to arguments
    //       this.arguments.push(new EventArgument(argumentStr, [offsetStart, offsetEnd], pattern, this));
    //       // Mark parsed key
    //       // parsedArguments.set(i, true);
    //     }
    //   });

    //   // // #2
    //   // // Parse mandatory arguments
    //   // // ...
    //   // // Parse optional arguments
    //   // argumentsPatterns.optional?.forEach(pattern => {
    //   //   // Find the first matched arguments by key
    //   //   const argumentStrIndex = this.argumentsStrs.findIndex((s, i) => {
    //   //     if (s.startsWith(pattern.key)) {
    //   //       return true;
    //   //     }
    //   //     return false;
    //   //   });
    //   //   // Parse it
    //   //   if (argumentStrIndex > -1) {
    //   //     const argumentStr = this.argumentsStrs[argumentStrIndex];
    //   //     // Calculate offset
    //   //     const offsetStart = this.offsetStart ? this.offsetStart + this.argumentsStrs.filter((_, i) => i < argumentStrIndex).concat().length : this.offsetStart;
    //   //     const offsetEnd = offsetStart ? offsetStart + argumentStr.length : offsetStart;
    //   //     // Append to arguments
    //   //     this.arguments.push(new EventArgument(argumentStr, [offsetStart, offsetEnd], pattern, this));
    //   //     // Mark parsed key
    //   //     parsedArguments.set(argumentStrIndex, true);
    //   //   }
    //   // });
    //   // // Parse mandatory arguments
    //   // argumentsPatterns.mandatory?.forEach(pattern => {
    //   //   if (pattern.key) {
    //   //     // Find the first 
    //   //   }
    //   // });
    // } else {
    //   // Mode: mandatories + optionals

    //   let argumentStrOffsetCursor = 0; // Cache offset

    //   this.argumentsStrs.forEach((argumentStr, i) => {
    //     // Calculate offset
    //     const offsetStart = this.offsetStart ? this.offsetStart + argumentStrOffsetCursor : this.offsetStart;
    //     argumentStrOffsetCursor += argumentStr.length;
    //     const offsetEnd = this.offsetStart ? this.offsetStart + argumentStrOffsetCursor : this.offsetStart;

    //     // Parse mandatory arguments
    //     if (i < argumentsPatterns.mandatory.length) {
    //       //
    //     }
    //     // Parse optional arguments
    //   });
    // }

    // Split mandatory and optional arguments
    let mandatoryStrs: string[] = [];
    let optionalStrs: string[] = [];
    if (argumentsPatterns.optionalAtFirst) {
      mandatoryStrs = this.argumentsStrs.filter((_, i) => i >= argumentsPatterns.mandatory.length);
      optionalStrs = this.argumentsStrs.filter((_, i) => i < argumentsPatterns.mandatory.length);
    } else {
      mandatoryStrs = this.argumentsStrs.filter((_, i) => i < argumentsPatterns.mandatory.length);
      optionalStrs = this.argumentsStrs.filter((_, i) => i >= argumentsPatterns.mandatory.length);
    }

    let argumentStrOffsetCursor = 0; // Cache offset

    if (argumentsPatterns.optionalAtFirst) {
      // Parse optional arguments
      let parsedOptional = new Map<number, boolean>();
      optionalStrs.forEach(argumentStr => {
        // Calculate offset
        const offsetStart = this.offsetStart ? this.offsetStart + argumentStrOffsetCursor : this.offsetStart;
        argumentStrOffsetCursor += argumentStr.length;
        const offsetEnd = this.offsetStart ? this.offsetStart + argumentStrOffsetCursor : this.offsetStart;
        const i = argumentsPatterns.optional!.findIndex(pattern => argumentStr.startsWith(pattern.key));
        const pattern = argumentsPatterns.optional![i];
        if (parsedOptional.has(i)) {
          // Duplicated argument
          // const document = TextDocument.create(this.uri, 'yaml', 1, this.parent.content); // TODO: document version, document content
          // this.arguments.push(new EventArgument(argumentStr, [offsetStart, offsetEnd], pattern, this, [{
          //   message: `Duplicated argument "${pattern.key}"`,
          //   severity: DiagnosticSeverity.Error,
          //   range: {
          //     start: offsetStart,
          //     end: offsetEnd
          //   }
          // }]));
        } else {
          // Append to arguments
          this.arguments.push(new EventArgumentMandatory(argumentStr, [offsetStart, offsetEnd], pattern, this));
        }
      });
      // Parse mandatory arguments
      argumentsPatterns.mandatory.forEach((pattern, i) => {
        // Calculate offset
        const offsetStart = this.offsetStart ? this.offsetStart + argumentStrOffsetCursor : this.offsetStart;
        argumentStrOffsetCursor += mandatoryStrs[i].length;
        const offsetEnd = this.offsetStart ? this.offsetStart + argumentStrOffsetCursor : this.offsetStart;
        if (mandatoryStrs[i]) {
          // Append to arguments
          this.arguments.push(new EventArgumentOptional(mandatoryStrs[i], [offsetStart, offsetEnd], pattern, this));
        } else {
          // Missing mandatory arguments
          // Add Diagnotistics
          const _offsetStart = this.offsetStart ?? 0;
          const _offsetEnd = this.offsetEnd ?? 0;
          const diag: Diagnostic = {
            severity: DiagnosticSeverity.Error,
            code: DiagnosticCode.ArgumentMandatoryMissing,
            message: `Missing mandatory argument: ${pattern.name}`,
            range: this.parent!.getRangeByOffset(_offsetStart, _offsetEnd)
          };
          // Create dummy Argument
          this.arguments.push(new EventArgumentOptional(
            mandatoryStrs[i],
            [argumentStrOffsetCursor,
              argumentStrOffsetCursor],
            pattern,
            this,
            [
              diag
            ]
          ));
        }
      });
    }
  }

  getDiagnostics(): Diagnostic[] {
    return this.diagnostics;
  }
}