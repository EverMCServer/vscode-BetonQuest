import { PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap, parseDocument } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { Package } from "../Package";
import { ConversationListType, Node, PackageV2Type } from "../node";
import { HoverInfo } from "../../utils/hover";
import { ConditionList } from "./Condition/ConditionList";
import { EventList } from "./Event/EventList";
import { ObjectiveList } from "./Objective/ObjectiveList";
import { SemanticToken } from "../../service/semanticTokens";

export class PackageV2 extends Package<PackageV2Type> {
  conversationList: Node<ConversationListType>[] = []; // TODO: Conversations[]
  conditionLists: ConditionList[] = [];
  eventLists: EventList[] = [];
  objectiveLists: ObjectiveList[] = [];

  constructor(packageUri: string, documents: TextDocument[]) {
    super("PackageV2", packageUri);

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
      yml.contents?.items.forEach((item) => {
        switch (item.key.value) {
          case 'conditions':
            this.conditionLists.push(new ConditionList(document.uri, document, item.value, this));
            break;
          case 'events':
            this.eventLists.push(new EventList(document.uri, document, item.value, this));
            break;
          case 'objectives':
            this.objectiveLists.push(new ObjectiveList(document.uri, document, item.value, this));
            break;
          case 'items':
            break;
          case 'conversations':
            break;
          default:
            break;
        }
      });
    });
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