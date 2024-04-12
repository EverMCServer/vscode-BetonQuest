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

export class PackageV2 extends Package<PackageV2Type> {
  offsetStart?: number;
  offsetEnd?: number;

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

  getPublishDiagnosticsParams(): PublishDiagnosticsParams[] {
    const diagnostics: PublishDiagnosticsParams[] = [];
    diagnostics.push(...this.conditionLists.map(l => l.getPublishDiagnosticsParams()));
    diagnostics.push(...this.eventLists.map(l => l.getPublishDiagnosticsParams()));
    diagnostics.push(...this.objectiveLists.map(l => l.getPublishDiagnosticsParams()));
    return diagnostics;
  }

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    const result: HoverInfo[] = [];
    if (!uri.startsWith(this.uri)) {
      return result;
    }
    result.push(...this.conditionLists.flatMap(l => l.getHoverInfo(uri, offset)));
    result.push(...this.eventLists.flatMap(l => l.getHoverInfo(uri, offset)));
    result.push(...this.objectiveLists.flatMap(l => l.getHoverInfo(uri, offset)));
    return result;
  }

  getLocations(yamlPath: string[], sourceUri: string) {
    const result: LocationsResponse = [];
    if (!sourceUri.startsWith(this.uri)) {
      return result;
    }
    if (yamlPath[0] === 'conditions') {
      result.push(...this.conditionLists.flatMap(l => l.getLocations(yamlPath, sourceUri)));
    }
    if (yamlPath[0] === 'events') {
      result.push(...this.eventLists.flatMap(l => l.getLocations(yamlPath, sourceUri)));
    }
    if (yamlPath[0] === 'objectives') {
      result.push(...this.objectiveLists.flatMap(l => l.getLocations(yamlPath, sourceUri)));
    }
    return result;
  }
}