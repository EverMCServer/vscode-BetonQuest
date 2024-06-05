import { CodeAction, PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Pair, Scalar, YAMLMap, isMap, isSeq, parseDocument, visit } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { AST } from "../ast";
import { ConversationOptionType, PackageV2Type } from "../node";
import { HoverInfo } from "../../utils/hover";
import { LocationLinkOffset } from "../../utils/location";
import { getParentUrl } from "../../utils/url";
import { isStringScalar, isYamlMapPair } from "../../utils/yaml";
import { ConditionList } from "./Condition/ConditionList";
import { EventList } from "./Event/EventList";
import { ObjectiveList } from "./Objective/ObjectiveList";
import { SemanticToken, SemanticTokenType } from "../../service/semanticTokens";
import { Conversation } from "./Conversation/Conversation";
import { ConditionEntry } from "./Condition/ConditionEntry";
import { EventEntry } from "./Event/EventEntry";
import { ObjectiveEntry } from "./Objective/ObjectiveEntry";
import { Option } from "./Conversation/Option/Option";
import { AbstractNodeV2 } from "../v2";

export class PackageV2 extends AbstractNodeV2<PackageV2Type> {
  type: PackageV2Type = "PackageV2";
  readonly uri: string;
  parent: PackageV2 = this;
  readonly parentAst: AST;
  readonly packagePath: string[];

  conditionLists: ConditionList;
  eventLists: EventList;
  objectiveLists: ObjectiveList;
  conversations: Map<string, Conversation> = new Map(); // key = Conversation's key

  constructor(packageUri: string, documents: TextDocument[], parent: AST) {
    super();
    this.uri = packageUri;
    this.parentAst = parent;

    // Init Lists
    this.conditionLists = new ConditionList(this.uri, this);
    this.eventLists = new EventList(this.uri, this);
    this.objectiveLists = new ObjectiveList(this.uri, this);

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
              this.conditionLists.addSection(document.uri, document, pair.value);
              // Set key's Semantic Token
              if (pair.key.range) {
                this.conditionLists.entriesSections.find(section => section.uri === document.uri)?.
                  semanticTokens.push({
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
              this.eventLists.addSection(document.uri, document, pair.value);
              // Set key's Semantic Token
              if (pair.key.range) {
                this.eventLists.entriesSections.find(section => section.uri === document.uri)?.
                  semanticTokens.push({
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
              this.objectiveLists.addSection(document.uri, document, pair.value);
              // Set key's Semantic Token
              if (pair.key.range) {
                this.objectiveLists.entriesSections.find(section => section.uri === document.uri)?.
                  semanticTokens.push({
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
                  if (!this.conversations.has(p.key.value)) {
                    this.conversations.set(p.key.value, new Conversation(this.uri, p.key.value, this));
                  }
                  this.conversations.get(p.key.value)?.addSection(document.uri, document, p.value);
                  // Set key's Semantic Token
                  if (pair.key.range) {
                    this.conversations.get(p.key.value)?.conversationSections.find(section => section.uri === document.uri)?.
                      semanticTokens.push({
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
      return this.conditionLists.getConditionEntries(id);
    } else {
      return this.parentAst.getV2ConditionEntry(id, packageUri);
    }
  }

  // Get Event entries from child or parent
  getEventEntries(id: string, packageUri: string): EventEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.eventLists.getEventEntries(id, packageUri);
    } else {
      return this.parentAst.getV2EventEntry(id, packageUri);
    }
  }

  // Get Objective entries from child or parent
  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.objectiveLists.getObjectiveEntries(id, packageUri);
    } else {
      return this.parentAst.getV2ObjectiveEntry(id, packageUri);
    }
  }

  getConversationOptions<T extends ConversationOptionType>(type: T, optionID: string, conversationID: string, packageUri: string): Option<T>[] {
    if (!this.isPackageUri(packageUri)) {
      return this.parentAst.getV2ConversationOptions(type, optionID, conversationID, packageUri);
    }
    const options: Option<T>[] = [];
    this.conversations.forEach((c, k) => {
      if (k === conversationID) {
        options.push(...c.getConversationOptions<T>(type, optionID));
      }
    });
    return options;
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
    this.conditionLists.getPublishDiagnosticsParams(documentUri).forEach(cb);
    this.eventLists.getPublishDiagnosticsParams(documentUri).forEach(cb);
    this.objectiveLists.getPublishDiagnosticsParams(documentUri).forEach(cb);
    this.conversations.forEach(conversation => {
      conversation.getPublishDiagnosticsParams(documentUri).forEach(cb);
    });
    return Array.from(diagnostics, ([_, d]) => d);
  }

  getCodeActions(documentUri?: string) {
    const codeActions: CodeAction[] = [];
    // Get Conversations' code actions
    this.conversations.forEach(c => {
      codeActions.push(...c.getCodeActions());
    });
    return codeActions;
  }

  getSemanticTokens(documentUri: string) {
    const semanticTokens: SemanticToken[] = [];
    semanticTokens.push(...this.conditionLists.getSemanticTokens(documentUri));
    semanticTokens.push(...this.eventLists.getSemanticTokens(documentUri));
    semanticTokens.push(...this.objectiveLists.getSemanticTokens(documentUri));
    this.conversations.forEach(c => {
      semanticTokens.push(...c.getSemanticTokens(documentUri));
    });
    return semanticTokens.sort((a, b) => a.offsetStart - b.offsetStart);
  }

  getHoverInfo(offset: number, documentUri: string): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (!documentUri.startsWith(this.uri)) {
      return hoverInfo;
    }
    hoverInfo.push(...this.conditionLists.getHoverInfo(offset, documentUri));
    hoverInfo.push(...this.eventLists.getHoverInfo(offset, documentUri));
    hoverInfo.push(...this.objectiveLists.getHoverInfo(offset, documentUri));
    this.conversations.forEach(c => {
      hoverInfo.push(...c.getHoverInfo(offset, documentUri));
    });
    return hoverInfo;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const locations: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return locations;
    }
    if (yamlPath[0] === 'conditions') {
      locations.push(...this.conditionLists.getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === 'events') {
      locations.push(...this.eventLists.getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === 'objectives') {
      locations.push(...this.objectiveLists.getLocations(yamlPath, sourceUri));
    }
    return locations;
  }

  getDefinitions(offset: number, uri: string): LocationLinkOffset[] {
    const definitions: LocationLinkOffset[] = [];
    if (!uri.startsWith(this.uri)) {
      return definitions;
    }

    this.conversations.forEach(c => definitions.push(...c.getDefinitions(offset, uri)));
    // TODO: Condition / Event / Objective list

    return definitions;
  }
}