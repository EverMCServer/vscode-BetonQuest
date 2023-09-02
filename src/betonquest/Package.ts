import YAML, { Document, YAMLMap, Scalar } from 'yaml';
import Conversation from './Conversation';

export default class Package {

    private yaml: Document<YAMLMap<string>, false>;

    constructor(yamlText: string) {
        this.yaml = YAML.parseDocument<YAMLMap<string>, false>(yamlText);
    }

    reloadYaml() {
        this.yaml = YAML.parseDocument<YAMLMap<string>, false>(this.yaml.toString());
    }

    getYaml() {
        return this.yaml;
    }

    getEventsYaml() {
        return this.yaml.get("events") as YAMLMap<string, string> | undefined;
    }

    getConditionsYaml() {
        return this.yaml.get("conditions") as YAMLMap<string, string> | undefined;
    }

    getObjectivesYaml() {
        return this.yaml.get("objectives") as YAMLMap<string, string> | undefined;
    }

    getItemsYaml() {
        return this.yaml.get("items") as YAMLMap<string, string> | undefined;
    }

    getConversationsYaml() {
        return this.yaml.get("conversations") as YAMLMap<
            // Name of conversation
            string,
            // Content of the actuarial conversation script
            YAMLMap<
                string,
                string| // quester-monolingual, first, stop,
                YAMLMap<
                    string,
                    string| // quester-multilingual
                    YAMLMap<
                        string,
                        string| // text-monolingual, conditions, events, pointers
                        YAMLMap<
                            string,
                            string // text-multilingual
                        >
                    >
                >
            >
        > | undefined;
    }

    // Get all conversations
    getConversations(): Map<string, Conversation> {
        const map = new Map<string, Conversation>();
        const yaml = this.yaml.getIn(["conversations"]);
        if (yaml instanceof YAMLMap) {
            yaml.items.forEach((pair, i) => {
                if (pair.value instanceof YAMLMap) {
                    map.set(pair.key.toString(), new Conversation(pair.value));
                }
            });
        }
        return map;
    }

    // Get the Conversation Model by script name.
    getConversation(scriptName: string): Conversation | undefined {
        const yaml = this.yaml.getIn(["conversations", scriptName]);
        if (yaml instanceof YAMLMap) {
            return new Conversation(yaml);
        }
        return undefined;
    }

}
