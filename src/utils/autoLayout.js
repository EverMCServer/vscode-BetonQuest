import { arrayAppend, logError } from "./commonUtils";

export function autoLayout(nodes, edges) {
  // StartNode
  let startNode = null;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node.type == "startNode") {
      if (!startNode) {
        startNode = node;
      } else {
        logError("StartNode need to be only one.");
        return;
      }
    }
  }
  if (!startNode) {
    logError("StartNode not found.");
    return;
  }

  // LineDict
  const lineDict = {};
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const source = edge["source"];
    lineDict[source] = arrayAppend(lineDict[source], edge);
  }

  // Make location dict
  const startNodeID = startNode["id"];
  const locationDict = {};
  locationDict[startNodeID] = { x: 0, y: 0 };
  const vars = { maxX: 0 };
  makeLocationDict(startNodeID, vars, 0, lineDict, locationDict);

  // FreeNodes
  let maxX = 1;
  let freeNodes = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const nodeID = node["id"];
    const exist = locationDict[nodeID];
    if (!exist) {
      locationDict[nodeID] = { x: maxX, y: 0 };
      freeNodes = arrayAppend(freeNodes, node);
      maxX++;
    }
  }

  // Caculate width max and height max
  const space = 50;
  const widthMaxDict = {};
  const heightMaxDict = {};
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const layoutPosition = locationDict[node["id"]];

    widthMaxDict[layoutPosition.x] = Math.max(
      widthMaxDict[layoutPosition.x] || 0,
      node.width + space
    );
    heightMaxDict[layoutPosition.y] = Math.max(
      heightMaxDict[layoutPosition.y] || 0,
      node.height + space
    );
  }

  // Caculate positions
  let xArray = [0];
  let widthSum = 0;
  for (let i = 0; i < Object.keys(widthMaxDict).length; i++) {
    let w = widthMaxDict[i] || 0;
    widthSum += w;
    xArray = arrayAppend(xArray, widthSum);
  }
  let yArray = [0];
  let heightSum = 0;
  for (let i = 0; i < Object.keys(heightMaxDict).length; i++) {
    let h = heightMaxDict[i] || 0;
    heightSum += h;
    yArray = arrayAppend(yArray, heightSum);
  }

  // Set position
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const layoutPosition = locationDict[node["id"]];
    node.position = {
      x: xArray[layoutPosition.x],
      y: yArray[layoutPosition.y],
    };
  }

  return { nodes: nodes, edges: edges };
}

export function makeLocationDict(
  sourceNodeID,
  vars,
  y,
  lineDict,
  locationDict
) {
  const sourceNodeLines = lineDict[sourceNodeID];
  if (!sourceNodeLines) {
    return;
  }

  // handleOut
  for (let i = 0; i < sourceNodeLines.length; i++) {
    const line = sourceNodeLines[i];
    const sourceLineHandle = line["sourceHandle"];
    if (sourceLineHandle == "handleOut") {
      const targetNodeID = line["target"];
      if (locationDict[targetNodeID]) {
        continue;
      }

      let maxX = vars["maxX"];
      if (i != 0) {
        maxX += 1;
      }
      vars["maxX"] = maxX;

      locationDict[targetNodeID] = { x: maxX, y: y + 1 };
      makeLocationDict(targetNodeID, vars, y + 1, lineDict, locationDict);
    }
  }

  // handleN
  for (let i = 0; i < sourceNodeLines.length; i++) {
    const line = sourceNodeLines[i];
    const sourceLineHandle = line["sourceHandle"];
    if (sourceLineHandle == "handleN") {
      const targetNodeID = line["target"];
      if (locationDict[targetNodeID]) {
        continue;
      }

      let maxX = vars["maxX"];
      maxX += 1;
      vars["maxX"] = maxX;

      locationDict[targetNodeID] = { x: maxX, y: y };
      makeLocationDict(targetNodeID, vars, y, lineDict, locationDict);
    }
  }
}
