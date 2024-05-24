import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap, isMap, isScalar, parseDocument } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { AST } from "../ast";
import { NodeV2, PackageV2Type } from "../node";
import { HoverInfo } from "../../utils/hover";
import { LocationLinkOffset } from "../../utils/location";
import { getParentUrl } from "../../utils/url";
import { ConditionList } from "./Condition/ConditionList";
import { EventList } from "./Event/EventList";
import { ObjectiveList } from "./Objective/ObjectiveList";
import { SemanticToken } from "../../service/semanticTokens";
import { Conversation } from "./Conversation/Conversation";
import { ConditionEntry } from "./Condition/ConditionEntry";
import { EventEntry } from "./Event/EventEntry";
import { ObjectiveEntry } from "./Objective/ObjectiveEntry";
import { isStringScalar, isStringScalarPair, isYamlMapPair } from "../../utils/yaml";

export class PackageV2 extends NodeV2<PackageV2Type> {
  protected type: PackageV2Type = "PackageV2";
  protected uri: string;
  protected parent: PackageV2 = this;
  private parentAst: AST;
  readonly packagePath: string[];

  conversations: Conversation[] = []; // TODO: Conversations[]
  conditionLists: ConditionList[] = [];
  eventLists: EventList[] = [];
  objectiveLists: ObjectiveList[] = [];

  constructor(packageUri: string, documents: TextDocument[], parent: AST) {
    super();
    this.uri = packageUri;
    this.parentAst = parent;

    // Calculate package's path
    this.packagePath = this.uri.slice(this.parentAst.wsFolderUri.length).replace(/^QuestPackages\//m, "").replace(/(?:\/)$/m, "").split('/');

    // Iterate all files and create nodes.
    documents.forEach((document) => {
      // Parse YAML document
      const yml = parseDocument<YAMLMap<Scalar<string>, any>, false>(
        document.getText(),
        {
          keepSourceTokens: true,
          strict: false
        }
      );

      // Switch by YAML nodes
      yml.contents?.items.forEach((pair) => {
        switch (pair.key.value) {
          case 'conditions':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this.conditionLists.push(new ConditionList(document.uri, document, pair.value, this));
            } else {
              // TODO: Diagnostics
            }
            break;
          case 'events':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this.eventLists.push(new EventList(document.uri, document, pair.value, this));
            } else {
              // TODO: Diagnostics
            }
            break;
          case 'objectives':
            if (isMap<Scalar<string>>(pair.value) && isStringScalar(pair.key)) {
              this.objectiveLists.push(new ObjectiveList(document.uri, document, pair.value, this));
              break;
            } else {
              // TODO: Diagnostics
            }
          case 'items':
            break;
          case 'conversations':
            if (isYamlMapPair(pair)) {
              pair.value?.items.forEach(p => {
                if (isYamlMapPair(p)) {
                  this.conversations?.push(new Conversation(document.uri, document, p, this));
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

  getDefinitions(uri: string, offset: number): LocationLinkOffset[] {
    // TODO
    return [];
  }

  // Get Condition entries from child or parent
  getConditionEntries(id: string, packageUri: string): ConditionEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.conditionLists?.flatMap(l => l.getConditionEntries(id, packageUri)) ?? [];
    } else {
      return this.parentAst.getV2ConditionEntry(id, packageUri);
    }
  }

  // Get Event entries from child or parent
  getEventEntries(id: string, packageUri: string): EventEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.eventLists?.flatMap(l => l.getEventEntries(id, packageUri)) ?? [];
    } else {
      return this.parentAst.getV2EventEntry(id, packageUri);
    }
  }

  // Get Objective entries from child or parent
  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.objectiveLists?.flatMap(l => l.getObjectiveEntries(id, packageUri)) ?? [];
    } else {
      return this.parentAst.getV2ObjectiveEntry(id, packageUri);
    }
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    const diagnostics: PublishDiagnosticsParams[] = [];
    this.conditionLists.forEach(l => {
      if (!documentUri || l.uri === documentUri) {
        diagnostics.push(l.getPublishDiagnosticsParams());
      }
    });
    this.eventLists.forEach(l => {
      if (!documentUri || l.uri === documentUri) {
        diagnostics.push(l.getPublishDiagnosticsParams());
      }
    });
    this.objectiveLists.forEach(l => {
      if (!documentUri || l.uri === documentUri) {
        diagnostics.push(l.getPublishDiagnosticsParams());
      }
    });
    // this.conversations?.forEach(conversation => {
    //   if (!documentUri || conversation.uri === documentUri) {
    //     diagnostics.push(conversation.getPublishDiagnosticsParams());
    //   }
    // });
    return diagnostics;
  }

  getSemanticTokens(uri: string) {
    const semanticTokens: SemanticToken[] = [];
    if (!uri.startsWith(this.uri)) {
      return semanticTokens;
    }
    semanticTokens.push(...this.conditionLists.flatMap(l => l.getSemanticTokens(uri)));
    semanticTokens.push(...this.eventLists.flatMap(l => l.getSemanticTokens(uri)));
    semanticTokens.push(...this.objectiveLists.flatMap(l => l.getSemanticTokens(uri)));
    return semanticTokens;
  }

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (!uri.startsWith(this.uri)) {
      return hoverInfo;
    }
    hoverInfo.push(...this.conditionLists.flatMap(l => l.getHoverInfo(uri, offset)));
    hoverInfo.push(...this.eventLists.flatMap(l => l.getHoverInfo(uri, offset)));
    hoverInfo.push(...this.objectiveLists.flatMap(l => l.getHoverInfo(uri, offset)));
    return hoverInfo;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const locations: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return locations;
    }
    if (yamlPath[0] === 'conditions') {
      locations.push(...this.conditionLists.flatMap(l => l.getLocations(yamlPath, sourceUri)));
    }
    if (yamlPath[0] === 'events') {
      locations.push(...this.eventLists.flatMap(l => l.getLocations(yamlPath, sourceUri)));
    }
    if (yamlPath[0] === 'objectives') {
      locations.push(...this.objectiveLists.flatMap(l => l.getLocations(yamlPath, sourceUri)));
    }
    return locations;
  }
}