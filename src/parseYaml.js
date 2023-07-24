// parseYaml.js
import yaml from 'js-yaml';
import React, { createContext, useContext } from 'react';

export function customLayout(nodes, edges) {
    let startNode = null
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        if (node.type == 'startNode') {
            if (!startNode) {
                startNode = node
            } else {
                console.log('error: startNode need only one')
                return
            }
        }
    }
    if (!startNode) {
        console.log('error: startNode not found')
        return
    }

    let lineDict = {}
    for (let i = 0; i < edges.length; i++) {
        let edge = edges[i]
        let source = edge['source']
        lineDict[source] = [...lineDict[source] || [], edge]
    }

    let maxX = 0
    let y = 0

    let startNodeID = startNode['id']


    let locationDict = {}
    locationDict[startNodeID] = { 'x': maxX, 'y': y }
    let vars = { 'maxX': maxX }

    customLayoutSub(startNodeID, lineDict, vars, y, locationDict)

    let space = 30
    let widthMaxDict = {}
    let heightMaxDict = {}
    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        let layoutPosition = locationDict[node['id']]

        widthMaxDict[layoutPosition.x] = Math.max(widthMaxDict[layoutPosition.x] || 0, node.width + space)
        heightMaxDict[layoutPosition.y] = Math.max(heightMaxDict[layoutPosition.y] || 0, node.height + space)
        node.position = { 'x': layoutPosition.x * 200, 'y': layoutPosition.y * 400 }
    }

    let xArray = [0]
    let widthSum = 0
    for (let i = 0; i < Object.keys(widthMaxDict).length; i++) {
        let w = widthMaxDict[i]
        widthSum += w
        xArray = [...xArray, widthSum]
    }
    let yArray = [0]
    let heightSum = 0
    for (let i = 0; i < Object.keys(heightMaxDict).length; i++) {
        let h = heightMaxDict[i]
        heightSum += h
        yArray = [...yArray, heightSum]
    }
    // console.log('------------------')
    // console.log(widthMaxDict)
    // console.log(heightMaxDict)
    // console.log(xArray)
    // console.log(yArray)
    // console.log('------------------')

    for (let i = 0; i < nodes.length; i++) {
        let node = nodes[i]
        let layoutPosition = locationDict[node['id']]

        node.position = { 'x': xArray[layoutPosition.x], 'y': yArray[layoutPosition.y] }
        // node.positionAbsolute = {'x': layoutPosition.x*200, 'y': layoutPosition.y*2000}
        // node.x = layoutPosition.x*200
        // node.y = layoutPosition.y*2000
    }


    return [nodes, edges]

}

export function customLayoutSub(fromNodeID, lineDict, vars, y, locationDict) {
    let fromNodeLines = lineDict[fromNodeID]
    if (!fromNodeLines) {
        return
    }
    for (let i = 0; i < fromNodeLines.length; i++) {
        let line = fromNodeLines[i]
        let lineSourceHandle = line['sourceHandle']
        if (lineSourceHandle == 'handleOut') {
            let lineTarget = line['target']

            let maxX = vars['maxX']
            if (i != 0) {
                maxX += 1
            }

            vars['maxX'] = maxX
            locationDict[lineTarget] = { 'x': maxX, 'y': y + 1 }
            customLayoutSub(lineTarget, lineDict, vars, y + 1, locationDict)
        }
    }
    for (let i = 0; i < fromNodeLines.length; i++) {
        let line = fromNodeLines[i]
        let lineSourceHandle = line['sourceHandle']
        if (lineSourceHandle == 'handleN') {
            let lineTarget = line['target']

            let maxX = vars['maxX']
            maxX += 1
            vars['maxX'] = maxX

            locationDict[lineTarget] = { 'x': maxX, 'y': y }
            customLayoutSub(lineTarget, lineDict, vars, y, locationDict)
        }
    }
}

export function parseYaml(text) {

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
        'type': 'buttonedge',
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