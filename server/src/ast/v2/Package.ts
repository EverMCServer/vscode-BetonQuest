import { CodeAction, PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap, isMap, isSeq, parseDocument, visit } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { AST } from "../ast";
import { NodeV2, PackageV2Type } from "../node";
import { HoverInfo } from "../../utils/hover";
import { LocationLinkOffset } from "../../utils/location";
import { getParentUrl } from "../../utils/url";
import { isStringScalar, isYamlMapPair } from "../../utils/yaml";
import { ConditionList } from "./Condition/ConditionList";
import { EventList } from "./Event/EventList";
import { ObjectiveList } from "./Objective/ObjectiveList";
import { SemanticToken } from "../../service/semanticTokens";
import { Conversation } from "./Conversation/Conversation";
import { ConditionEntry } from "./Condition/ConditionEntry";
import { EventEntry } from "./Event/EventEntry";
import { ObjectiveEntry } from "./Objective/ObjectiveEntry";

export class PackageV2 extends NodeV2<PackageV2Type> {
  protected type: PackageV2Type = "PackageV2";
  protected uri: string;
  protected parent: PackageV2 = this;
  private parentAst: AST;
  readonly packagePath: string[];

  conversations: Map<string, Conversation> = new Map(); // key = Conversation's key
  conditionLists: ConditionList;
  eventLists: EventList;
  objectiveLists: ObjectiveList;

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
        switch (pair.key.value) {
          case 'conditions':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this.conditionLists.addSection(document.uri, document, pair.value);
            } else {
              // TODO: Diagnostics
            }
            break;
          case 'events':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this.eventLists.addSection(document.uri, document, pair.value);
            } else {
              // TODO: Diagnostics
            }
            break;
          case 'objectives':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this.objectiveLists.addSection(document.uri, document, pair.value);
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
                    this.conversations.set(p.key.value, new Conversation(this.uri, this));
                  }
                  this.conversations.get(p.key.value)!.addSection(document.uri, document, p.value);
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

  getHoverInfo(documentUri: string, offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (!documentUri.startsWith(this.uri)) {
      return hoverInfo;
    }
    hoverInfo.push(...this.conditionLists.getHoverInfo(documentUri, offset));
    hoverInfo.push(...this.eventLists.getHoverInfo(documentUri, offset));
    hoverInfo.push(...this.objectiveLists.getHoverInfo(documentUri, offset));
    this.conversations.forEach(c => {
      hoverInfo.push(...c.getHoverInfo(documentUri, offset));
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

  getDefinitions(uri: string, offset: number): LocationLinkOffset[] {
    const definitions: LocationLinkOffset[] = [];
    if (!uri.startsWith(this.uri)) {
      return definitions;
    }

    this.conversations.forEach(c => definitions.push(...c.getDefinitions(uri, offset)));
    // TODO: Condition / Event / Objective list

    return definitions;
  }
}