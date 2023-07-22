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
    console.log(yaml)
    let NPC_options = yaml['NPC_options']
    let player_options = yaml['player_options']

    let dict = {}
    dict['type'] = 'startNode'
    dict['text'] = 'fileName'
    dict['text2'] = yaml['quester']
    dict['first'] = stringSplitToArray(yaml['first'])
    let startNodes = { 'start': dict }

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

    console.log(startNodes)
}