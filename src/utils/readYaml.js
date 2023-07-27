import { MarkerType } from "reactflow";
import yaml from "js-yaml";
import {
  arrayAppend,
  logError,
  logWarning,
  stringSplitToArray,
} from "./commonUtils";

export function readYaml(fileName, text) {
  try {
    const data = yaml.load(text);
    return parseYaml(fileName, data);
  } catch (error) {
    logError(`Parsing Yaml ${error}`);
    return null;
  }
}

export function parseYaml(fileName, yaml) {
  // Load
  const NPC_options = yaml["NPC_options"];
  const player_options = yaml["player_options"];
  const firstString = yaml["first"];
  const firstKeys = stringSplitToArray(firstString);
  for (let i = 0; i < firstKeys.length; i++) {
    firstKeys[i] = `npc_${firstKeys[i]}`;
  }

  // StartNodes
  const startNode = {
    id: "startNodeID",
    type: "startNode",
    data: { name: "start", text: fileName, text2: yaml["quester"] },
  };
  const startNodes = { start: startNode };

  // NPC Nodes
  const npcNodes = {};
  const NPC_optionKeys = Object.keys(NPC_options);
  for (let i = 0; i < NPC_optionKeys.length; i++) {
    const key = NPC_optionKeys[i];
    const option = NPC_options[key];
    const idKey = `npc_${key}`;
    const pointersString = option["pointers"] || option["pointer"] || "";
    const pointers = stringSplitToArray(pointersString);
    for (let i = 0; i < pointers.length; i++) {
      pointers[i] = `player_${pointers[i]}`;
    }

    const dict = {
      id: idKey,
      type: "npcNode",
      pointers: pointers,
    };

    const conditions = option["conditions"] || option["condition"] || "";
    const events = option["events"] || option["event"] || "";
    dict["data"] = {
      name: key,
      text: option["text"],
      events: stringSplitToArray(events),
      conditions: stringSplitToArray(conditions),
    };
    npcNodes[idKey] = dict;
  }

  // Player Nodes
  const playerNodes = {};
  const player_optionKeys = Object.keys(player_options);
  for (let i = 0; i < player_optionKeys.length; i++) {
    const key = player_optionKeys[i];
    const option = player_options[key];
    const idKey = `player_${key}`;
    const pointersString = option["pointers"] || option["pointer"] || "";
    const pointers = stringSplitToArray(pointersString);
    for (let i = 0; i < pointers.length; i++) {
      pointers[i] = `npc_${pointers[i]}`;
    }

    const dict = {
      id: idKey,
      type: "playerNode",
      pointers: pointers,
    };

    const conditions = option["conditions"] || option["condition"] || "";
    const events = option["events"] || option["event"] || "";
    dict["data"] = {
      name: key,
      text: option["text"],
      events: stringSplitToArray(events),
      conditions: stringSplitToArray(conditions),
    };
    playerNodes[idKey] = dict;
  }

  // All Nodes
  const allNodes = Object.assign({}, startNodes, npcNodes, playerNodes);

  // Lines
  const lines = {};
  const linkedNodesRef = { nodes: [] };
  let lastTargetNodeID = "";
  for (let i = 0; i < firstKeys.length; i++) {
    const toNodeID = firstKeys[i];
    if (i == 0) {
      linkIn("start", "handleOut", toNodeID, allNodes, lines, linkedNodesRef);
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
  const linkedNodes = linkedNodesRef.nodes;
  let orderdNodes = [];
  for (let i = 0; i < linkedNodes.length; i++) {
    let key = linkedNodes[i];
    let node = allNodes[key];
    node.position = { x: i * 200, y: 0 };
    node.positionAbsolute = { x: 0, y: 0 };
    node.width = 0;
    node.height = 0;

    orderdNodes = arrayAppend(orderdNodes, node);
    delete allNodes[key];
  }

  // Unlinked Nodes
  const unusedNodeKeys = Object.keys(allNodes);
  for (let i = 0; i < unusedNodeKeys.length; i++) {
    const key = unusedNodeKeys[i];
    const node = allNodes[key];

    node.position = { x: i * 200, y: 400 };
    node.positionAbsolute = { x: 0, y: 0 };
    node.width = 0;
    node.height = 0;

    orderdNodes = arrayAppend(orderdNodes, node);
    delete allNodes[key];
  }
  return { nodes: orderdNodes, edges: Object.values(lines) };
}

export function linkIn(
  sourceNodeID,
  sourceHandle,
  targetNodeID,
  allNodes,
  lines,
  linkedNodesRef
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
  const linkedNodes = linkedNodesRef.nodes;
  if (linkedNodes.includes(targetNodeID)) {
    logWarning("Multiple links to a node.");
    return;
  }
  linkedNodesRef.nodes = arrayAppend(linkedNodes, targetNodeID);

  const pointers = targetNode["pointers"];
  let lastNextNodeID = "";

  for (let i = 0; i < pointers.length; i++) {
    const nextNodeID = pointers[i];
    const nextNode = allNodes[nextNodeID];
    if (!nextNode) {
      return;
    }
    const targetNodeIsNPC = targetNode["type"] == "npcNode";
    const nextNodeIsNPC = nextNode["type"] == "npcNode";

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
