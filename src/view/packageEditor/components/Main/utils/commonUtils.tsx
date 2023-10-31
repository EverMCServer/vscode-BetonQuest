import { Node, Edge } from "reactflow";
import { NodeData } from "../Nodes/Nodes";

export function connectionAvaliable(
  sourceType: string,
  sourceHandle: string,
  targetType: string,
  targetHandle: string
) {
  if (
    sourceType === "startNode" &&
    sourceHandle === "handleOut" &&
    targetType === "npcNode" &&
    targetHandle === "handleIn"
  ) {
    return true;
  } else if (
    sourceType === "npcNode" &&
    sourceHandle === "handleOut" &&
    targetType === "playerNode" &&
    targetHandle === "handleIn"
  ) {
    return true;
  } else if (
    sourceType === "playerNode" &&
    sourceHandle === "handleOut" &&
    targetType === "npcNode" &&
    targetHandle === "handleIn"
  ) {
    return true;
  } else if (
    sourceType === "npcNode" &&
    sourceHandle === "handleN" &&
    targetType === "npcNode" &&
    targetHandle === "handleIn"
  ) {
    return true;
  }
  return false;
}

export function logError(str: string) {
  console.log("Error:", str);
}

export function logWarning(str: string) {
  console.log("Warning:", str);
}

export function arrayAppend<T>(arr: T[] = [], obj: T | null): T[] {
  if (!obj) {
    return arr;
  }
  return [...arr, obj];
}

export function stringSplitToArray(text: string) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function downloadImage(dataUrl: string) {
  const a = document.createElement("a");
  a.setAttribute("download", "BetonQuest.jpg");
  a.setAttribute("href", dataUrl);
  a.click();
}

export function downloadFile(name: string, content: string, type: string) {
  if (!content) {
    return;
  }
  const blob = new Blob([content], { type: `application/${type}` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function removeLinesOnConnect(
  node: Node,
  edges: Edge[],
  sourceID: string,
  sourceHandle: string
) {
  let newEdges = edges;
  if (node.type === "startNode") {
    newEdges = edges.filter((item) => {
      return item["source"] !== sourceID;
    });
  }
  if (node.type === "playerNode") {
    newEdges = edges.filter((item) => {
      return item["source"] !== sourceID;
    });
  }
  if (node.type === "npcNode" && sourceHandle === "handleN") {
    newEdges = edges.filter((item) => {
      return item["source"] !== sourceID || item["sourceHandle"] !== "handleN";
    });
  }
  return newEdges || [];
}

export function getConflictEdges(
  sourceNode: Node, // source node
  edges: Edge[], // all edges
  sourceHandle: string
): Edge[] {
  let conflictEdges: Edge[] = [];
  switch (sourceNode.type) {
    case "startNode":
      conflictEdges = edges.filter((item) =>  item.source === sourceNode.id);
      break;
    case "playerNode":
      conflictEdges = edges.filter((item) => item.source === sourceNode.id);
      break;
    case "npcNode":
      if (sourceHandle === "handleN") {
        conflictEdges = edges.filter((item) => item.source === sourceNode.id && item.sourceHandle === "handleN");
      }
      break;
  }
  return conflictEdges;
}

export function addPointersToUpstream(
  sourceNode: Node<NodeData>,
  targetNode: Node<NodeData>,
  pointersToAdd: string[],
  allEdges: Edge[]
) {
  // 1. Set pointers on upstream options / "first"
  // 2. Lookup upstream nodes, if upperstream is npc->npc
  switch (sourceNode.type) {
    case "startNode":
      sourceNode.data.conversation?.insertFirst(pointersToAdd);
      break;
    case "playerNode":
      sourceNode.data.option?.insertPointerNames(pointersToAdd);
      break;
    case "npcNode":
      switch (targetNode.type) {
        case "playerNode":
          sourceNode.data.option?.insertPointerNames(pointersToAdd);
          break;
        case "npcNode":
          // npc->npc
          // Search all source options / first, and set the pointers on them
          // Steps:
          // 1. Search the first NPC node
          // 2. Search all nodes point to this NPC node
          // 3. Set new pointers on the node

          // Iterate and find the first NPC node
          let currentNode: Node<NodeData> = sourceNode;
          do {
            const e = allEdges.find(edge => edge.sourceHandle === "handleN" && edge.target === currentNode.id);
            if (e) {
              currentNode = e.sourceNode!;
            } else {
              // no more nodes found
              break;
            }
          } while (currentNode.id !== sourceNode.id); // prevent looped lookup

          // Search all nodes point to this NPC node
          const upstreamNodes: Node<NodeData>[] = allEdges.filter(edge => edge.target === currentNode.id).map(edge => {
            return edge.sourceNode!;
          });

          // Set new pointers on the node
          upstreamNodes.forEach(node => {
            switch (node.type) {
              case "playerNode":
                node.data.option?.insertPointerNames(pointersToAdd);
                break;
              case "startNode":
                node.data.conversation?.insertFirst(pointersToAdd);
                break;
            }
          });
      }
  }
}

export const initialNode: Node = {
  id: "startNodeID",
  type: "startNode",
  position: { x: 0, y: 0 },
  data: { name: "startNode" },
};
