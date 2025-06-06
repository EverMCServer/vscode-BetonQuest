import { CompletionItem, PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap, isMap, isSeq, parseDocument, visit } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { SemanticTokenType } from "../../service/semanticTokens";
import { HoverInfo } from "../../utils/hover";
import { LocationLinkOffset } from "../../utils/location";
import { getParentUrl } from "../../utils/url";
import { isStringScalar, isYamlMapPair } from "../../utils/yaml";
import { AST } from "../ast";
import { ConversationOptionType, PackageV2Type } from "../node";
import { AbstractNodeV2, NodeV2 } from "../v2";
import { ConditionEntry } from "./Condition/ConditionEntry";
import { ConditionList, ConditionListSection } from "./Condition/ConditionList";
import { Conversation } from "./Conversation/Conversation";
import { EventEntry } from "./Event/EventEntry";
import { EventList, EventListSection } from "./Event/EventList";
import { ObjectiveEntry } from "./Objective/ObjectiveEntry";
import { ObjectiveList, ObjectiveListSection } from "./Objective/ObjectiveList";

export class PackageV2 extends AbstractNodeV2<PackageV2Type> {
  readonly type: PackageV2Type = "PackageV2";
  readonly uri: string;
  readonly parent: PackageV2 = this;
  readonly parentAst: AST;
  readonly packagePath: string[];
  protected children: (ConditionList | EventList | ObjectiveList | Conversation)[] = [
    // Init Lists
    new ConditionList(this.uri, this),
    new EventList(this.uri, this),
    new ObjectiveList(this.uri, this)
  ];

  private documentVersions: Map<string, number | undefined> = new Map();

