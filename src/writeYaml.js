import yaml from 'js-yaml';

export function solveNodes(obj) {
    const nodes = obj['nodes']
    const edges = obj['edges']

    let startNodes = []
    let npcNodes = []
    let playerNodes = []
    let allNodesDict = {}
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        let type = node['type']
        let id = node['id']
        node['pointers'] = []

        allNodesDict[id] = node
        if (type == 'startNode') {
            startNodes = [...startNodes || [], node]
        } else if (type == 'npcNode') {
            npcNodes = [...npcNodes || [], node]
        } else if (type == 'playerNode') {
            playerNodes = [...playerNodes || [], node]
        }
    }
    let linesDict = {}
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i]
        let source = edge['source']
        linesDict[source] = [...linesDict[source] || [], edge]
    }


    if (startNodes.length != 1) {
        console.log('error: start should be only one');
        return;
    }
    let startNode = startNodes[0];
    let startNodeID = startNode['id']
    let historyNodes = []

    let lines = linesDict[startNodeID]
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        let targetNodeID = line['target']
        solveLine(targetNodeID, allNodesDict, historyNodes, startNode, linesDict)
    }

    console.log(startNodes)

    return [startNodes, npcNodes, playerNodes]
}

export function solveLine(targetNodeID, allNodesDict, historyNodes, lastLevelNode, linesDict) {

    let targetNode = allNodesDict[targetNodeID];
    lastLevelNode['pointers'] = [...lastLevelNode['pointers'] || [], targetNode['data']['name']]

    
    let lines = linesDict[targetNodeID]
    if (!lines) {
        return
    }
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]
        let from2Handle = line['sourceHandle']
        let target2NodeID = line['target']
        let levelNode = lastLevelNode

        if (from2Handle == 'handleOut') {
            levelNode = targetNode
        }

        solveLine(target2NodeID, allNodesDict, historyNodes, levelNode, linesDict)
    }
}

export function encodeYaml(obj) {
    let allNodes = solveNodes(obj);
    // window.myGlobalVariable = allNodes;
    if (!allNodes) {
        return;
    }
    let startNodes = allNodes[0];
    let npcNodes = allNodes[1];
    let playerNodes = allNodes[2];


    const startNode = startNodes[0];
    // console.log(startNodes)

    let npcYaml = {}
    for (let i = 0; i < npcNodes.length; i++) {
        let node = npcNodes[i];
        let conditions = node['data']['conditions']
        let pointers = node['pointers']
        let events = node['data']['events']
        let name = node['data']['name']
        let conversation = {}
        conversation['text'] = node['data']['text'];

        if (conditions && conditions.length) {
            conversation['conditions'] = conditions;
        }
        if (pointers && pointers.length) {
            conversation['pointers'] = pointers;
        }
        if (events && events.length) {
            conversation['events'] = events;
        }
        npcYaml[name] = conversation
    }
    console.log(npcNodes)

    let playerYaml = {}
    for (let i = 0; i < playerNodes.length; i++) {
        let node = playerNodes[i];
        let conditions = node['data']['conditions']
        let pointers = node['pointers']
        let events = node['data']['events']
        let name = node['data']['name']
        let conversation = {}
        conversation['text'] = node['data']['text'];

        if (conditions && conditions.length) {
            conversation['conditions'] = conditions;
        }
        if (pointers && pointers.length) {
            conversation['pointers'] = pointers;
        }
        if (events && events.length) {
            conversation['events'] = events;
        }
        playerYaml[name] = conversation
    }

    let fullYaml = {}

    const fileName = startNode['data']['text'];
    const quester = startNode['data']['text2'];
    const first = startNode['pointers'];

    fullYaml['quester'] = quester;
    fullYaml['NPC_options'] = npcYaml;
    fullYaml['player_options'] = playerYaml;
    fullYaml['first'] = first;



    try {
        const replacer = (key, value) => {
            if (Array.isArray(value)) {
                return value.join(', ');
            }
            return value;
        };

        const text = JSON.stringify(fullYaml, replacer);
        const jsonData = JSON.parse(text);
        const yamlText = yaml.dump(jsonData, { quotes: '"' });


        // console.log(yamlText);
        return [fileName, yamlText];
    } catch (error) {
        console.error('Error encoding YAML:', error);
        return null;
    }
}