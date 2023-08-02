import yaml from "js-yaml";
import { Node, Edge } from "reactflow";
import { arrayAppend, logError } from "./commonUtils";
import ConversationYamlModel, {
  ConversationYamlOptionModel,
} from "./conversationYamlModel";

export interface YamlWriterOutput {
  fileName: string;
  content: string;
}

export function writeYaml(
  nodes: Node[],
  edges: Edge[]
): YamlWriterOutput | null {
  // Solve
  const allNodes = solveNodes(nodes, edges);
  if (!allNodes) {
    logError("Cannot solve nodes.");
    return null;
  }

  // Get data
  const startNodes = allNodes.startNodes;
  const npcNodes = allNodes.npcNodes;
  const playerNodes = allNodes.playerNodes;
  const startNode = startNodes[0];

  // NPC Yaml
  const npcYaml: Record<string, ConversationYamlOptionModel> = {};
  for (let i = 0; i < npcNodes.length; i++) {
    const node = npcNodes[i];
    const pointers = node.data["pointers"];
    const conditions = node.data["conditions"];
    const events = node.data["events"];
    const name = node.data["name"];
    const text = node.data["text"];

    const conversation: ConversationYamlOptionModel = {
      text: text || "",
    };

    if (conditions && conditions.length) {
      conversation.conditions = conditions;
    }
    if (pointers && pointers.length) {
      conversation.pointers = pointers;
    }
    if (events && events.length) {
      conversation.events = events;
    }
    npcYaml[name] = conversation;
  }

  // Player Yaml
  const playerYaml: Record<string, ConversationYamlOptionModel> = {};
  for (let i = 0; i < playerNodes.length; i++) {
    const node = playerNodes[i];
    const pointers = node.data["pointers"];
    const conditions = node.data["conditions"];
    const events = node.data["events"];
    const name = node.data["name"];
    const text = node.data["text"];

    const conversation: ConversationYamlOptionModel = {
      text: text || "",
    };

    if (conditions && conditions.length) {
      conversation.conditions = conditions;
    }
    if (pointers && pointers.length) {
      conversation.pointers = pointers;
    }
    if (events && events.length) {
      conversation.events = events;
    }
    playerYaml[name] = conversation;
  }

  // Full Yaml
  const fileName = startNode.data["text"] || "conversation";
  const quester = startNode.data["text2"] || "npcName";
  const first = startNode.data["pointers"];

  const fullYaml: ConversationYamlModel = {
    quester: quester,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    NPC_options: npcYaml,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    player_options: playerYaml,
    first: first,
  };

  // Encode
  try {
    const replacer = (_: string, value: string[]) => {
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return value;
    };

    const text = JSON.stringify(fullYaml, replacer);
    const jsonData = JSON.parse(text);
    const yamlText = yaml.dump(jsonData);

    return { fileName: fileName, content: yamlText };
  } catch (error) {
    logError(`Encoding Yaml ${error}`);
    return null;
  }
}

export function solveNodes(nodes: Node[], edges: Edge[]) {
  // Nodes to array
  let startNodes: Node[] = [];
  let npcNodes: Node[] = [];
  let playerNodes: Node[] = [];
  const allNodesDict: Record<string, Node> = {};
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const type = node.type;
    const id = node.id;
    node.data["pointers"] = [];

    allNodesDict[id] = node;
    if (type === "startNode") {
      startNodes = arrayAppend(startNodes, node);
    } else if (type === "npcNode") {
      npcNodes = arrayAppend(npcNodes, node);
    } else if (type === "playerNode") {
      playerNodes = arrayAppend(playerNodes, node);
    }
  }

  // Lines to dict
  const linesDict: Record<string, Edge[]> = {};
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    const source = edge.source;
    linesDict[source] = arrayAppend(linesDict[source], edge);
  }

  // Check results
  if (startNodes.length !== 1) {
    logError("Cannot solve nodes.");
    return undefined;
  }

  // Solve main lines
  const unusedNodesDict = Object.assign({}, allNodesDict);
  const startNode = startNodes[0];
  const startNodeID = startNode.id;

  delete unusedNodesDict[startNodeID];
  const lines = linesDict[startNodeID];
  if (!lines) {
    return undefined;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const targetNodeID = line["target"];
    solveLine(
      targetNodeID,
      startNode,
      allNodesDict,
      unusedNodesDict,
      linesDict
    );
  }

  // Not in main Nodes
  const unusedNodesKeys = Object.keys(unusedNodesDict || {});
  for (let j = 0; j < unusedNodesKeys.length; j++) {
    let beginNodeID = unusedNodesKeys[j];
    const beginNode = allNodesDict[beginNodeID];

    delete unusedNodesDict[beginNodeID];
    const lines = linesDict[beginNodeID];
    if (!lines) {
      continue;
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const targetNodeID = line["target"];
      const sourceHandle = line["sourceHandle"];
      if (sourceHandle !== "handleOut") {
        continue;
      }

      solveLine(
        targetNodeID,
        beginNode,
        allNodesDict,
        unusedNodesDict,
        linesDict
      );
    }
  }
  console.log(linesDict);

  return {
    startNodes: startNodes,
    npcNodes: npcNodes,
    playerNodes: playerNodes,
  };
}

export function solveLine(
  targetNodeID: string,
  lastLevelNode: Node,
  allNodesDict: Record<string, Node>,
  unusedNodesDict: Record<string, Node>,
  linesDict: Record<string, Edge[]>
) {
  const targetNode = allNodesDict[targetNodeID];
  lastLevelNode.data["pointers"] = arrayAppend(
    lastLevelNode.data["pointers"],
    targetNode.data["name"]
  );

  if (!unusedNodesDict[targetNodeID]) {
    return;
  }
  delete unusedNodesDict[targetNodeID];
  const lines = linesDict[targetNodeID];
  if (!lines) {
    return;
  }
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const targetHandle = line["sourceHandle"];
    const nextNodeID = line["target"];
    let levelNode = lastLevelNode;

    if (targetHandle === "handleOut") {
      levelNode = targetNode;
    }

    solveLine(nextNodeID, levelNode, allNodesDict, unusedNodesDict, linesDict);
  }
}
