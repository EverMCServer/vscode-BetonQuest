import { CodeAction, PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { AST } from "../ast";
import { NodeV1, PackageV1Type } from "../node";
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

export class PackageV1 extends NodeV1<PackageV1Type> {
  protected type: PackageV1Type = "PackageV1";
  protected uri: string;
  protected parent: PackageV1 = this;
  private parentAst: AST;
  readonly packagePath: string[];

  conditionList?: ConditionList;
  eventList?: EventList;
  objectiveList?: ObjectiveList;
  conversations?: Conversation[] = [];

  constructor(packageUri: string, documents: TextDocument[], parent: AST) {
    super();
    this.uri = packageUri;
    this.parentAst = parent;

    // Calculate package's path
    this.packagePath = this.uri.slice(this.parentAst.wsFolderUri.length).replace(/(?:\/)$/m, "").split('/');

    // Parse sub Nodes by types
    documents.forEach((document) => {
      const u = new URL(document.uri);
      const p = u.pathname.split('/');
      switch (p[p.length - 1]) {
        case 'main.yml':
          break;
        case 'conditions.yml':
          this.conditionList = new ConditionList(document.uri, document, this);
          break;
        case 'events.yml':
          this.eventList = new EventList(document.uri, document, this);
          break;
        case 'objectives.yml':
          this.objectiveList = new ObjectiveList(document.uri, document, this);
          break;
        case 'journal.yml':
          break;
        case 'items.yml':
          break;
        case 'custom.yml':
          break;
        default:
          if (p[p.length - 2] === 'conversations') {
            this.conversations?.push(new Conversation(document.uri, document, this));
          }
          break;
      }
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
      return this.conditionList?.getConditionEntries(id, packageUri) ?? [];
    } else  {
      return this.parentAst.getV1ConditionEntry(id, packageUri);
    }
  }

  // Get Event entries from child or parent
  getEventEntries(id: string, packageUri: string): EventEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.eventList?.getEventEntries(id, packageUri) ?? [];
    } else  {
      return this.parentAst.getV1EventEntry(id, packageUri);
    }
  }

  // Get Objective entries from child or parent
  getObjectiveEntries(id: string, packageUri: string): ObjectiveEntry[] {
    if (this.isPackageUri(packageUri)) {
      return this.objectiveList?.getObjectiveEntries(id, packageUri) ?? [];
    } else  {
      return this.parentAst.getV1ObjectiveEntry(id, packageUri);
    }
  }

  getPublishDiagnosticsParams(documentUri?: string): PublishDiagnosticsParams[] {
    const diagnostics: PublishDiagnosticsParams[] = [];
    if (this.conditionList && (!documentUri || this.conditionList.uri === documentUri)) {
      diagnostics.push(this.conditionList.getPublishDiagnosticsParams());
    }
    if (this.eventList && (!documentUri || this.eventList.uri === documentUri)) {
      diagnostics.push(this.eventList.getPublishDiagnosticsParams());
    }
    if (this.objectiveList && (!documentUri || this.objectiveList.uri === documentUri)) {
      diagnostics.push(this.objectiveList.getPublishDiagnosticsParams());
    }
    this.conversations?.forEach(conversation => {
      if (!documentUri || conversation.uri === documentUri) {
        diagnostics.push(conversation.getPublishDiagnosticsParams());
      }
    });
    return diagnostics;
  }

  getCodeActions(documentUri?: string) {
    const codeActions: CodeAction[] = [];
    // Get Conversations' code actions
    this.conversations?.forEach(c => {
      if (!documentUri || c.uri === documentUri) {
        codeActions.push(...c.getCodeActions());
      }
    });
    return codeActions;
  }

  getSemanticTokens(documentUri: string) {
    const semanticTokens: SemanticToken[] = [];
    if (this.conditionList) {
      semanticTokens.push(...this.conditionList.getSemanticTokens(documentUri));
    }
    if (this.eventList) {
      semanticTokens.push(...this.eventList.getSemanticTokens(documentUri));
    }
    if (this.objectiveList) {
      semanticTokens.push(...this.objectiveList.getSemanticTokens(documentUri));
    }
    return semanticTokens;
  }

  getHoverInfo(uri: string, offset: number) {
    const hoverInfo: HoverInfo[] = [];
    if (!uri.startsWith(this.uri)) {
      return hoverInfo;
    }
    if (this.conditionList) {
      hoverInfo.push(...this.conditionList.getHoverInfo(uri, offset));
    }
    if (this.eventList) {
      hoverInfo.push(...this.eventList.getHoverInfo(uri, offset));
    }
    if (this.objectiveList) {
      hoverInfo.push(...this.objectiveList.getHoverInfo(uri, offset));
    }
    return hoverInfo;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const locations: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return locations;
    }
    if (yamlPath[0] === '@conditions' && this.conditionList) {
      locations.push(...this.conditionList.getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === '@events' && this.eventList) {
      locations.push(...this.eventList.getLocations(yamlPath, sourceUri));
    }
    if (yamlPath[0] === '@objectives' && this.objectiveList) {
      locations.push(...this.objectiveList.getLocations(yamlPath, sourceUri));
    }
    return locations;
  }

  getDefinitions(uri: string, offset: number): LocationLinkOffset[] {
    if (!uri.startsWith(this.uri)) {
      return [];
    }

    return [
      ...this.conversations?.flatMap(c => c.getDefinitions(uri, offset)) || [],
      ...this.conditionList?.getDefinitions(uri, offset) || [],
      ...this.eventList?.getDefinitions(uri, offset) || [],
      ...this.objectiveList?.getDefinitions(uri, offset) || [],
      // TODO...
    ];
  }
}