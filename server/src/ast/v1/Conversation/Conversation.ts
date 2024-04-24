import { Scalar, YAMLMap, isMap, isScalar, parseDocument } from "yaml";
import { CodeAction, CodeActionKind, Diagnostic, DiagnosticSeverity, PublishDiagnosticsParams, Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { PackageV1 } from "../Package";
import { ConversationType, Node } from "../../node";
import { ConversationQuester } from "./ConversationQuester";
import { ConversationFirst } from "./ConversationFirst";
import { ConversationStop } from "./ConversationStop";
import { ConversationFinalEvents } from "./ConversationFinalEvents";
import { ConversationInterceptor } from "./ConversationInterceptor";
import { NpcOptions } from "./Option/NpcOptions";
import { PlayerOptions } from "./Option/PlayerOptions";
import { isStringScalarPair, isYamlmapPair } from "../../../utils/yaml";
import { DiagnosticCode } from "../../../utils/diagnostics";

export class Conversation implements Node<ConversationType> {
  type: ConversationType = 'Conversation';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: PackageV1;
  diagnostics: Diagnostic[] = [];
  codeActions: CodeAction[] = [];

  // VSCode Document, for diagnostics / quick actions / goto definition, etc
  readonly document: TextDocument;

  // Cache the parsed yaml document
  yml?: YAMLMap<Scalar<string>, Scalar | YAMLMap>;

  // Contents
  quester?: ConversationQuester;
  first?: ConversationFirst;
  stop?: ConversationStop;
  finalEvent?: ConversationFinalEvents;
  interceptor?: ConversationInterceptor;
  npcOptions?: NpcOptions;
  playerOptions?: PlayerOptions;

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    this.uri = uri;
    this.document = document;
    this.parent = parent;

    // Parse yaml
    const yml = parseDocument<YAMLMap<Scalar<string>, Scalar | YAMLMap>, false>(
      document.getText(),
      {
        keepSourceTokens: true,
        strict: false
      }
    );
    if (!(yml.contents instanceof YAMLMap)) {
      return;
    }
    this.yml = yml.contents;

    // Extract offsets
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];

    // Parse Elements
    this.yml.items.forEach(pair => {
      const offsetStart = pair.key.range?.[0] ?? 0;
      const offsetEnd = pair.value?.range?.[1] ?? offsetStart;
      const range = this.getRangeByOffset(offsetStart, offsetEnd);
      switch (pair.key.value) {
        case "quester":
          if (isScalar<string>(pair.value) || isMap<Scalar<string>>(pair.value)) {
            this.quester = new ConversationQuester(this.uri, pair.value, this);
          } else {
            // Throw incorrect value diagnostics
            const offsetStart = (pair.value as any).range?.[0] as number ?? pair.key.range?.[0];
            const offsetEnd = offsetStart ? (pair.value as any).range?.[1] as number : pair.key.range?.[1];
            if (offsetStart && offsetEnd) {
              this.diagnostics.push({
                range: this.getRangeByOffset(offsetStart, offsetEnd),
                message: `Incorrect value. It should be a string or a translation list.`,
                severity: DiagnosticSeverity.Error,
                source: 'BetonQuest',
                code: DiagnosticCode.IncorrectYamlType
              });
            }
          }
          break;
        case "first":
          if (isStringScalarPair(pair)) {
            this.first = new ConversationFirst(this.uri, pair, this);
          } else {
            // TODO: throw error diagnostics
          }
          break;
        case "stop":
          if (isStringScalarPair(pair)) {
            this.stop = new ConversationStop(this.uri, pair, this);
          } else {
            // TODO: throw error diagnostics
          }
          break;
        case "final_events":
          if (isStringScalarPair(pair)) {
            this.finalEvent = new ConversationFinalEvents(this.uri, pair, this);
          } else {
            // TODO: throw error diagnostics
          }
          break;
        case "interceptor":
          if (isStringScalarPair(pair)) {
            this.interceptor = new ConversationInterceptor(this.uri, pair, this);
          } else {
            // TODO: throw error diagnostics
          }
          break;
        case "NPC_options":
          if (isYamlmapPair(pair)) {
            this.npcOptions = new NpcOptions(this.uri, pair, this);
          } else {
            // TODO: throw error diagnostics
          }
          break;
        case "player_options":
          if (isYamlmapPair(pair)) {
            this.playerOptions = new PlayerOptions(this.uri, pair, this);
          } else {
            // TODO: throw error diagnostics
          }
          break;
        default:
          const diagnostic: Diagnostic = {
            range: range,
            message: `Unknown key "${pair.key.value}"`,
            severity: DiagnosticSeverity.Warning,
            source: 'BetonQuest',
            code: DiagnosticCode.UnknownKey
          };
          let correctKeyStr = pair.key.value.toLowerCase();
          switch (correctKeyStr) {
            case "npc_options":
              correctKeyStr = "NPC_options";
            case "quester":
            case "first":
            case "stop":
            case "final_events":
            case "interceptor":
            case "player_options":
              // Throw error diagnostics for incorrect keys
              diagnostic.message = `Incorrect key "${pair.key.value}". Do you mean "${correctKeyStr}"?`;
              this.diagnostics.push(diagnostic);
              this.codeActions.push({
                title: `Rename key to "${correctKeyStr}"`,
                kind: CodeActionKind.QuickFix,
                diagnostics: [diagnostic],
                edit: {
                  changes: {
                    [this.uri]: [
                      {
                        range: this.getRangeByOffset(pair.key.range![0], pair.key.range![1]),
                        newText: correctKeyStr
                      }
                    ]
                  }
                }
              });
              break;
            default:
              // Throw warning diagnostics for unknown keys
              this.diagnostics.push(diagnostic);
              this.codeActions.push({
                title: `Remove "${pair.key.value}"`,
                kind: CodeActionKind.QuickFix,
                diagnostics: [diagnostic],
                edit: {
                  changes: {
                    [this.uri]: [
                      {
                        range: range,
                        newText: ""
                      }
                    ]
                  }
                }
              });
              break;
          }
          break;
      }
    });

    // Check missing elements
    if (!this.quester) {
      this.diagnostics.push({
        range: {
          start: {
            line: 0,
            character: 0
          },
          end: {
            line: 0,
            character: 0
          }
        },
        message: `Missing element "quester".`,
        severity: DiagnosticSeverity.Error,
        source: 'BetonQuest',
        code: DiagnosticCode.ConversationMissingQuester
      });
    }

    // ...
  }

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return {
      start: this.document.positionAt(offsetStart),
      end: this.document.positionAt(offsetEnd)
    } as Range;
  }

  getPublishDiagnosticsParams() {
    return {
      uri: this.uri,
      diagnostics: [
        ...this.diagnostics,
        ...(this.quester?.getDiagnostics() ?? []), // quester
        ...(this.finalEvent?.getDiagnostics() ?? [])
      ]
    } as PublishDiagnosticsParams;
  }

  // Get all CodeActions, quick fixes etc
  getCodeActions() {
    return [
      ...this.codeActions,

      // Get and merge CodeActions from children

      // final_event
      ...this.finalEvent?.getCodeActions() ?? []

      // ...
    ];
  }
}
