import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap, isMap, isSeq, parseDocument, visit } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { SemanticTokenType } from "../../service/semanticTokens";
import { LocationLinkOffset } from "../../utils/location";
import { getParentUrl } from "../../utils/url";
import { isStringScalar, isYamlMapPair } from "../../utils/yaml";
import { AST } from "../ast";
import { ConversationOptionType, PackageV2Type } from "../node";
import { AbstractNodeV2 } from "../v2";
import { ConditionEntry } from "./Condition/ConditionEntry";
import { ConditionList } from "./Condition/ConditionList";
import { Conversation } from "./Conversation/Conversation";
import { NpcOption } from "./Conversation/Option/NpcOption";
import { PlayerOption } from "./Conversation/Option/PlayerOption";
import { EventEntry } from "./Event/EventEntry";
import { EventList } from "./Event/EventList";
import { ObjectiveEntry } from "./Objective/ObjectiveEntry";
import { ObjectiveList } from "./Objective/ObjectiveList";

export class PackageV2 extends AbstractNodeV2<PackageV2Type> {
  type: PackageV2Type = "PackageV2";
  readonly uri: string;
  parent: PackageV2 = this;
  readonly parentAst: AST;
  readonly packagePath: string[];

  constructor(packageUri: string, documents: TextDocument[], parent: AST) {
    super();
    this.uri = packageUri;
    this.parentAst = parent;

    // Init Lists
    this.addChild(new ConditionList(this.uri, this));
    this.addChild(new EventList(this.uri, this));
    this.addChild(new ObjectiveList(this.uri, this));

    // Calculate package's path
    this.packagePath = this.uri.slice(this.parentAst.wsFolderUri.length).replace(/^QuestPackages\//m, "").replace(/(?:\/)$/m, "").split('/');

    // Iterate all files and create nodes.
    documents.forEach((document) => {
      // Parse YAML document
      const ymlDoc = parseDocument<YAMLMap<Scalar<string>, any>, false>(
        document.getText(),
        {
          keepSourceTokens: true,
          strict: false
        }
      );
      // Move comment from YAMLMap onto it's first item, avoiding eemeli/yaml/discussions/490
      // Ref: https://github.com/eemeli/yaml/issues/502#issuecomment-1795624261
      visit(ymlDoc as any, {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Map(_, node: any, path) {
          if (!node.commentBefore || isSeq(path[path.length - 1])) {
            return;
          }
          node.items[0].key.commentBefore = node.commentBefore;
          delete node.commentBefore;
        }
      });

      // Switch by YAML nodes
      ymlDoc.contents?.items.forEach((pair) => {
        // Parse value
        switch (pair.key.value) {
          case 'conditions':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this._getConditionList().addSection(document.uri, document, pair.value);
              // Set key's Semantic Token
              if (pair.key.range) {
                this._getConditionList().getChildren().find(section => section.getUri() === document.uri)?.
                  addSemanticTokens({
                    offsetStart: pair.key.range[0],
                    offsetEnd: pair.key.range[1],
                    tokenType: SemanticTokenType.SectionKeyword
                  });
              }
            } else {
              // TODO: Diagnostics
            }
            break;
          case 'events':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this._getEventList().addSection(document.uri, document, pair.value);
              // Set key's Semantic Token
              if (pair.key.range) {
                this._getEventList().getChildren().find(section => section.getUri() === document.uri)?.
                  addSemanticTokens({
                    offsetStart: pair.key.range[0],
                    offsetEnd: pair.key.range[1],
                    tokenType: SemanticTokenType.SectionKeyword
                  });
              }
            } else {
              // TODO: Diagnostics
            }
            break;
          case 'objectives':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this._getObjectiveList().addSection(document.uri, document, pair.value);
              // Set key's Semantic Token
              if (pair.key.range) {
                this._getObjectiveList().getChildren().find(section => section.getUri() === document.uri)?.
                  addSemanticTokens({
                    offsetStart: pair.key.range[0],
                    offsetEnd: pair.key.range[1],
                    tokenType: SemanticTokenType.SectionKeyword
                  });
              }
              break;
            } else {
              // TODO: Diagnostics
            }
          case 'items':
            break;
          case 'conversations':
            if (isYamlMapPair(pair)) {
              pair.value?.items.forEach(p => {
                if (isYamlMapPair(p) && isMap<Scalar<string>>(p.value)) {
                  const conversation = this._getConversation(p.key.value);
                  if (conversation) {
                    conversation.addSection(document.uri, document, p.value);
                  } else {
                    this.addChild(new Conversation(this.uri, p.key.value, this));
                  }
                  // Set key's Semantic Token
                  if (pair.key.range) {
                    this._getConversation(p.key.value)?.getChildren().find(section => section.getUri() === document.uri)?.
                      addSemanticTokens({
                        offsetStart: pair.key.range[0],
                        offsetEnd: pair.key.range[1],
                        tokenType: SemanticTokenType.SectionKeyword
                      });
                  }
                } else {
                  // TODO: Diagnostics
                }
              });
            } else {
              // TODO: Diagnostics
            }
            break;
          default:
            break;
        }
      });
    });
  }

  private _getConditionList() {
    return this.getChild<ConditionList>('ConditionList')!;
  }

  private _getEventList() {
    return this.getChild<EventList>('EventList')!;
  }

  private _getObjectiveList() {
    return this.getChild<ObjectiveList>('ObjectiveList')!;
  }

  private _getConversation(conversationID: string) {
    return this.getChild<Conversation>('Conversation', c => c.conversationID === conversationID);
  }

  private _getConversations() {
    return this.getChildren<Conversation>('Conversation');
  }

  // Calculate the target package's uri by absolute / relative package path
  getPackageUri(targetPackagePath: string) {
    let packageUri = this.uri;
    // Empty
    if (targetPackagePath.length === 0) {
      return packageUri;
    }
    const packagePathArray = targetPackagePath.split("-");
    // Handle relative path
    if (packagePathArray[0] === '_') {
      packagePathArray.forEach(p => {
        if (p === '_') {
          packageUri = getParentUrl(packageUri);
        } else {
          packageUri += p + '/';
        }
      });
      return packageUri;
    }
    // Handle absolute path
    packageUri = this.parentAst.wsFolderUri + packagePathArray.join('/') + '/';
    return packageUri;
  }

  isPackageUri(packageUri: string) {
    return this.uri === packageUri;
  }

  // Get Condition entries from child or parent
  getConditionEntries(id: string, packageUri: string): ConditionEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this._getConditionList().getConditionEntries(id);
    } else {
      return this.parentAst.getV2ConditionEntry(id, packageUri);
    }
  }

  // Get Event entries from child or parent
  getEventEntries(id: string, packageUri: string): EventEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this._getEventList().getEventEntries(id, packageUri);
    } else {
      return this.parentAst.getV2EventEntry(id, packageUri);
    }
  }

  // Get Objective entries from child or parent
  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this._getObjectiveList().getObjectiveEntries(id, packageUri);
    } else {
      return this.parentAst.getV2ObjectiveEntry(id, packageUri);
    }
  }

  getConversationOptions<T extends ConversationOptionType>(type: T, optionID: string, conversationID?: string, packageUri?: string): NpcOption[] | PlayerOption[] {
    if (packageUri && this.isPackageUri(packageUri)) {
      return this.getChildren<Conversation>('Conversation').flatMap(c => c.getConversationOptions<T>(type, optionID).flat()) as NpcOption[] | PlayerOption[];
    }
    return this.parentAst.getV2ConversationOptions(type, optionID, conversationID, packageUri);
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    const diagnostics: Map<string, PublishDiagnosticsParams> = new Map();
    const cb = (d: PublishDiagnosticsParams) => {
      if (diagnostics.has(d.uri)) {
        // Consolidate diagnostics by uri
        diagnostics.get(d.uri)?.diagnostics.push(...d.diagnostics);
      } else {
        diagnostics.set(d.uri, d);
      }
    };
    this._getConditionList().getPublishDiagnosticsParams(documentUri).forEach(cb);
    this._getEventList().getPublishDiagnosticsParams(documentUri).forEach(cb);
    this._getObjectiveList().getPublishDiagnosticsParams(documentUri).forEach(cb);
    this._getConversations().forEach(conversation => {
      conversation.getPublishDiagnosticsParams(documentUri).forEach(cb);
    });
    return Array.from(diagnostics, ([_, d]) => d);
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const locations: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return locations;
    }
    if (yamlPath[0] === 'conditions') {
      locations.push(...this._getConditionList().getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === 'events') {
      locations.push(...this._getEventList().getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === 'objectives') {
      locations.push(...this._getObjectiveList().getLocations(yamlPath, sourceUri));
    }
    return locations;
  }

  getDefinitions(offset: number, uri?: string): LocationLinkOffset[] {
    const definitions: LocationLinkOffset[] = [];
    if (uri && !uri.startsWith(this.uri)) {
      return definitions;
    }

    this._getConversations().forEach(c => definitions.push(...c.getDefinitions(offset, uri)));
    // TODO: Condition / Event / Objective list

    return definitions;
  }
}
