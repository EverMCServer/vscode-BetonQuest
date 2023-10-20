import { MarkerType, Node, Edge } from "reactflow";
import { arrayAppend } from "./commonUtils";
import { NodeData } from "../Nodes/Nodes";
import Conversation from "../../../../../betonquest/Conversation";

export interface YamlReaderOutput {
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export function conversationToFlow(
  conversation: Conversation,
  syncYaml: (delay?: number) => void,
  translationSelection?: string
): YamlReaderOutput {
  // Load
  const npcOptions = conversation.getAllNpcOptions();
  const playerOptions = conversation.getAllPlayerOptions();
  const firstKeys = conversation.getFirst();
  for (let i = 0; i < firstKeys.length; i++) {
    firstKeys[i] = `npcNode_${firstKeys[i]}`;
  }

  // Check if the yaml multilingual, if not remove "translationSelection".
  if (!conversation.isMultilingual()) {
    translationSelection = undefined;
  }

  // StartNodes
  const startNode: Node<NodeData> = {
    id: "startNodeID",
    type: "startNode",
    position: { x: 0, y: 0 },
    data: {
      syncYaml: syncYaml,
      translationSelection: translationSelection,
      conversation: conversation
    },
  };
  const startNodes: Record<string, Node<NodeData>> = { startNodeID: startNode };

  // NPC Nodes
  const npcNodes: Record<string, Node<NodeData>> = {};
  for (let i = 0; i < npcOptions.length && npcOptions; i++) {
    const option = npcOptions[i];
    const key = option.getName();
    const idKey = `npcNode_${key}`;
    // const pointers = option.getPointerNames();
    // for (let i = 0; i < pointers.length; i++) {
    //   pointers[i] = `playerNode_${pointers[i]}`;
    // }

    const dict: Node<NodeData> = {
      id: idKey,
      type: "npcNode",
      position: { x: 0, y: 0 },
      data: {
        syncYaml: syncYaml,
        translationSelection: translationSelection,
        option: option
      },
    };
    npcNodes[idKey] = dict;
  }

  // Player Nodes
  const playerNodes: Record<string, Node<NodeData>> = {};
  for (let i = 0; i < playerOptions.length && playerOptions; i++) {
    const option = playerOptions[i];
    const key = option.getName();
    const idKey = `playerNode_${key}`;
    // const pointers = option.getPointerNames();
    // for (let i = 0; i < pointers.length; i++) {
    //   pointers[i] = `playerNode_${pointers[i]}`;
    // }

    const dict = {
      id: idKey,
      type: "playerNode",
      position: { x: 0, y: 0 },
      data: {
        syncYaml: syncYaml,
        translationSelection: translationSelection,
        option: option
      },
    };
    playerNodes[idKey] = dict;
  }

  // Combine All Nodes
  const allNodes = Object.assign({}, startNodes, npcNodes, playerNodes);

  // Generate Lines
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

  // Calculate Nodes' position, widht and height

  // Linked Nodes
  let unlinkedNodes = Object.assign({}, allNodes);
  const linkedNodes = linkedNodesRef.nodes;
  let orderedNodes: Node[] = [];
  for (let i = 0; i < linkedNodes.length; i++) {
    let key = linkedNodes[i];
    let node = allNodes[key];

    // Calculate node's position and width
    node.position = { x: i * 200, y: 0 };
    node.positionAbsolute = { x: 0, y: 0 };
    node.width = 200;

    // Calculate node's height
    if (node.type === "startNode") {
      node.height = 290;
    } else {
      let count = 0;
      const condis = node.data.option?.getConditionNames();
      if (condis) {
        count += condis.length;
      }
      const events = node.data.option?.getEventNames();
      if (events) {
        count += events.length;
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

    // Calculate node's position and width
    node.position = { x: i * 200, y: 400 };
    node.positionAbsolute = { x: 0, y: 0 };
    node.width = 200;

    // Calculate node's height
    if (node.type === "startNode") {
      node.height = 148;
    } else {
      let count = 0;
      const condis = node.data.option?.getConditionNames();
      if (condis) {
        count += condis.length;
      }
      const events = node.data.option?.getEventNames();
      if (events) {
        count += events.length;
      }
      node.height = 202 + 20 * count;
    }

    // Remove Free-hanging lines
    let pointers = node.data.option?.getPointerNames();
    for (let i = 0; pointers && i < pointers.length; i++) {
      const targetNodeIsNPC = node.type === "npcNode";
      const toNodeID = (targetNodeIsNPC?"playerNode":"npcNode")+"_"+pointers[i];
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
  allNodes: Record<string, Node<NodeData>>,
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

  const pointers = targetNode.data.option?.getPointerNames() || [];
  let lastNextNodeID = "";

  for (let i = 0; i < pointers.length; i++) {
    const targetNodeIsNPC = targetNode.type === "npcNode";
    const nextNodeID = (targetNodeIsNPC?"playerNode":"npcNode")+"_"+pointers[i];
    const nextNode = allNodes[nextNodeID];
    if (!nextNode) {
      return;
    }
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
