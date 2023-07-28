import { MarkerType, Node, Edge } from "reactflow";
import yaml from "js-yaml";
import { arrayAppend, logWarning, stringSplitToArray } from "./commonUtils";

export interface YamlReaderOutput {
  nodes: Node[];
  edges: Edge[];
}

export function readYaml(
  fileName: string,
  text: string
): YamlReaderOutput | null {
  const data = yaml.load(text) as YamlModel;
  return parseYaml(fileName, data);
}

export function parseYaml(
  fileName: string,
  yaml: YamlModel
): YamlReaderOutput | null {
  // Load
  const NPC_options = yaml.NPC_options;
  const player_options = yaml.player_options;
  const firstString = yaml.first;
  const firstKeys = stringSplitToArray(firstString || "");
  for (let i = 0; i < firstKeys.length; i++) {
    firstKeys[i] = `npc_${firstKeys[i]}`;
  }

  // StartNodes
  const startNode = {
    id: "startNodeID",
    type: "startNode",
    position: { x: 0, y: 0 },
    data: { name: "start", text: fileName, text2: yaml.quester },
  };
  const startNodes: Record<string, Node> = { startNodeID: startNode };

  // NPC Nodes
  const npcNodes: Record<string, Node> = {};
  const NPC_optionKeys = Object.keys(NPC_options || {});
  for (let i = 0; i < NPC_optionKeys.length && NPC_options; i++) {
    const key = NPC_optionKeys[i];
    const option = NPC_options[key];
    const idKey = `npc_${key}`;
    const pointersString = option.pointers || option.pointer || "";
    const pointers = stringSplitToArray(pointersString);
    for (let i = 0; i < pointers.length; i++) {
      pointers[i] = `player_${pointers[i]}`;
    }

    const conditions = option.conditions || option.condition || "";
    const events = option.events || option.event || "";

    const dict = {
      id: idKey,
      type: "npcNode",
      position: { x: 0, y: 0 },
      data: {
        name: key,
        text: option.text,
        events: stringSplitToArray(events),
        conditions: stringSplitToArray(conditions),
        pointers: pointers,
      },
    };
    npcNodes[idKey] = dict;
  }

  // Player Nodes
  const playerNodes: Record<string, Node> = {};
  const player_optionKeys = Object.keys(player_options || {});
  for (let i = 0; i < player_optionKeys.length && player_options; i++) {
    const key = player_optionKeys[i];
    const option = player_options[key];
    const idKey = `player_${key}`;
    const pointersString = option.pointers || option.pointer || "";
    const pointers = stringSplitToArray(pointersString);
    for (let i = 0; i < pointers.length; i++) {
      pointers[i] = `npc_${pointers[i]}`;
    }

    const conditions = option.conditions || option.condition || "";
    const events = option.events || option.event || "";

    const dict = {
      id: idKey,
      type: "playerNode",
      position: { x: 0, y: 0 },
      data: {
        name: key,
        text: option.text,
        events: stringSplitToArray(events),
        conditions: stringSplitToArray(conditions),
        pointers: pointers,
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
    type: "step",
    markerEnd: { type: MarkerType.ArrowClosed },
  };
  lines[lineID] = line;

  // Check if node has resolved
  const linkedNodes = linkedNodesRef.nodes || [];
  if (linkedNodes.includes(targetNodeID)) {
    logWarning("Multiple links to a node.");
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