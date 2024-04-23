import { Pair, Scalar } from "yaml";
import { AnnotatedTextEdit, CodeAction, CodeActionKind, Diagnostic, DiagnosticSeverity, TextEdit } from "vscode-languageserver";

import { ConversationFinalEventsType, Node } from "../../node";
import { Conversation } from "./Conversation";
import { AbstractEvent } from "./AbstractEvent";
import { DiagnosticCode } from "../../../utils/diagnostics";

export class ConversationFinalEvents implements Node<ConversationFinalEventsType> {
  type: ConversationFinalEventsType = 'ConversationFinalEvents';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // Cache the parsed yaml document
  yml: Pair<Scalar<string>, Scalar<string>>;
  events: ConversationFinalEvent[] = [];

  constructor(uri: string, yml: Pair<Scalar<string>, Scalar<string>>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;
    this.yml = yml;
    this.offsetStart = this.yml.value?.range?.[0] ?? 0;
    this.offsetEnd = this.yml.value?.range?.[1] ?? this.yml.key.range?.[1] ?? this.offsetStart;

    // Parse Events with RegEx
    if (this.yml.value) {
      const regex = /([^,]+)/g; // /([^\s,]+)/gm;
      let matched: RegExpExecArray | null;
      while ((matched = regex.exec(this.yml.value.value)) !== null) {
        const str = matched[1];
        const offsetStart = this.offsetStart + matched.index;
        const offsetEnd = offsetStart + str.length;

        // Check leading & tailing empty spaces
        if (str.trim() !== str) {
          // Throw diagnostics & quick fix
          const range = this.parent.getRangeByOffset(offsetStart, offsetEnd);
          const diagnostic = {
            range: range,
            message: `Event name cannot contain leading or trailing empty spaces.`,
            severity: DiagnosticSeverity.Error,
            source: 'BetonQuest',
            code: DiagnosticCode.EventNameEmptySpaces
          };
          this.diagnostics?.push(diagnostic);
          this.codeActions?.push({
            title: 'Remove leading and trailing empty spaces',
            kind: CodeActionKind.QuickFix,
            diagnostics: [diagnostic],
            edit: {
              documentChanges: [{
                textDocument: {
                  uri: this.uri,
                  version: this.parent.document.version,
                },
                edits: [{
                  range: range,
                  newText: str.trim(),
                }]
              }]
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
