import { MarkerType, Node, Edge } from "reactflow";
import * as yaml from "js-yaml";
import { arrayAppend, stringSplitToArray } from "./commonUtils";
import ConversationYamlModel, { ConversationYamlOptionModel } from "./conversationYamlModel";

export interface YamlReaderOutput {
  nodes: Node[];
  edges: Edge[];
}

export function readYaml(
  text: string,
  translationSelection: string,
): YamlReaderOutput | null {
  const data = yaml.load(text) as ConversationYamlModel;
  return parseYaml(data, translationSelection);
}

export function parseYaml(
  yaml: ConversationYamlModel,
  translationSelection?: string
): YamlReaderOutput | null {
  // Load
  const npcOptions = yaml.NPC_options;
  const playerOptions = yaml.player_options;
  const firstString = yaml.first;
  const firstKeys = stringSplitToArray(firstString || "");
  for (let i = 0; i < firstKeys.length; i++) {
    firstKeys[i] = `npcNode_${firstKeys[i]}`;
  }

  // Check if the yaml multilingual, if not remove "translationSelection".
  let isYamlMultilingual = Object.assign(new ConversationYamlModel(), yaml).isQuesterMultilingual();
  const npcOptionKeys = Object.keys(npcOptions || {});
  for (let i = 0; i < npcOptionKeys.length && npcOptions; i++) {
    isYamlMultilingual ||= Object.assign(new ConversationYamlOptionModel(), npcOptions[npcOptionKeys[i]]).isTextMultilingual();
  }
  const playerOptionKeys = Object.keys(playerOptions || {});
  for (let i = 0; i < playerOptionKeys.length && playerOptions; i++) {
    isYamlMultilingual ||= Object.assign(new ConversationYamlOptionModel(), playerOptions[playerOptionKeys[i]]).isTextMultilingual();
  }
  // remove all translationSelection marking if the yaml is not multilingual.
  if (!isYamlMultilingual) {
    translationSelection = undefined;
  }

  // StartNodes
  const startNode = {
    id: "startNodeID",
    type: "startNode",
    position: { x: 0, y: 0 },
    data: { yaml: yaml, translationSelection: translationSelection },
  };
  const startNodes: Record<string, Node> = { startNodeID: startNode };

  // NPC Nodes
  const npcNodes: Record<string, Node> = {};
  for (let i = 0; i < npcOptionKeys.length && npcOptions; i++) {
    const key = npcOptionKeys[i];
    const option = npcOptions[key];
    const idKey = `npcNode_${key}`;
    const pointersString = option.pointers || option.pointer || "";
    const pointers = stringSplitToArray(pointersString);
    for (let i = 0; i < pointers.length; i++) {
      pointers[i] = `playerNode_${pointers[i]}`;
    }

    const conditions = option.conditions || option.condition || "";
    const events = option.events || option.event || "";

    const dict = {
      id: idKey,
      type: "npcNode",
      position: { x: 0, y: 0 },
      data: {
        name: key,
        option: option,
        events: stringSplitToArray(events),
        conditions: stringSplitToArray(conditions),
        pointers: pointers,
        translationSelection: translationSelection,
      },
    };
    npcNodes[idKey] = dict;
  }

  // Player Nodes
  const playerNodes: Record<string, Node> = {};
  for (let i = 0; i < playerOptionKeys.length && playerOptions; i++) {
    const key = playerOptionKeys[i];
    const option = playerOptions[key];
    const idKey = `playerNode_${key}`;
    const pointersString = option.pointers || option.pointer || "";
    const pointers = stringSplitToArray(pointersString);
    for (let i = 0; i < pointers.length; i++) {
      pointers[i] = `npcNode_${pointers[i]}`;
    }

    const conditions = option.conditions || option.condition || "";
    const events = option.events || option.event || "";

    const dict = {
      id: idKey,
      type: "playerNode",
      position: { x: 0, y: 0 },
      data: {
        name: key,
        option: option,
        events: stringSplitToArray(events),
        conditions: stringSplitToArray(conditions),
        pointers: pointers,
        translationSelection: translationSelection,
      },
    };
    playerNodes[idKey] = dict;
  }

  // All Nodes
  const allNodes = Object.assign({}, startNodes, npcNodes, playerNodes);

  // Lines
  const lines: Record<string, Edge> = {};
  const linkedNodesRef: Record<string, string[]> = {
    nodes: ["startNodeID"],
  };
  let lastTargetNodeID = "";
  for (let i = 0; i < firstKeys.length; i++) {
    const toNodeID = firstKeys[i];
    if (i === 0) {
      linkIn(
        "startNodeID",
        "handleOut",
        toNodeID,
        allNodes,
        lines,
        linkedNodesRef
      );
    } else {
      linkIn(
        lastTargetNodeID,
        "handleN",
        toNodeID,
        allNodes,
        lines,
        linkedNodesRef
      );
    }
    lastTargetNodeID = toNodeID;
  }

  // Linked Nodes
  let unlinkedNodes = Object.assign({}, allNodes);
  const linkedNodes = linkedNodesRef.nodes;
  let orderedNodes: Node[] = [];
  for (let i = 0; i < linkedNodes.length; i++) {
    let key = linkedNodes[i];
    let node = allNodes[key];
    node.position = { x: i * 200, y: 0 };
    node.positionAbsolute = { x: 0, y: 0 };
    node.width = 200;
    if (node.type === "startNode") {
      node.height = 290;
    } else {
      let count = 0;
      const data = node.data;
      if (data) {
        if (data.conditions) {
          count += data.conditions.length;
        }
        if (data.events) {
          count += data.events.length;
        }
      }
      node.height = 202 + 20 * count;
    }

    orderedNodes = arrayAppend(orderedNodes, node);
    delete unlinkedNodes[key];
  }

  // Unlinked Nodes
  const unusedNodeKeys = Object.keys(unlinkedNodes);
  for (let i = 0; i < unusedNodeKeys.length; i++) {
    const key = unusedNodeKeys[i];
    const node = unlinkedNodes[key];

    node.position = { x: i * 200, y: 400 };
    node.positionAbsolute = { x: 0, y: 0 };
    node.width = 200;
    if (node.type === "startNode") {
      node.height = 148;
    } else {
      let count = 0;
      const data = node.data;
      if (data) {
        if (data.conditions) {
          count += data.conditions.length;
        }
        if (data.events) {
          count += data.events.length;
        }
      }
      node.height = 202 + 20 * count;
    }

    // free lines
    let pointers = node.data["pointers"];
    for (let i = 0; pointers && i < pointers.length; i++) {
      const toNodeID = pointers[i];
      if (i === 0) {
        linkIn(node.id, "handleOut", toNodeID, allNodes, lines, linkedNodesRef);
      } else {
        linkIn(
          lastTargetNodeID,
          "handleN",
          toNodeID,
          allNodes,
          lines,
          linkedNodesRef
        );
      }
      lastTargetNodeID = toNodeID;
    }
    orderedNodes = arrayAppend(orderedNodes, node);
    delete unlinkedNodes[key];
  }
  return { nodes: orderedNodes, edges: Object.values(lines) };
}

