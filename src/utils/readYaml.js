import yaml from 'js-yaml';
import { MarkerType } from 'reactflow';

export function readYaml(text) {

    try {
        const data = yaml.load(text);
        return readFromYaml(data)
    } catch (error) {
        console.error('Error parsing YAML:', error);
        return null;
    }
}

export function stringSplitToArray(text) {
    return text.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

export function readFromYaml(yaml) {
    let NPC_options = yaml['NPC_options']
    let player_options = yaml['player_options']
    let firstString = yaml['first']
    let firstKeys = stringSplitToArray(firstString)
    for (let i = 0; i < firstKeys.length; i++) {
        firstKeys[i] = `npc_${firstKeys[i]}`
    }

    let startNode = {}
    startNode['type'] = 'startNode'
    startNode['data'] = { 'name': 'start', 'text': 'fileName', 'text2': yaml['quester'] }
    startNode['id'] = 'start'
    let startNodes = { 'start': startNode }

    let npcNodes = {}
    let NPC_optionKeys = Object.keys(NPC_options)
    for (let i = 0; i < NPC_optionKeys.length; i++) {
        let key = NPC_optionKeys[i]
        let option = NPC_options[key]
        let newKey = `npc_${key}`

        let dict = {}
        dict['type'] = 'npcNode'
        dict['id'] = newKey

        let pointersString = option['pointers'] || option['pointer'] || ''
        let pointers = stringSplitToArray(pointersString)
        for (let i = 0; i < pointers.length; i++) {
            pointers[i] = `player_${pointers[i]}`
        }
        dict['pointers'] = pointers

        const conditions = option['conditions'] || option['condition'] || ''
        const events = option['events'] || option['event'] || ''
        dict['data'] = { 'name': key, 'text': option['text'], 'events': stringSplitToArray(events), 'conditions': stringSplitToArray(conditions) }
        npcNodes[newKey] = dict
    }

    let playerNodes = {}
    let player_optionKeys = Object.keys(player_options);
    for (let i = 0; i < player_optionKeys.length; i++) {
        let key = player_optionKeys[i]
        let option = player_options[key]
        let newKey = `player_${key}`

        let dict = {}
        dict['type'] = 'playerNode'
        dict['id'] = newKey

        let pointersString = option['pointers'] || option['pointer'] || ''
        let pointers = stringSplitToArray(pointersString)
        for (let i = 0; i < pointers.length; i++) {
            pointers[i] = `npc_${pointers[i]}`
        }
        dict['pointers'] = pointers

        const conditions = option['conditions'] || option['condition'] || ''
        const events = option['events'] || option['event'] || ''
        dict['data'] = { 'name': key, 'text': option['text'], 'events': stringSplitToArray(events), 'conditions': stringSplitToArray(conditions) }
        playerNodes[newKey] = dict
    }

    let allNodes = Object.assign({}, startNodes, npcNodes, playerNodes)

    let lines = {}
    let historyNodesRef = { nodes: [] }
    let lastToNodeID = ''
    for (let i = 0; i < firstKeys.length; i++) {
        let toNodeID = firstKeys[i]
        if (i == 0) {
            linkIn('start', 'handleOut', toNodeID, allNodes, lines, historyNodesRef)
        } else {
            linkIn(lastToNodeID, 'handleN', toNodeID, allNodes, lines, historyNodesRef)
        }
        lastToNodeID = toNodeID
    }


    let historyNodes = historyNodesRef.nodes
    let orderdNodes = []
    for (let i = 0; i < historyNodes.length; i++) {
        let key = historyNodes[i]
        let node = allNodes[key]
        node.position = { x: i * 200, y: 0 }
        node.positionAbsolute = { x: 0, y: 0 }
        node.width = 0
        node.height = 0

        orderdNodes = [...orderdNodes, node]
        delete allNodes[key];
    }

    let unusedNodeKeys = Object.keys(allNodes)
    for (let i = 0; i < unusedNodeKeys.length; i++) {
        let key = unusedNodeKeys[i]
        let node = allNodes[key]

        node.position = { x: i * 200, y: 0 }
        node.positionAbsolute = { x: 0, y: 0 }
        node.width = 0
        node.height = 0

        orderdNodes = [...orderdNodes, node]
        delete allNodes[key];
    }
    let output = { 'nodes': orderdNodes, 'edges': Object.values(lines) }
    // console.log('------')
    // console.log(orderdNodes)
    // console.log('------')
    return output
}

export function linkIn(fromNodeID, fromHandle, toNodeID, allNodes, lines, historyNodesRef) {
    let toNode = allNodes[toNodeID]

    let lineID = `line_${Object.values(lines).length}`
    let line = {
        'source': fromNodeID,
        'sourceHandle': fromHandle,
        'target': toNodeID,
        'targetHandle': 'handleIn',
        'id': lineID,
        'type': 'step',
        'markerEnd': { type: MarkerType.ArrowClosed }
    }
    lines[lineID] = line

    let historyNodes = historyNodesRef.nodes
    if (historyNodes.includes(toNodeID)) {
        console.log('warning: double link from a node')
        return
    }
    historyNodes = [...historyNodes, toNodeID];
    historyNodesRef.nodes = historyNodes

    let pointers = toNode['pointers']
    let lastToNodeID2 = ''

    for (let i = 0; i < pointers.length; i++) {
        let toNodeID2 = pointers[i]
        let toNode2 = allNodes[toNodeID2]
        let toNodeIsNPC = toNode['type'] == 'npcNode'
        let toNode2IsNPC = toNode2['type'] == 'npcNode'

        if (toNodeIsNPC && toNode2IsNPC) {
            linkIn(lastToNodeID2, 'handleN', toNodeID2, allNodes, lines, historyNodesRef)
        } else {
            linkIn(toNodeID, 'handleOut', toNodeID2, allNodes, lines, historyNodesRef)
        }
        lastToNodeID2 = toNodeID
    }
}