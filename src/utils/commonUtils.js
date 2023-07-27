export function connectionAvaliable(
  sourceType,
  sourceHandle,
  targetType,
  targetHandle
) {
  if (
    sourceType == "startNode" &&
    sourceHandle == "handleOut" &&
    targetType == "npcNode" &&
    targetHandle == "handleIn"
  ) {
    return true;
  } else if (
    sourceType == "npcNode" &&
    sourceHandle == "handleOut" &&
    targetType == "playerNode" &&
    targetHandle == "handleIn"
  ) {
    return true;
  } else if (
    sourceType == "playerNode" &&
    sourceHandle == "handleOut" &&
    targetType == "npcNode" &&
    targetHandle == "handleIn"
  ) {
    return true;
  } else if (
    sourceType == "npcNode" &&
    sourceHandle == "handleN" &&
    targetType == "npcNode" &&
    targetHandle == "handleIn"
  ) {
    return true;
  }
  return false;
}

export function logError(str) {
  console.log("Error:", str);
}

export function logWarning(str) {
  console.log("Warning:", str);
}

export function arrayAppend(arr, obj) {
  if (!obj) {
    return arr;
  }
  return [...(arr || []), obj];
}

export function stringSplitToArray(text) {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function downloadImage(dataUrl) {
  const a = document.createElement("a");

  a.setAttribute("download", "reactflow.jpg");
  a.setAttribute("href", dataUrl);
  a.click();
}

export function downloadFile(name, data, type) {
  if (!data) {
    return;
  }
  const blob = new Blob([data], { type: `application/${json}` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function removeLinesOnConnect(node, edges, sourceID, sourceHandle) {
  let newEdges;
  if (node.type == "startNode") {
    newEdges = edges.filter((item, i) => {
      return item["source"] != sourceID;
    });
  }
  if (node.type == "playerNode") {
    newEdges = edges.filter((item, i) => {
      return item["source"] != sourceID;
    });
  }
  if (node.type == "npcNode" && sourceHandle == "handleN") {
    newEdges = edges.filter((item, i) => {
      return item["source"] != sourceID || item["sourceHandle"] != "handleN";
    });
  }
  return newEdges;
}
