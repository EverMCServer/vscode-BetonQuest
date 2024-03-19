import { DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { ArgumentsPatterns } from "betonquest-utils/betonquest/Arguments";
import { kinds } from "betonquest-utils/betonquest/v1/Events";

import { EventOptionsType, Node } from "../../node";
import { EventEntry } from "./EventEntry";
import { EventOption } from "./EventOption";

export class EventOptions implements Node<EventOptionsType> {
  type: "EventOptions" = "EventOptions";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventEntry;

  optionsStrs: string[] = [];
  options: EventOption[] = [];

  constructor(optionsStr: string, range: [number?, number?], kindStr: string, parent?: EventEntry) {
    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    // Search ArgumentsPatterns from V1 Event List
    const kindConfig = kinds.find(k => k.value === kindStr) ?? kinds.find(k => k.value === "*");
    const argumentsPatterns: ArgumentsPatterns = kindConfig?.argumentsPatterns ?? { mandatory: [{ name: 'unspecified', type: '*', defaultValue: '' }] };

    // Split optionsStr by whitespaces, with respect to quotes ("")
    const regex = /(?:\"[^\"]*?\"|\'[^\']*?\')\s*|\S+\s*/g; // keep quotes and whitespaces
    // const regex = /((?:\"[^\"]*?\"|\'[^\']*?\'))|(\S+)/g; // keep quotes
    // const regex = /(?:\"([^\"]*?)\"|\'([^\']*?)\')|(\S+)/g; // without quotes or whitespaces
    let array1: RegExpExecArray | null;
    let posInit: number | undefined;
    while ((array1 = regex.exec(optionsStr)) !== null) {
      posInit = posInit ?? array1.index;
      let matched = array1[0];
      this.optionsStrs.push(matched);
    }

    // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
    if (argumentsPatterns.keepWhitespaces) {
      let newArgStrs = [optionsStr];
      if (argumentsPatterns.optional && argumentsPatterns.optional.length) {
        // With optional args
        if (argumentsPatterns.optionalAtFirst) {
          this.optionsStrs.every((v, i) => {
            if (/(?<!\\):/g.test(v)) {
              newArgStrs = [
                ...this.optionsStrs.slice(0, i + argumentsPatterns.mandatory.length).map(value => value.replace(/\s$/, "")),
                this.optionsStrs.slice(i + argumentsPatterns.mandatory.length).join('')
              ];
              return true;
            }
            return false;
          });
        } else {
          this.optionsStrs.some((v, i) => {
            if (/(?<!\\):/g.test(v)) {
              newArgStrs = [
                ...this.optionsStrs.slice(0, argumentsPatterns.mandatory.length - 1).map(value => value.replace(/\s$/, "")),
                this.optionsStrs.slice(argumentsPatterns.mandatory.length - 1, i).join('').replace(/\s$/, ""),
                ...this.optionsStrs.slice(i).map(value => value.replace(/\s$/, ""))
              ];
              return true;
            }
            return false;
          });
        }
      } else if (argumentsPatterns.mandatory.length > 1) {
        // No optional arg, only mandatory
        newArgStrs = [
          ...this.optionsStrs.slice(0, argumentsPatterns.mandatory.length - 1).map(value => value.replace(/\s$/, "")),
          this.optionsStrs.slice(argumentsPatterns.mandatory.length - 1).join('')
        ];
      }
      this.optionsStrs = newArgStrs;
    }

    // // Cache parsed options, for tracking
    // const parsedOptions: Map<number, boolean> = new Map();
    // this.optionsStrs.forEach((_, i) => {
    //   parsedOptions.set(i, false);
    // });

    // // Create Option
    // if (argumentsPatterns.optionalAtFirst) {
    //   // Mode: optionals + mandatory

    //   let optionStrOffsetCursor = 0; // Cache offset
    //   this.optionsStrs.forEach((optionStr, i) => {
    //     // Calculate offset
    //     const offsetStart = this.offsetStart ? this.offsetStart + optionStrOffsetCursor : this.offsetStart;
    //     optionStrOffsetCursor += optionStr.length;
    //     const offsetEnd = this.offsetStart ? this.offsetStart + optionStrOffsetCursor : this.offsetStart;
    //     // Parse mandatory options
    //     if (i === this.optionsStrs.length - 1) {
    //       this.options.push(new EventOption(optionStr, [offsetStart, offsetEnd], argumentsPatterns.mandatory[0], this));
    //       return;
    //     }
    //     // Parse optional options
    //     // Find pattern from optional args
    //     const pattern = argumentsPatterns.optional?.find(pattern => {
    //       if (optionStr.startsWith(pattern.key)) {
    //         return true;
    //       }
    //       return false;
    //     });
    //     if (pattern) {
    //       // Append to options
    //       this.options.push(new EventOption(optionStr, [offsetStart, offsetEnd], pattern, this));
    //       // Mark parsed key
    //       // parsedOptions.set(i, true);
    //     }
    //   });

    //   // // #2
    //   // // Parse mandatory options
    //   // // ...
    //   // // Parse optional options
    //   // argumentsPatterns.optional?.forEach(pattern => {
    //   //   // Find the first matched options by key
    //   //   const optionStrIndex = this.optionsStrs.findIndex((s, i) => {
    //   //     if (s.startsWith(pattern.key)) {
    //   //       return true;
    //   //     }
    //   //     return false;
    //   //   });
    //   //   // Parse it
    //   //   if (optionStrIndex > -1) {
    //   //     const optionStr = this.optionsStrs[optionStrIndex];
    //   //     // Calculate offset
    //   //     const offsetStart = this.offsetStart ? this.offsetStart + this.optionsStrs.filter((_, i) => i < optionStrIndex).concat().length : this.offsetStart;
    //   //     const offsetEnd = offsetStart ? offsetStart + optionStr.length : offsetStart;
    //   //     // Append to options
    //   //     this.options.push(new EventOption(optionStr, [offsetStart, offsetEnd], pattern, this));
    //   //     // Mark parsed key
    //   //     parsedOptions.set(optionStrIndex, true);
    //   //   }
    //   // });
    //   // // Parse mandatory options
    //   // argumentsPatterns.mandatory?.forEach(pattern => {
    //   //   if (pattern.key) {
    //   //     // Find the first 
    //   //   }
    //   // });
    // } else {
    //   // Mode: mandatories + optionals

    //   let optionStrOffsetCursor = 0; // Cache offset

    //   this.optionsStrs.forEach((optionStr, i) => {
    //     // Calculate offset
    //     const offsetStart = this.offsetStart ? this.offsetStart + optionStrOffsetCursor : this.offsetStart;
    //     optionStrOffsetCursor += optionStr.length;
    //     const offsetEnd = this.offsetStart ? this.offsetStart + optionStrOffsetCursor : this.offsetStart;

    //     // Parse mandatory options
    //     if (i < argumentsPatterns.mandatory.length) {
    //       //
    //     }
    //     // Parse optional options
    //   });
    // }

    // Split mandatory and optional options
    let mandatoryStrs: string[] = [];
    let optionalStrs: string[] = [];
    if (argumentsPatterns.optionalAtFirst) {
      mandatoryStrs = this.optionsStrs.filter((_, i) => i >= argumentsPatterns.mandatory.length);
      optionalStrs = this.optionsStrs.filter((_, i) => i < argumentsPatterns.mandatory.length);
    } else {
      mandatoryStrs = this.optionsStrs.filter((_, i) => i < argumentsPatterns.mandatory.length);
      optionalStrs = this.optionsStrs.filter((_, i) => i >= argumentsPatterns.mandatory.length);
    }

    let optionStrOffsetCursor = 0; // Cache offset

    if (argumentsPatterns.optionalAtFirst) {
      // Parse optional options
      let parsedOptional = new Map<number, boolean>();
      optionalStrs.forEach(optionStr => {
        // Calculate offset
        const offsetStart = this.offsetStart ? this.offsetStart + optionStrOffsetCursor : this.offsetStart;
        optionStrOffsetCursor += optionStr.length;
        const offsetEnd = this.offsetStart ? this.offsetStart + optionStrOffsetCursor : this.offsetStart;
        const i = argumentsPatterns.optional!.findIndex(pattern => optionStr.startsWith(pattern.key));
        const pattern = argumentsPatterns.optional![i];
        if (parsedOptional.has(i)) {
          // Duplicated option
          // const document = TextDocument.create(this.uri, 'yaml', 1, this.parent.content); // TODO: document version, document content
          // this.options.push(new EventOption(optionStr, [offsetStart, offsetEnd], false, pattern, this, [{
          //   message: `Duplicated option "${pattern.key}"`,
          //   severity: DiagnosticSeverity.Error,
          //   range: {
          //     start: offsetStart,
          //     end: offsetEnd
          //   }
          // }]));
        } else {
          // Append to options
          this.options.push(new EventOption(optionStr, [offsetStart, offsetEnd], false, pattern, this));
        }
      });
      // Parse mandatory options
      argumentsPatterns.mandatory.forEach((pattern, i) => {
        if (mandatoryStrs[i]) {
          // Calculate offset
          const offsetStart = this.offsetStart ? this.offsetStart + optionStrOffsetCursor : this.offsetStart;
          optionStrOffsetCursor += mandatoryStrs[i].length;
          const offsetEnd = this.offsetStart ? this.offsetStart + optionStrOffsetCursor : this.offsetStart;
          // Append to options
          this.options.push(new EventOption(mandatoryStrs[i], [offsetStart, offsetEnd], true, pattern, this));
        } else {
          // // Missing mandatory options
          // this.options.push(new EventOption(mandatoryStrs[i], [optionStrOffsetCursor, optionStrOffsetCursor], true, pattern, this));
          // TODO: add Diagnotistics
          // ...
        }
      });
    }
  }
}