import { Pair, Scalar, isMap, isScalar } from "yaml";
import { DiagnosticSeverity, PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { PackageV1 } from "../Package";
import { ConversationNpcOptionType, ConversationPlayerOptionType, ConversationType } from "../../node";
import { isYamlMapPair } from "../../../utils/yaml";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { LocationLinkOffset } from "../../../utils/location";
import { SemanticToken } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { getFilename } from "../../../utils/url";
import { ConversationQuester } from "./ConversationQuester";
import { ConversationFirst } from "./ConversationFirst";
import { ConversationStop } from "./ConversationStop";
import { ConversationFinalEvents } from "./ConversationFinalEvents";
import { ConversationInterceptor } from "./ConversationInterceptor";
import { Document } from "../document";
import { Option } from "./Option/Option";

export class Conversation extends Document<ConversationType> {
  type: ConversationType = 'Conversation';

  // Contents
  quester?: ConversationQuester;
  first?: ConversationFirst;
  stop?: ConversationStop;
  finalEvents?: ConversationFinalEvents;
  interceptor?: ConversationInterceptor;
  npcOptions: Option<ConversationNpcOptionType>[] = [];
  playerOptions: Option<ConversationPlayerOptionType>[] = [];

  semanticTokens: SemanticToken[] = [];

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super(uri, document, parent);

    // Parse Elements
    this.yml.items.forEach(pair => {
      const offsetStart = pair.key.range?.[0] ?? 0;
      const offsetEnd = (pair.value as Scalar)?.range?.[1] ?? offsetStart;
      // Set key's Semantic Token
      if (pair.key.range) {
        switch (pair.key.value) {
          case "quester":
          case "first":
          case "stop":
          case "final_events":
          case "interceptor":
          case "NPC_options":
          case "player_options":
            this.semanticTokens.push({
              offsetStart: pair.key.range![0],
              offsetEnd: pair.key.range![1],
              tokenType: "keyword"
            });
        }
      }
      // Parse value
      switch (pair.key.value) {
        case "quester":
          if (isScalar(pair.value) || isMap<Scalar<string>>(pair.value)) {
            this.quester = new ConversationQuester(pair.value, this);
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string or a translation list.`);
          }
          break;
        case "first":
          if (isScalar(pair.value)) {
            this.first = new ConversationFirst(pair.value, this);
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "stop":
          if (isScalar(pair.value)) {
            this.stop = new ConversationStop(pair.value, this);
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "final_events":
          if (isScalar(pair.value)) {
            this.finalEvents = new ConversationFinalEvents(pair.value, this);
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "interceptor":
          if (isScalar(pair.value)) {
            this.interceptor = new ConversationInterceptor(pair.value, this);
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "NPC_options":
          if (isYamlMapPair(pair) && pair.value) {
            pair.value.items.forEach(option => {
              // Check YAML value type
              if (isYamlMapPair(option) && option.value) {
                this.npcOptions.push(new Option("ConversationNpcOption", option, this));
              } else {
                // TODO: throw diagnostics error.
              }
            });
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type.`);
          }
          break;
        case "player_options":
          if (isYamlMapPair(pair) && pair.value) {
            pair.value.items.forEach(option => {
              // Check YAML value type
              if (isYamlMapPair(option) && option.value) {
                this.playerOptions.push(new Option("ConversationPlayerOption", option, this));
              } else {
                // TODO: throw diagnostics error.
              }
            });
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type.`);
          }
          break;
        default:
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
              this.addDiagnostic(
                [offsetStart, offsetEnd],
                `Incorrect key "${pair.key.value}". Do you mean "${correctKeyStr}"?`,
                DiagnosticSeverity.Warning,
                DiagnosticCode.YamlKeyUnknown,
                [{
                  title: `Rename key to "${correctKeyStr}"`,
                  text: correctKeyStr,
                  range: [pair.key.range![0], pair.key.range![1]],
                }]
              );
              break;
            default:
              // Throw warning diagnostics for unknown keys
              this.addDiagnostic(
                [offsetStart, offsetEnd],
                `Unknown key "${pair.key.value}"`,
                DiagnosticSeverity.Warning,
                DiagnosticCode.YamlKeyUnknown,
                [
                  {
                    title: `Remove "${pair.key.value}"`,
                    text: "",
                    range: [offsetStart, offsetEnd]
                  }
                ],
              );
              break;
          }
          break;
      }
    });

    // Check missing elements
    if (!this.quester) {
      this.addDiagnostic(
        [0, 0],
        `Missing element "quester".`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ConversationMissingQuester,
        [
          {
            title: `Add element "quester"`,
            text: `quester: ${getFilename(this.document.uri, true)}\n`
          }
        ]
      );
    }

    // ...
  }

  private addDiagnosticValueTypeIncorrect(pair: Pair<Scalar<string>>, message: string) {
    const offsetStart = (pair.value as any).range?.[0] as number | undefined ?? pair.key.range?.[0];
    const offsetEnd = offsetStart ? (pair.value as any).range?.[1] as number : pair.key.range?.[1];
    this.addDiagnostic([offsetStart, offsetEnd], message, DiagnosticSeverity.Error, DiagnosticCode.ValueTypeIncorrect);
  }

  getPublishDiagnosticsParams() {
    return {
      uri: this.uri,
      diagnostics: [
        ...this.diagnostics,
        ...this.quester?.getDiagnostics() ?? [],
        ...this.first?.getDiagnostics() ?? [],
        ...this.stop?.getDiagnostics() ?? [],
        ...this.finalEvents?.getDiagnostics() ?? [],
        ...this.interceptor?.getDiagnostics() ?? [],
        ...this.npcOptions?.flatMap(npc => npc.getDiagnostics()) ?? [],
        ...this.playerOptions?.flatMap(player => player.getDiagnostics()) ?? [],
      ]
    } as PublishDiagnosticsParams;
  }

  // Get all CodeActions, quick fixes etc
  getCodeActions() {
    return [
      ...this.codeActions,
      ...this.quester?.getCodeActions() ?? [],
      ...this.first?.getCodeActions() ?? [],
      ...this.stop?.getCodeActions() ?? [],
      ...this.finalEvents?.getCodeActions() ?? [],
      ...this.interceptor?.getCodeActions() ?? [],
      ...this.npcOptions?.flatMap(npc => npc.getCodeActions()) ?? [],
      ...this.playerOptions?.flatMap(player => player.getCodeActions()) ?? [],
    ];
  }

  getSemanticTokens(documentUri: string): SemanticToken[] {
    const semanticTokens: SemanticToken[] = [];
    if (documentUri !== this.uri) {
      return semanticTokens;
    }
    semanticTokens.push(...this.semanticTokens);
    semanticTokens.push(...this.finalEvents?.getSemanticTokens() || []);
    semanticTokens.push(...this.npcOptions.flatMap(o => o.getSemanticTokens()));
    semanticTokens.push(...this.playerOptions.flatMap(o => o.getSemanticTokens()));
    return semanticTokens;
  };

  getHoverInfo(offset: number, documentUri: string): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (documentUri !== this.uri) {
      return hoverInfo;
    }
    hoverInfo.push(...this.finalEvents?.getHoverInfo(offset) || []);
    hoverInfo.push(...this.npcOptions.flatMap(o => o.getHoverInfo(offset)));
    hoverInfo.push(...this.playerOptions.flatMap(o => o.getHoverInfo(offset)));
    return hoverInfo;
  }

  getDefinitions(offset: number, uri: string): LocationLinkOffset[] {
    if (uri !== this.uri) {
      return [];
    }

    return [
      ...this.finalEvents?.getDefinitions(offset) || [],
      ...this.npcOptions.flatMap(o => o.getDefinitions(offset)),
      ...this.playerOptions.flatMap(o => o.getDefinitions(offset)),
    ];
  }
}