  constructor(packageUri: string, documents: TextDocument[], parent: AST) {
    super();
    this.uri = packageUri;
    this.parentAst = parent;

    // Calculate package's path
    this.packagePath = decodeURI(this.uri).slice(this.parentAst.wsFolderUri.length).replace(/^\/?QuestPackages\//m, "").replace(/(?:\/)$/m, "").split('/');

    this.update(documents);
  }

  // Update package with documents
  update(documents: TextDocument[]) {
    // // Skip if nothing changed
    // if (
    //   // No missing files
    //   this.documentVersions.size === documents.length &&
    //   // Versions matched
    //   documents.every(newDoc => newDoc.version === this.documentVersions.get(newDoc.uri))
    // ) {
    //   return;
    // }
    // // Update file versions
    // this.documentVersions = new Map();
    // documents.forEach(newDoc => this.documentVersions.set(newDoc.uri, newDoc.version));
    // this.children = [];

    // NEW:
    // Get documents that need to be updated / created
    const newDocs = documents.filter(newDoc => newDoc.version !== this.documentVersions.get(newDoc.uri));
    // Remove missing / outdated documents from AST
    const oldDocUris = [...this.documentVersions.keys()].filter(o => !newDocs.some(n => n.uri === o));
    this.children.forEach(e => e.filterSections(oldDocUris));

    // Iterate all files and create missing nodes.
    newDocs.forEach((document) => {
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
              this.getConditionList().addSection(document.uri, document, pair);
              // Set key's Semantic Token
              if (pair.key.range) {
                this.getConditionList().getChildren().find(section => section.getUri() === document.uri)?.
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
              this.getEventList().addSection(document.uri, document, pair);
              // Set key's Semantic Token
              if (pair.key.range) {
                this.getEventList().getChildren().find(section => section.getUri() === document.uri)?.
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
              this.getObjectiveList().addSection(document.uri, document, pair);
              // Set key's Semantic Token
              if (pair.key.range) {
                this.getObjectiveList().getChildren().find(section => section.getUri() === document.uri)?.
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
                if (isYamlMapPair<YAMLMap<Scalar<string>>>(p) && isMap<Scalar<string>>(p.value)) {
                  let conversation = this.getConversations(p.key.value)[0];
                  if (!conversation) {
                    conversation = new Conversation(this.uri, p.key.value, this);
                    this.addChild(conversation);
                  }
                  conversation.addSection(document.uri, document, p);
                  // Set key's Semantic Token
                  if (pair.key.range) {
                    conversation.getChildren().find(section => section.getUri() === document.uri)?.
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

    // Update file versions
    this.documentVersions = new Map();
    documents.forEach(newDoc => this.documentVersions.set(newDoc.uri, newDoc.version));

    // Run extra proccesses after node created 
    this._initDiagnosticsAndCodeActions();
  }

  // Get absolute Package path
  getPackagePath() {
    return this.packagePath;
  }

  getConditionList() {
    return this.getChild<ConditionList>('ConditionList')!;
  }

  getEventList() {
    return this.getChild<EventList>('EventList')!;
  }

  getObjectiveList() {
    return this.getChild<ObjectiveList>('ObjectiveList')!;
  }

  getConversations(conversationID?: string) {
    return this.getChildren<Conversation>('Conversation', c => !conversationID || c.conversationID === conversationID);
  }

  // Calculate the target package's uri by absolute / relative package path
  getPackageUri(targetPackagePath?: string) {
    let packageUri = this.uri;
    // Empty
    if (!targetPackagePath || targetPackagePath.length === 0) {
      return packageUri;
    }
    const packagePathArray = targetPackagePath.split("-");
    if (packagePathArray[0] === '_') {
      // Relative path going up
      for (let i = 0; i < packagePathArray.length; i++) {
        if (packagePathArray[i] === '_') {
          packageUri = getParentUrl(packageUri);
        } else {
          packageUri += packagePathArray.slice(i).join('/') + '/';
          break;
        }
      }
    } else if (packagePathArray[0] === '') {
      // Relative path going down
      packageUri += packagePathArray.slice(1).join('/') + '/';
    } else {
      // Absolute path
      packageUri = this.parentAst.packageRootUriV2 + packagePathArray.join('/') + '/';
    }
    return packageUri;
  }

  isPackageUri(packageUri: string) {
    return this.uri === packageUri;
  }

  // Get Condition entries from child or parent
  getConditionEntries(id?: string, packageUri?: string): ConditionEntry[] {
    if (!id) {
      return this.getConditionList().getChildren<ConditionListSection>("ConditionListSection").flatMap(e => e.getChildren<ConditionEntry>("ConditionEntry"));
    } else if (!packageUri || this.isPackageUri(packageUri)) {
      return this.getConditionList().getConditionEntries(id);
    } else {
      return this.parentAst.getV2ConditionEntry(id, packageUri);
    }
  }
  getAllConditionEntries(): ConditionEntry[] {
    return this.parentAst.getV2AllConditionEntries();
  }

  // Get Event entries from child or parent
  getEventEntries(id?: string, packageUri?: string): EventEntry[] {
    if (!id) {
      return this.getEventList().getChildren<EventListSection>("EventListSection").flatMap(e => e.getChildren<EventEntry>("EventEntry"));
    } else if (!packageUri || this.isPackageUri(packageUri)) {
      return this.getEventList().getEventEntries(id, packageUri);
    } else {
      return this.parentAst.getV2EventEntry(id, packageUri);
    }
  }
  getAllEventEntries(): EventEntry[] {
    return this.parentAst.getV2AllEventEntries();
  }

  // Get Objective entries from child or parent
  getObjectiveEntries(id?: string, packageUri?: string): ObjectiveEntry[] {
    if (!id) {
      return this.getObjectiveList().getChildren<ObjectiveListSection>("ObjectiveListSection").flatMap(e => e.getChildren<ObjectiveEntry>("ObjectiveEntry"));
    } else if (!packageUri || this.isPackageUri(packageUri)) {
      return this.getObjectiveList().getObjectiveEntries(id, packageUri);
    } else {
      return this.parentAst.getV2ObjectiveEntry(id, packageUri);
    }
  }
  getAllObjectiveEntries(): ObjectiveEntry[] {
    return this.parentAst.getV2AllObjectiveEntries();
  }

  getConversationOptions<T extends ConversationOptionType>(type: T, optionID?: string, conversationID?: string, packageUri?: string) {
    return this.parentAst.getV2ConversationOptions(type, optionID, conversationID, packageUri);
  }

  getConversationOptionPointers(type: ConversationOptionType, optionID: string, conversationID?: string, packageUri?: string) {
    return this.parentAst.getV2ConversationOptionPointers(type, optionID, conversationID, packageUri);
  }

  getConversationConditionPointers(conditionID?: string, packageUri?: string) {
    return this.parentAst.getV2ConversationConditionPointers(conditionID, packageUri);
  }

  getConversationEventPointers(eventID?: string, packageUri?: string) {
    return this.parentAst.getV2ConversationEventPointers(eventID, packageUri);
  }

  getPublishDiagnosticsParams(): PublishDiagnosticsParams[] {
    const diagnostics: Map<string, PublishDiagnosticsParams> = new Map();
    const cb = (d: PublishDiagnosticsParams) => {
      if (diagnostics.has(d.uri)) {
        // Consolidate diagnostics by uri
        diagnostics.get(d.uri)?.diagnostics.push(...d.diagnostics);
      } else {
        diagnostics.set(d.uri, d);
      }
    };
    this.getConditionList().getPublishDiagnosticsParams().forEach(cb);
    this.getEventList().getPublishDiagnosticsParams().forEach(cb);
    this.getObjectiveList().getPublishDiagnosticsParams().forEach(cb);
    this.getConversations().forEach(conversation => {
      conversation.getPublishDiagnosticsParams().forEach(cb);
    });
    return Array.from(diagnostics, ([_, d]) => d);
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const locations: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return locations;
    }
    if (yamlPath[0] === 'conditions') {
      locations.push(...this.getConditionList().getLocations(yamlPath, sourceUri).flat());
    }
    if (yamlPath[0] === 'events') {
      locations.push(...this.getEventList().getLocations(yamlPath, sourceUri).flat());
    }
    if (yamlPath[0] === 'objectives') {
      locations.push(...this.getObjectiveList().getLocations(yamlPath, sourceUri).flat());
    }
    return locations;
  }

  _getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    if (documentUri && !documentUri.startsWith(this.uri)) {
      return [];
    }
    return this.children
      .flatMap(c => c._getHoverInfo(offset, documentUri));
  }

  _getDefinitions(offset: number, documentUri?: string): LocationLinkOffset[] {
    if (documentUri && !documentUri.startsWith(this.uri)) {
      return [];
    }
    return this.children
      .flatMap(c => c._getDefinitions(offset, documentUri));
  }

  _getReferences(offset: number, documentUri?: string): LocationLinkOffset[] {
    if (documentUri && !documentUri.startsWith(this.uri)) {
      return [];
    }
    return this.children
      .flatMap(c => c._getReferences(offset, documentUri));
  }

  _getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    if (documentUri && !documentUri.startsWith(this.uri)) {
      return [];
    }
    return this.children
      .flatMap(c => c._getCompletions(offset, documentUri));
  }
}
