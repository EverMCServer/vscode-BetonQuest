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

    let allNodes = Object.assign({}, startNodes, npcNodes, playerNodes);

    let conditionsPriority = {}
    for (let i = 0; i < firstList.length; i++) {
        let firstKey = firstList[i]
        let firstNode = allNodes[firstKey]
        let firstConditions = firstNode['conditions']
        for (let j = 0; j < firstConditions.length; j++) {
            let cond = firstConditions[j]
            if (cond.startsWith('!')) {
                cond = cond.slice(1);
            }
            conditionsPriority[cond] = (conditionsPriority[cond] || 0) + Math.pow(2, firstList.length - i - 1);
        }
    }
    const sortConditionNames = Object.entries(conditionsPriority)
        .sort((a, b) => b[1] - a[1])
        .map(item => item[0]);

    /* ports
    [
    {
        cond: [con1,con2,con3]
        portHandle: handleName
        fromNode: nodeName
    }
    {
        
    }
        ]
    */
    let ports = []
    let conditionNodes = {}
    if (sortConditionNames.length > 0) {
        let firstConditionName = sortConditionNames[0]
        let dict = {}
        dict['text'] = firstConditionName
        dict['type'] = 'conditionNode'
        let nodeName = `cond_${Object.keys(conditionNodes).length + 1}`
        conditionNodes[nodeName] = dict

        let portY = {}
        portY['cond'] = [`${firstConditionName}`]
        portY['portHandle'] = 'handleY'
        portY['fromNode'] = startNode
        let portN = {}
        portN['cond'] = [`!${firstConditionName}`]
        portN['portHandle'] = 'handleN'
        portN['fromNode'] = startNode
        ports = [...ports || [], portY, portN]
    }




    for (let i = 0; i < firstList.length; i++) {
        let nodeKey = firstList[i]
        let node = allNodes[nodeKey]
        let conditions = node['conditions']

        let conditionSort = []
        for (let j = 0; j < sortConditionNames.length; j++) {
            let sortConditionName = sortConditionNames[j]
            if (conditions.includes(sortConditionName)) {
                conditionSort.push(sortConditionName)
            }
            let sortConditionNameN = `!${sortConditionName}`
            if (conditions.includes(sortConditionNameN)) {
                conditionSort.push(sortConditionNameN)
            }
        }

        for (let j = 0; j < conditionSort.length; j++) {
            let condition = conditionSort[j]


        }
        console.log(conditionSort)
    }


}