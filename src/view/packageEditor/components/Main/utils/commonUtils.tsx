import { Node, Edge } from "reactflow";

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

export const initialNode: Node = {
  id: "startNodeID",
  type: "startNode",
  position: { x: 0, y: 0 },
  data: { name: "startNode" },
};
