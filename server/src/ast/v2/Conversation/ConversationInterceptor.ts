import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationInterceptorType } from "../../node";
import { Conversation } from "./Conversation";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarRangeByValue, getSourceByValue } from "../../../utils/yaml";
import { AbstractNodeV1 } from "../../v1";

export class ConversationInterceptor extends AbstractNodeV1<ConversationInterceptorType> {
  readonly type: ConversationInterceptorType = 'ConversationInterceptor';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: Conversation;

  // Cache the parsed yaml document
  private yml: Scalar;
  private interceptors: string[] = [];

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
          const trimed = matched[2].trim();
          if (this.availableInterceptors.some(i => i === trimed)) {
            this.interceptors.push(trimed);
          } else {
            let message: string;
            let severity: DiagnosticSeverity;
            let code: DiagnosticCode;
            if (trimed.length > 0) { // Wrong value
              message = `Interceptor "${trimed}" is not available.`;
              severity = DiagnosticSeverity.Error;
              code = DiagnosticCode.ValueContentIncorrect;
            } else { // Value is empty
              message = `Interceptor is empty.`;
              severity = DiagnosticSeverity.Warning;
              code = DiagnosticCode.ValueContentEmpty;
            }
            const offsetStart = this.offsetStart + matched.index + matched[1].length;
            const offsetEnd = offsetStart + matched[2].length;
            this.addDiagnostic(
              [offsetStart, offsetEnd],
              message,
              severity,
              code,
              [
                {
                  title: "Remove value",
                  text: "",
                  range: [this.offsetStart + matched.index, offsetEnd]
                },
                ...this.defaultCodeActions
              ]
            );
          }
        }
      }
    } else if (typeof str !== "string" && str !== null) {
      this.addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Incorrect value type. It should be a string.`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ValueTypeIncorrect,
        this.defaultCodeActions
      );
    }

  }
}