export function linkIn(
  sourceNodeID: string,
  sourceHandle: string,
  targetNodeID: string,
  allNodes: Record<string, Node>,
  lines: Record<string, Edge>,
  linkedNodesRef: Record<string, string[]> = {}
) {
  const targetNode = allNodes[targetNodeID];
  if (!targetNode) {
    return;
  }

  // Create new line
  const lineID = `line_${Object.values(lines).length}`;
  const line = {
    id: lineID,
    source: sourceNodeID,
    sourceHandle: sourceHandle,
    target: targetNodeID,
    targetHandle: "handleIn",
    type: "smoothstep",
    markerEnd: { type: MarkerType.ArrowClosed },
  };
  lines[lineID] = line;

  // Check if node has resolved
  const linkedNodes = linkedNodesRef.nodes || [];
  if (linkedNodes.includes(targetNodeID)) {
    // logWarning("Multiple links to a node.");
    return;
  }
  linkedNodesRef.nodes = arrayAppend(linkedNodes, targetNodeID);

  const pointers = targetNode.data["pointers"] || [];
  let lastNextNodeID = "";

  for (let i = 0; i < pointers.length; i++) {
    const nextNodeID = pointers[i];
    const nextNode = allNodes[nextNodeID];
    if (!nextNode) {
      return;
    }
    const targetNodeIsNPC = targetNode.type === "npcNode";
    const nextNodeIsNPC = nextNode.type === "npcNode";

    if (targetNodeIsNPC && nextNodeIsNPC) {
      linkIn(
        lastNextNodeID,
        "handleN",
        nextNodeID,
        allNodes,
        lines,
        linkedNodesRef
      );
    } else {
      linkIn(
        targetNodeID,
        "handleOut",
        nextNodeID,
        allNodes,
        lines,
        linkedNodesRef
      );
    }
    lastNextNodeID = targetNodeID;
  }
}
