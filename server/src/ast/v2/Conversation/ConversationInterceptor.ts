import { DiagnosticSeverity } from "vscode-languageserver";
import { Pair, Scalar } from "yaml";

import { DiagnosticCode } from "../../../utils/diagnostics";
import { getScalarSourceAndRange } from "../../../utils/yaml";
import { ConversationInterceptorType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ConversationSection } from "./Conversation";

export class ConversationInterceptor extends AbstractNodeV2<ConversationInterceptorType> {
  readonly type: ConversationInterceptorType = 'ConversationInterceptor';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ConversationSection;

  // Cache the parsed yaml document
  private yml: Pair<Scalar<string>, Scalar>;
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

  constructor(yml: Pair<Scalar<string>, Scalar>, offset: [offsetStart: number, offsetEnd: number], parent: ConversationSection) {
    super();
    this.offsetStart = offset[0];
    this.offsetEnd = offset[1];
    this.parent = parent;

    this.yml = yml;
    const [str, [valueOffsetStart, valueOffsetEnd]] = getScalarSourceAndRange(yml.value);

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
            const offsetStart = valueOffsetStart + matched.index + matched[1].length;
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
                  range: [valueOffsetStart + matched.index, offsetEnd]
                },
                ...this.defaultCodeActions
              ]
            );
          }
        }
      }
    } else if (typeof str !== "string" && str !== null) {
      this.addDiagnostic(
        [valueOffsetStart, valueOffsetEnd],
        `Incorrect value type. It should be a string.`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ValueTypeIncorrect,
        this.defaultCodeActions
      );
    }

  }
}