// parseYaml.js
import yaml from 'js-yaml';
import NPCNode from './nodes/NPCNode';

export function parseYaml(text) {
    try {
        const data = yaml.load(text);
        return data;
    } catch (error) {
        console.error('Error parsing YAML:', error);
        return null;
    }
}

export function solveLine(line, allNodes, conditions, inFirst, startNode, lastConversation) {
    let targetID = line['target']
    let targetHandle = line['targetHandle']
    // console.log('solveLine', line);

    let targetNode = allNodes[targetID]
    if (targetNode['type'] == 'conditionNode') {
        let conditionsY = [...conditions, targetNode['text']]
        let conditionsN = [...conditions, `!${targetNode['text']}`]

        let nextLinesY = targetNode['handleY'] || []
        let nextLinesN = targetNode['handleN'] || []

        for (let i = 0; i < nextLinesY.length; i++) {
            let nextLine = nextLinesY[i];
            solveLine(nextLine, allNodes, conditionsY, inFirst, startNode, lastConversation)
        }
        for (let i = 0; i < nextLinesN.length; i++) {
            let nextLine = nextLinesN[i];
            solveLine(nextLine, allNodes, conditionsN, inFirst, startNode, lastConversation)
        }
    } else if (targetNode['type'] == 'npcNode') {
        targetNode['conditions'] = conditions;

        if (inFirst) {
            startNode['first'] = [...startNode['first'] || [], targetID]
        }
        if (lastConversation) {
            lastConversation['pointers'] = [...lastConversation['pointers'] || [], targetID]
        }

        let nextLines = targetNode['handleOut'] || []
        for (let i = 0; i < nextLines.length; i++) {
            let nextLine = nextLines[i];
            solveLine(nextLine, allNodes, [], false, startNode, targetNode)
        }
    } else {
        targetNode['conditions'] = conditions;

        if (inFirst) {
            console.log('start can not connect player');
            return;
        }
        if (lastConversation) {
            lastConversation['pointers'] = [...lastConversation['pointers'] || [], targetID]
        }

        let nextLines = targetNode['handleOut'] || []
        for (let i = 0; i < nextLines.length; i++) {
            let nextLine = nextLines[i];
            solveLine(nextLine, allNodes, [], false, startNode, targetNode)
        }
    }

}

export function solveNodes(obj) {
    const nodes = obj['nodes'];
    const edges = obj['edges'];

    let startNodes = {}
    let npcNodes = {}
    let playerNodes = {}
    let conditionNodes = {}
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const type = node['type'];

        let dict = { 'type': type }
        if (type == 'startNode') {
            let id = node['id'];
            dict['text'] = node['data']['text']
            dict['text2'] = node['data']['text2']
            startNodes[id] = dict
        } else if (type == 'npcNode') {
            let id = node['id'];
            dict['text'] = node['data']['text']
            dict['events'] = node['data']['events']
            npcNodes[id] = dict
        } else if (type == 'playerNode') {
            let id = node['id'];
            dict['text'] = node['data']['text']
            dict['events'] = node['data']['events']
            playerNodes[id] = dict
        } else if (type == 'conditionNode') {
            let id = node['id'];
            dict['text'] = node['data']['text']
            conditionNodes[id] = dict
        }
    }
    let allNodes = Object.assign({}, startNodes, npcNodes, playerNodes, conditionNodes);
    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const source = edge['source'];
        const sourceHandle = edge['sourceHandle'];
        const target = edge['target'];
        const targetHandle = edge['targetHandle'];

        let node = allNodes[source]
        node[sourceHandle] = [...node[sourceHandle] || [], { 'target': target, 'targetHandle': targetHandle }]
    }

    let startNodesKeys = Object.keys(startNodes);
    if (startNodesKeys.length > 1) {
        console.log('start should be only one');
        return;
    }

    let startNode = startNodes[startNodesKeys[0]];
    let nextLines = startNode['handleOut'] || []
    for (let i = 0; i < nextLines.length; i++) {
        let nextLine = nextLines[i];
        solveLine(nextLine, allNodes, [], true, startNode, null)
    }

    // const json = JSON.stringify(allNodes);
    // console.log(json)
    return [startNodes, npcNodes, playerNodes]
}

export function encodeYaml(obj) {
    let allNodes = solveNodes(obj);
    let startNodes = allNodes[0];
    let npcNodes = allNodes[1];
    let playerNodes = allNodes[2];

    
    let startNodesKeys = Object.keys(startNodes);
    const startNodesKey = startNodesKeys[0];
    const startNode = startNodes[startNodesKey];
    // console.log(startNodes)

    let npcYaml = {}
    let npcNodesKeys = Object.keys(npcNodes);
    for (let i = 0; i < npcNodesKeys.length; i++) {
        const npcNodesKey = npcNodesKeys[i];
        const node = npcNodes[npcNodesKey];
        const conditions = node['conditions']
        const pointers = node['pointers']
        const events = node['events']
        let conversation = {}
        conversation['text'] = node['text'];

        if (conditions && conditions.length) {
            conversation['conditions'] = conditions;
        }
        if (pointers && pointers.length) {
            conversation['pointers'] = pointers;
        }
        if (events && events.length) {
            conversation['events'] = events;
        }
        npcYaml[npcNodesKey] = conversation
    }

    let playerYaml = {}
    let playerNodesKeys = Object.keys(playerNodes);
    for (let i = 0; i < playerNodesKeys.length; i++) {
        const playerNodesKey = playerNodesKeys[i];
        const node = playerNodes[playerNodesKey];
        const conditions = node['conditions']
        const pointers = node['pointers']
        const events = node['events']
        let conversation = {}
        conversation['text'] = node['text'];

        if (conditions && conditions.length) {
            conversation['conditions'] = conditions;
        }
        if (pointers && pointers.length) {
            conversation['pointers'] = pointers;
        }
        if (events && events.length) {
            conversation['events'] = events;
        }
        playerYaml[playerNodesKey] = conversation
    }

    let fullYaml = {}

    const fileName = startNode['text'];
    const quester = startNode['text2'];
    const first = startNode['first'];

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

    return null;



    // let npcYaml = {}
    // for (let i = 0; i < npcNodes.length; i++) {
    //     const node = npcNodes[i];
    //     const data = node['data'];
    //     const text = data['text'];

    //     let conv = {}
    //     conv['text'] = `${text}`

    //     let greeting = `npc_${i + 1}`;
    //     npcYaml[greeting] = conv
    // }

    // let playerYaml = {}
    // for (let i = 0; i < playerNodes.length; i++) {
    //     const node = playerNodes[i];
    //     const data = node['data'];
    //     const text = data['text'];

    //     let conv = {}
    //     conv['text'] = `${text}`

    //     let greeting = `player_${i + 1}`;
    //     playerYaml[greeting] = conv
    // }

    // let fullYaml = {}

    // const startData = startNode['data'];
    // const fileName = startData['text'];
    // const quester = startData['text2'];

    // fullYaml['quester'] = quester;
    // fullYaml['NPC_options'] = npcYaml;
    // fullYaml['player_options'] = playerYaml;




    // try {
    //     const text = yaml.dump(fullYaml);
    //     console.log(text);
    //     return [fileName, text];
    // } catch (error) {
    //     console.error('Error encoding YAML:', error);
    //     return null;
    // }
}