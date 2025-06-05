import { CodeAction, Diagnostic, DiagnosticSeverity, PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Pair, Scalar, YAMLMap } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { SemanticTokenType } from "../../../service/semanticTokens";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { getFilename } from "../../../utils/url";
import { isStringScalarPair, isYamlMapPair } from "../../../utils/yaml";
import { ConversationSectionType, ConversationType } from "../../node";
import { PackageV2 } from "../Package";
import { Document, SectionCollection } from "../document";
import { ConversationFinalEvents } from "./ConversationFinalEvents";
import { ConversationInterceptor } from "./ConversationInterceptor";
import { ConversationQuester } from "./ConversationQuester";
import { ConversationStop } from "./ConversationStop";
import { First } from "./First";
import { NpcOption } from "./Option/NpcOption";
import { PlayerOption } from "./Option/PlayerOption";

export class Conversation extends SectionCollection<ConversationType> {
  readonly type: ConversationType = 'Conversation';

  // Conversation sections
  readonly conversationID: string;

  constructor(uri: string, conversationID: string, parent: PackageV2) {
    super(uri, parent);
    this.conversationID = conversationID;
  }

  addSection(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>) {
    this.addChild(new ConversationSection(uri, document, yml, this));
  }

  getConversationSections() {
    return this.getChildren<ConversationSection>('ConversationSection');
  }

  getPublishDiagnosticsParams(): PublishDiagnosticsParams[] {
    return this.children.flatMap(c => ({
      uri: c.getUri(),
      diagnostics: c._getDiagnostics()
    }));
  }

  getLocations(yamlPath: string[], sourceUri: string): LocationsResponse[] {
    // TODO
    return [];
  }
}

export class ConversationSection extends Document<ConversationSectionType> {
  readonly type: ConversationSectionType = 'ConversationSection';
  readonly parent: Conversation;

  constructor(uri: string, document: TextDocument, yml: Pair<Scalar<string>, YAMLMap<Scalar<string>>>, parent: Conversation) {
    super(uri, document, yml);
    this.parent = parent;

    // Parse Elements
    this.yml.value?.items.forEach(pair => {
      const offsetStart = pair.key.range?.[0] ?? 0;
      const offsetEnd = (pair.value as Scalar | YAMLMap)?.range?.[1] ?? offsetStart;
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
              tokenType: SemanticTokenType.ConversationKeyword
            });
        }
      }
      // Parse value
      switch (pair.key.value) {
        case "quester":
          if (isStringScalarPair(pair) || isYamlMapPair(pair)) {
            this.addChild(new ConversationQuester(pair, [offsetStart, offsetEnd], this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string or a translation list.`);
          }
          break;
        case "first":
          if (isStringScalarPair(pair)) {
            this.addChild(new First(pair, [offsetStart, offsetEnd], this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "stop":
          if (isStringScalarPair(pair)) {
            this.addChild(new ConversationStop(pair, [offsetStart, offsetEnd], this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "final_events":
          if (isStringScalarPair(pair)) {
            this.addChild(new ConversationFinalEvents(pair, [offsetStart, offsetEnd], this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "interceptor":
          if (isStringScalarPair(pair)) {
            this.addChild(new ConversationInterceptor(pair, [offsetStart, offsetEnd], this));
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
                this.addChild(new NpcOption(option, this));
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
                this.addChild(new PlayerOption(option, this));
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
  }

  init() {
    // Check missing elements from the Package
    if (!this.parent.getChildren().some(c => c.getChild('ConversationQuester')) && !this.diagnostics.some(d => d.code === DiagnosticCode.ConversationMissingQuester)) {
      this.addDiagnostic(
        [(this.yml.key.range?.[0] || 0), (this.yml.key.range?.[1] || 0)],
        `Missing element "quester".`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ConversationMissingQuester,
        [
          {
            title: `Add element "quester"`,
            text: `quester: ${this.yml.key.value}\n` + ` `.repeat(this.yml.value?.srcToken?.type === "block-map" ? this.yml.value.srcToken.indent : 0),
            range: [(this.yml.value?.range?.[0] || 0), (this.yml.value?.range?.[0] || 0)]
          }
        ]
      );
    }
  }

  private addDiagnosticValueTypeIncorrect(pair: Pair<Scalar<string>>, message: string) {
    const offsetStart = (pair.value as any).range?.[0] as number | undefined ?? pair.key.range?.[0];
    const offsetEnd = offsetStart ? (pair.value as any).range?.[1] as number : pair.key.range?.[1];
    this.addDiagnostic([offsetStart, offsetEnd], message, DiagnosticSeverity.Error, DiagnosticCode.ValueTypeIncorrect);
  }

  getFirst() {
    return this.getChildren<First>('ConversationFirst');
  }

  getFinalEvents() {
    return this.getChildren<ConversationFinalEvents>('ConversationFinalEvents');
  }

  getNpcOptions(optionID?: string) {
    return this.getChildren<NpcOption>('ConversationNpcOption', o => !optionID || o.id === optionID);
  }

  getPlayerOptions(optionID?: string) {
    return this.getChildren<PlayerOption>('ConversationPlayerOption', o => !optionID || o.id === optionID);
  }

  getConversationAllOptions() {
    return [
      ...this.getNpcOptions(),
      ...this.getPlayerOptions()
    ];
  }
}
