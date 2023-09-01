import YAML, { Document, YAMLMap } from 'yaml';

export default class {

    private yaml?: Document;

    private eventsYaml?;
    private conditionsYaml?;
    private objectivesYaml?;
    private itemsYaml?;
    private conversationsYaml?;

    constructor(yamlText: string) {
        console.log(yamlText);
        this.yaml = YAML.parseDocument(yamlText);

        // Determine if "Events", "Conditions", "Objectives", "Items" exists
        this.eventsYaml = this.yaml.get("events") as YAMLMap<string, string>;
        this.conditionsYaml = this.yaml.get("conditions") as YAMLMap<string, string>;
        this.objectivesYaml = this.yaml.get("objectives") as YAMLMap<string, string>;
        this.itemsYaml = this.yaml.get("items") as YAMLMap<string, string>;
        this.conversationsYaml = this.yaml.get("conversations") as YAMLMap<string>;
    }

    getYaml() {
        return this.yaml;
    }

    getEventsYaml() {
        return this.eventsYaml;
    }

    getConditionsYaml() {
        return this.conditionsYaml;
    }

    getObjectivesYaml() {
        return this.objectivesYaml;
    }

    getItemsYaml() {
        return this.itemsYaml;
    }

    getConversationsYaml() {
        return this.conversationsYaml;
    }
}
