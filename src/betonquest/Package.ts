import YAML, { Document, YAMLMap, Scalar } from 'yaml';

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

}
