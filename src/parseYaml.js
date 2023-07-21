// parseYaml.js
import yaml from 'js-yaml';

export function parseYaml(text) {
    try {
        const data = yaml.load(text);
        return data;
    } catch (error) {
        console.error('Error parsing YAML:', error);
        return null;
    }
}

// export function 

export function encodeYaml(obj) {
    const nodes = obj['nodes'];

    let startNode = null;
    let npcNodes = []
    let playerNodes = []
    let conditionNodes = []
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const type = node['type'];
        if (type == 'startNode') {
            startNode = node;
        } else if (type == 'npcNode') {
            npcNodes.push(node);
        } else if (type == 'playerNode') {
            playerNodes.push(node);
        } else if (type == 'conditionNode'){
            conditionNodes.push(node);
        }
    }

    let npcYaml = {}
    for (let i = 0; i < npcNodes.length; i++) {
        const node = npcNodes[i];
        const data = node['data'];
        const text = data['text'];

        let conv = {}
        conv['text'] = `${text}`

        let greeting = `npc_${i + 1}`;
        npcYaml[greeting] = conv
    }

    let playerYaml = {}
    for (let i = 0; i < playerNodes.length; i++) {
        const node = playerNodes[i];
        const data = node['data'];
        const text = data['text'];

        let conv = {}
        conv['text'] = `${text}`

        let greeting = `player_${i + 1}`;
        playerYaml[greeting] = conv
    }

    let fullYaml = {}

    const startData = startNode['data'];
    const fileName = startData['text'];
    const quester = startData['text2'];

    fullYaml['quester'] = quester;
    fullYaml['NPC_options'] = npcYaml;
    fullYaml['player_options'] = playerYaml;




    try {
        const text = yaml.dump(fullYaml);
        console.log(text);
        return [fileName, text];
    } catch (error) {
        console.error('Error encoding YAML:', error);
        return null;
    }
}