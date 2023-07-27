import yaml from "js-yaml";
import { arrayAppend, logError } from "./commonUtils";

export function writeYaml(obj) {
  // Solve
  const allNodes = solveNodes(obj);
  if (!allNodes) {
    logError("Cannot solve nodes.");
    return;
  }

  // Get data
  const startNodes = allNodes.startNodes;
  const npcNodes = allNodes.npcNodes;
  const playerNodes = allNodes.playerNodes;
  const startNode = startNodes[0];

  // NPC Yaml
  const npcYaml = {};
  for (let i = 0; i < npcNodes.length; i++) {
    const node = npcNodes[i];
    const pointers = node["pointers"];
    const conditions = node["data"]["conditions"];
    const events = node["data"]["events"];
    const name = node["data"]["name"];
    const text = node["data"]["text"];

    const conversation = {};
    if (text && text.length) {
      conversation["text"] = text;
    }
    if (conditions && conditions.length) {
      conversation["conditions"] = conditions;
    }
    if (pointers && pointers.length) {
      conversation["pointers"] = pointers;
    }
    if (events && events.length) {
      conversation["events"] = events;
    }
    npcYaml[name] = conversation;
  }

  // Player Yaml
  const playerYaml = {};
  for (let i = 0; i < playerNodes.length; i++) {
    const node = playerNodes[i];
    const pointers = node["pointers"];
    const conditions = node["data"]["conditions"];
    const events = node["data"]["events"];
    const name = node["data"]["name"];
    const text = node["data"]["text"];

    const conversation = {};
    if (text && text.length) {
      conversation["text"] = text;
    }
    if (conditions && conditions.length) {
      conversation["conditions"] = conditions;
    }
    if (pointers && pointers.length) {
      conversation["pointers"] = pointers;
    }
    if (events && events.length) {
      conversation["events"] = events;
    }
    playerYaml[name] = conversation;
  }

  // Full Yaml

  const fileName = startNode["data"]["text"] || "conversation";
  const quester = startNode["data"]["text2"] || "npcName";
  const first = startNode["pointers"];
  const fullYaml = {
    quester: quester,
    NPC_options: npcYaml,
    player_options: playerYaml,
    first: first,
  };

  // Encode
  try {
    const replacer = (key, value) => {
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return value;
    };

    const text = JSON.stringify(fullYaml, replacer);
    const jsonData = JSON.parse(text);
    const yamlText = yaml.dump(jsonData, { quotes: '"' });

    return [fileName, yamlText];
  } catch (error) {
    logError(`Encoding Yaml ${error}`);
    return null;
  }
}

export function solveNodes(obj) {
  const nodes = obj["nodes"];
  const edges = obj["edges"];

  // Nodes to array
  let startNodes = [];
  let npcNodes = [];
  let playerNodes = [];
  const allNodesDict = {};
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const type = node["type"];
    const id = node["id"];
    node["pointers"] = [];

    allNodesDict[id] = node;
    if (type == "startNode") {
      startNodes = arrayAppend(startNodes, node);
    } else if (type == "npcNode") {
      npcNodes = arrayAppend(npcNodes, node);
    } else if (type == "playerNode") {
      playerNodes = arrayAppend(playerNodes, node);
    }
  }

  // Lines to dict
  const linesDict = {};
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const source = edge["source"];
    linesDict[source] = arrayAppend(linesDict[source], edge);
  }

  // Check results
  if (startNodes.length != 1) {
    logError("Cannot solve nodes.");
    return;
  }

  // Make lines
  const startNode = startNodes[0];
  const startNodeID = startNode["id"];
  const lines = linesDict[startNodeID];
  if (!lines) {
    return;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const targetNodeID = line["target"];
    solveLine(targetNodeID, startNode, allNodesDict, linesDict);
  }

  return {
    startNodes: startNodes,
    npcNodes: npcNodes,
    playerNodes: playerNodes,
  };
}

export function solveLine(
  targetNodeID,
  lastLevelNode,
  allNodesDict,
  linesDict
) {
  const targetNode = allNodesDict[targetNodeID];
  lastLevelNode["pointers"] = arrayAppend(
    lastLevelNode["pointers"],
    targetNode["data"]["name"]
  );

  const lines = linesDict[targetNodeID];
  if (!lines) {
    return;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const targetHandle = line["sourceHandle"];
    const nextNodeID = line["target"];
    let levelNode = lastLevelNode;

    if (targetHandle == "handleOut") {
      levelNode = targetNode;
    }

    solveLine(nextNodeID, levelNode, allNodesDict, linesDict);
  }
}
