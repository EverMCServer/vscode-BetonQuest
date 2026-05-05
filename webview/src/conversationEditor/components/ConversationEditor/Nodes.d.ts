import Conversation, { Option } from "betonquest-utils/betonquest/Conversation";
import { DefaultOptionType } from "antd/es/select";

// Type of ReactFlow Node data
export class NodeData {
    conversation?: Conversation; // for NPC_options and player_options
    option?: Option; // for NPC_options and player_options

    syncYaml: (delay?: number) => void; // funciton to sync yaml to VSCode
    translationSelection?: string; // current selection of translation, e.g. 'en'

    conditionItemSource?: DefaultOptionType[];
    eventItemSource?: DefaultOptionType[];
    requestPackageEntries?: () => void;
}