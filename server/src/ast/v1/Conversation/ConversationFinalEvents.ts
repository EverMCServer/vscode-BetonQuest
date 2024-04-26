import { Scalar } from "yaml";
import { CodeAction, CodeActionKind, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationFinalEventsType, Node } from "../../node";
import { Conversation } from "./Conversation";
import { AbstractEvent } from "./AbstractEvent";
import { DiagnosticCode } from "../../../utils/diagnostics";

export class ConversationFinalEvents extends Node<ConversationFinalEventsType> {
  type: ConversationFinalEventsType = 'ConversationFinalEvents';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // Cache the parsed yaml document
  yml: Scalar;
  events: ConversationFinalEvent[] = [];

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;
    this.offsetStart = yml.range?.[0];
    this.offsetEnd = yml.range?.[1];

    // Check value type
    if (typeof this.yml.value === 'string') {
      // Parse Events with RegEx
      const regex = /([^,]+)/g; // /([^\s,]+)/gm;
      let matched: RegExpExecArray | null;
      while ((matched = regex.exec(this.yml.value)) !== null) {
        const str = matched[1];
        const offsetStart = this.offsetStart! + matched.index;
        const offsetEnd = offsetStart + str.length;
        const range = this.parent.getRangeByOffset(offsetStart, offsetEnd);

        // Check leading & tailing empty spaces
        if (str.trim() !== str) {
          // Throw diagnostics & quick fix
          const diagnostic = {
            range: range,
            message: `Event IDs in "final_events" can not be separated with leading or tailing spaces.`,
            severity: DiagnosticSeverity.Error,
            source: 'BetonQuest',
            code: DiagnosticCode.ValueContentIncorrect
          };
          this.diagnostics.push(diagnostic);
          this.codeActions.push({
            title: 'Remove leading and tailing empty spaces',
            kind: CodeActionKind.QuickFix,
            isPreferred: true,
            diagnostics: [diagnostic],
            edit: {
              changes: {
                [this.uri]: [{
                  range: range,
                  newText: str.trim(),
                }]
              }
            }
          });
        }

        // Check if any spaces in the middle
        if (str.trim().match(/\s+/)) {
          const correctStr = str.trim().replace(/\s+/g, "_");
          const diagnostic: Diagnostic = {
            range: range,
            message: `Event ID cannot contains empty spaces. Do you mean "${correctStr}"?.`,
            severity: DiagnosticSeverity.Error,
            source: 'BetonQuest',
            code: DiagnosticCode.ElementIdSyntax
          };
          this.diagnostics.push(diagnostic);
          this.codeActions.push({
            title: `Change to "${correctStr}"`,
            kind: CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            edit: {
              changes: {
                [this.uri]: [
                  {
                    range: range,
                    newText: correctStr
                  }
                ]
              }
            }
          });
        }

        // Create Event
        this.events.push(
          new ConversationFinalEvent(
            this.uri, str,
            [offsetStart, offsetEnd],
            this
          )
        );
      }
    }
  }

  getDiagnostics() {
    const diagnostics = this.diagnostics;
    // this.events.forEach(event => diagnostics.push(event.getDiagnostics()));
    return diagnostics;
  }

  getCodeActions() {
    return this.codeActions;
  }
}

class ConversationFinalEvent extends AbstractEvent<ConversationFinalEvents> {
}
