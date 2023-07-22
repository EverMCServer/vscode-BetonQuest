// parseYaml.js
import yaml from 'js-yaml';

export function parseYaml(text) {

    try {
        const data = yaml.load(text);
        readFromYaml(data);
        return data;
    } catch (error) {
        console.error('Error parsing YAML:', error);
        return null;
    }
}

export function stringSplitToArray(text) {
    return text.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

export function readFromYaml(yaml) {
    console.log('-----------')
    let NPC_options = yaml['NPC_options']
    let player_options = yaml['player_options']
    let firstList = stringSplitToArray(yaml['first'])

    let startNode = {}
    startNode['type'] = 'startNode'
    startNode['text'] = 'fileName'
    startNode['text2'] = yaml['quester']
    startNode['first'] = firstList
    let startNodes = { 'start': startNode }

    let npcNodes = {}
    let NPC_optionsKeys = Object.keys(NPC_options);
    for (let i = 0; i < NPC_optionsKeys.length; i++) {
        let key = NPC_optionsKeys[i];
        let option = NPC_options[key]

        let dict = {}
        dict['text'] = option['text']
        dict['type'] = 'npcNode'

        const conditions = option['conditions'] || option['condition'] || ''
        dict['conditions'] = stringSplitToArray(conditions);

        const pointers = option['pointers'] || option['pointer'] || ''
        dict['pointers'] = stringSplitToArray(pointers);

        const evnets = option['evnets'] || option['evnet'] || ''
        dict['evnets'] = stringSplitToArray(evnets);

        npcNodes[key] = dict
    }

    let playerNodes = {}
    let player_optionsKeys = Object.keys(player_options);
    for (let i = 0; i < player_optionsKeys.length; i++) {
        let key = player_optionsKeys[i];
        let option = player_options[key]

        let dict = {}
        dict['text'] = option['text']
        dict['type'] = 'playerNode'

        const conditions = option['conditions'] || option['condition'] || ''
        dict['conditions'] = stringSplitToArray(conditions);

        const pointers = option['pointers'] || option['pointer'] || ''
        dict['pointers'] = stringSplitToArray(pointers);

        const evnets = option['evnets'] || option['evnet'] || ''
        dict['evnets'] = stringSplitToArray(evnets);

        playerNodes[key] = dict
    }

    let allNodesNOCondition = Object.assign({}, startNodes, npcNodes, playerNodes);

    let lines = {}
    let historyNode = []
    let conditionNodes = {}
    let vars = [0,0]// lineID conditionID
    for (let i = 0; i < firstList.length; i++) {
        let firstKey = firstList[i]
        linkIn('start', firstKey, lines, historyNode, vars, conditionNodes, allNodesNOCondition)
    }
    console.log(lines)
}

export function linkIn(fromNodeID, toNodeID, lines, historyNode, vars, conditionNodes, allNodesNOCondition) {
    let node = allNodesNOCondition[toNodeID]

    let fromHandle = 'handleOut'
    let conditions = node['conditions'] || []

    if (conditions.length > 0) {
        let conditionKey = `con_${vars[1]++}`
        let dict = {}
        dict['type'] = 'conditionNode'
        dict['data'] = dict['data'] || {}
        dict['data']['conditions'] = conditions
        conditionNodes[conditionKey] = conditions

        let line = {
            'source': fromNodeID,
            'sourceHandle': fromHandle,
            'target': conditionKey,
            'targetHandle': 'handleIn',
        }
        lines[`line_${vars[0]++}`] = line
        fromNodeID = conditionKey
        fromHandle = 'handleY'
    }
    let line = {
        'source': fromNodeID,
        'sourceHandle': fromHandle,
        'target': toNodeID,
        'targetHandle': 'handleIn',
    }
    lines[`line_${vars[0]++}`] = line

    if (historyNode.includes(toNodeID)) {
        console.log('double link from a node')
        return
    }
    historyNode.push[toNodeID]

    let pointers = node['pointers']
    for (let i = 0; i < pointers.length; i++) {
        let pointer = pointers[i]
        linkIn(toNodeID, pointer, lines, historyNode, vars, conditionNodes, allNodesNOCondition)
    }
}