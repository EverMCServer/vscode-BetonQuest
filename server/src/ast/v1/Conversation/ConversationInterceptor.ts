import { Scalar } from "yaml";
import { CodeAction, Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationInterceptorType, Node } from "../../node";
import { Conversation } from "./Conversation";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarRangeByValue, getScalarSourceAndRange, getSourceByValue } from "../../../utils/yaml";

export class ConversationInterceptor extends Node<ConversationInterceptorType> {
  type: ConversationInterceptorType = 'ConversationInterceptor';
  uri: string;
  offsetStart: number;
  offsetEnd: number;
  parent: Conversation;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // Cache the parsed yaml document
  yml: Scalar;
  interceptors: string[] = [];

  readonly availableInterceptors = [
    "simple",
    "packet",
    "none"
  ];

  readonly defaultCodeActions = [
    {
      title: `Set to "simple"`,
      text: `simple`
    },
    {
      title: `Set to "packet"`,
      text: `packet`
    },
    {
      title: `Set to "none"`,
      text: `none`
    },
  ];

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;
    [this.offsetStart, this.offsetEnd] = getScalarRangeByValue(this.yml);

    const str = getSourceByValue(this.yml);
    if (typeof str === "string") {
      // Parse values
      if (str.trim() !== "") {
        const regex = /(,?)([^,]*)/g;  //  / *([^,]*),?/g = "spaces + ( matched & spaces ),"
        let matched: RegExpExecArray | null;
        while ((matched = regex.exec(str)) !== null && matched[0].length > 0) {
          const trimed = matched[1].trim();
          if (this.availableInterceptors.some(i => i === trimed)) {
            this.interceptors.push(trimed);
          } else {
            if (trimed.length > 0) { // Wrong value
              const offsetStart = this.offsetStart + matched.index + matched[2].length;
              const offsetEnd = offsetStart + matched[0].length;
              this._addDiagnostic(
                this.parent.getRangeByOffset(offsetStart, offsetEnd),
                `Interceptor "${trimed}" is not available.`,
                DiagnosticSeverity.Error,
                DiagnosticCode.ValueContentIncorrect,
                [
                  {
                    title: "Remove value",
                    text: "",
                    range: this.parent.getRangeByOffset(this.offsetStart + matched.index, this.offsetStart + matched.index + matched[0].length)
                  },
                  ...this.defaultCodeActions
                ]
              );
            } else { // Value is empty
              const offsetStart = this.offsetStart + matched.index;
              const offsetEnd = offsetStart + matched[0].length;
              const range = this.parent.getRangeByOffset(offsetStart, offsetEnd);
              this._addDiagnostic(
                this.parent.getRangeByOffset(offsetStart, offsetEnd),
                `Interceptor "${trimed}" is empty.`,
                DiagnosticSeverity.Error,
                DiagnosticCode.ValueContentIncorrect,
                [
                  {
                    title: "Remove value",
                    text: "",
                    range: range
                  },
                  ...this.defaultCodeActions.map(a => ({
                    title: a.title,
                    text: a.text + ",",
                    range: range
                  }))
                ]
              );
            }
          }
        }
      }
    } else if (typeof str !== "string" && str !== null) {
      this._addDiagnostic(
        this.parent.getRangeByOffset(this.offsetStart, this.offsetEnd),
        `Incorrect value type. It should be a string.`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ValueTypeIncorrect,
        this.defaultCodeActions
      );
    }

  }
}