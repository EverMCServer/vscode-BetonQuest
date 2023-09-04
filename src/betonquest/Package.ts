import YAML, { Document, YAMLMap, Pair } from 'yaml';
import Conversation from './Conversation';
import Event from './Event';
import Condition from './Condition';
import Objective from './Objective';
import Item from './Item';

export default class Package {

    private yaml: Document<YAMLMap<string>, false>;

    constructor(yamlText: string) {
        this.yaml = YAML.parseDocument<YAMLMap<string>, false>(yamlText);
    }

    reloadYaml() {
        this.yaml = YAML.parseDocument<YAMLMap<string>, false>(this.yaml.toString());
    }

    private getYaml() {
        return this.yaml;
    }

    getYamlText(): string {
        return this.getYaml().toString();
    }

    private getEventsYaml() {
        return this.yaml.get("events") as YAMLMap<string, string> | undefined;
    }

    getEvent(eventName: string): Event {
        return new Event(eventName, this.getEventsYaml()?.get(eventName)!);
    }

    getEvents(eventNames: string[]): Event[] {
        return eventNames.map(value => {
            return this.getEvent(value);
        });
    }

    getAllEvents(): Event[] {
        return this.getEventsYaml()?.items.map(pair => {
            return new Event(pair.key, pair.value || "");
        }) || [];
    }

    private getConditionsYaml() {
        return this.yaml.get("conditions") as YAMLMap<string, string> | undefined;
    }

    getCondition(conditionName: string): Condition {
        return new Condition(conditionName, this.getConditionsYaml()?.get(conditionName)!);
    }

    getConditions(conditionNames: string[]): Condition[] {
        return conditionNames.map(value => {
            return this.getCondition(value);
        });
    }

    getAllConditions(): Condition[] {
        return this.getConditionsYaml()?.items.map(pair => {
            return new Condition(pair.key, pair.value || "");
        }) || [];
    }

    private getObjectivesYaml() {
        return this.yaml.get("objectives") as YAMLMap<string, string> | undefined;
    }

    getObjective(objectiveName: string): Objective {
        return new Objective(objectiveName, this.getConditionsYaml()?.get(objectiveName)!);
    }

    getObjectives(objectiveNames: string[]): Objective[] {
        return objectiveNames.map(value => {
            return this.getObjective(value);
        });
    }

    getAllObjectives(): Objective[] {
        return this.getObjectivesYaml()?.items.map(pair => {
            return new Objective(pair.key, pair.value || "");
        }) || [];
    }

    private getItemsYaml() {
        return this.yaml.get("items") as YAMLMap<string, string> | undefined;
    }

    getItem(itemName: string): Item {
        return new Item(itemName, this.getConditionsYaml()?.get(itemName)!);
    }

    getItems(itemNames: string[]): Item[] {
        return itemNames.map(value => {
            return this.getItem(value);
        });
    }

    getAllItems(): Item[] {
        return this.getItemsYaml()?.items.map(pair => {
            return new Item(pair.key, pair.value || "");
        }) || [];
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

    // Create a new Conversation
    newConversation(scriptName: string, quester: string = ""): Conversation {
        const map = new YAMLMap();
        map.add(new Pair("quester", quester));
        this.yaml.setIn(["conversations", scriptName], map);
        return this.getConversation(scriptName)!;
    }

    // Remove a Conversation
    removeConversation(scriptName: string) {
        this.yaml.deleteIn(["conversations", scriptName]);
    }

}
