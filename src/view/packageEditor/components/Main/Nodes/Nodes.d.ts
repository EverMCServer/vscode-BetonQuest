import Conversation, { Option } from "../../../../../betonquest/Conversation";

// Type of ReactFlow Node data
export type NodeData = {
    conversation?: Conversation; // for NPC_options and player_options
    option?: Option; // for NPC_options and player_options

    syncYaml: Function; // funciton to sync yaml to VSCode
    translationSelection?: string, // current selection of translation, e.g. 'en'
}