import { Scalar, YAMLMap, parseDocument } from "yaml";
import { CodeAction, Diagnostic, PublishDiagnosticsParams, Range } from "vscode-languageserver";
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
  yml?: YAMLMap<Scalar<string>>;

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
    const yml = parseDocument<YAMLMap<Scalar<string>>, false>(
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
      switch (pair.key.value.toLowerCase()) {
        case "quester":
          this.quester = new ConversationQuester(this.uri, pair, this);
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
      }
    });
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
        ...(this.finalEvent?.getDiagnostics() ?? [])
      ]
    } as PublishDiagnosticsParams;
  }

  // Get all CodeActions, quick fixes etc
  getCodeActions() {
    const codeActions = this.codeActions;

    // Get and merge CodeActions from children

    // final_event
    this.finalEvent?.getCodeActions().forEach(codeAction => {
      codeActions.push(codeAction);
    });
    // this.finalEvent?.getReducedCodeActions().forEach(reducedAction => {
    //   codeActions.push({
    //     title: reducedAction.title,
    //     kind: reducedAction.kind,
    //     diagnostics: reducedAction.diagnostics,
    //     edit: {
    //       documentChanges: [{
    //         textDocument: {
    //           uri: this.uri,
    //           version: null
    //         },
    //         edits: reducedAction.edits.map(edit => ({
    //           range: this.getRangeByOffset(edit.offsetStart, edit.offsetEnd),
    //           newText: edit.newText
    //         }))
    //       }]
    //     }
    //   });
    // });

    // ...

    return codeActions;
  }
}
