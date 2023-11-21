import YAML, { Document, YAMLMap, Pair, Scalar } from 'yaml';
import Conversation from './Conversation';
import Event from './Event';
import Condition from './Condition';
import Objective from './Objective';
import Item from './Item';

export default class Package {

    private yaml: Document<YAMLMap<string>, false>;

    constructor(yamlText: string, yamlParseOption?: (YAML.ParseOptions & YAML.DocumentOptions & YAML.SchemaOptions)) {
        // Load YAML contents
        this.yaml = YAML.parseDocument<YAMLMap<string>, false>(yamlText, yamlParseOption);
        // Init if contents empty
        if (this.yaml.contents instanceof YAMLMap) {
            // OK
        } else if (this.yaml.contents) {
            // TODO: incorrect YAML format
        } else {
            // Init document
            this.yaml.contents = this.yaml.createNode({});
        }
    }

    // Reload the whole yaml file.
    // Warning: it will make all Events, Conditions, Objectives, Conversations detached from yaml. You should re-get them after.
    // reloadYaml() {
    //     this.yaml = YAML.parseDocument<YAMLMap<string>, false>(this.yaml.toString());
    // }

    // Emit the Yaml text file.
    getYamlText(yamlToStringOptions?: YAML.ToStringOptions): string {
        return this.yaml.toString({ nullStr: ``, lineWidth: 0, ...yamlToStringOptions });
    }

    private getEventsYaml() {
        return this.yaml.get("events") as YAMLMap<Scalar<string>, Scalar<string>> | undefined;
    }

    // Get an Event by name.
    getEvent(eventName: string): Event | undefined {
        const index = this.getEventsYaml()?.items.findIndex(pair => pair.key.value === eventName);
        if (index) {
            return new Event(this.getEventsYaml()!.items[index]);
        }
        return undefined;
    }

    // Get multiple Events by names.
    getEvents(eventNames: string[]): (Event | undefined)[] {
        return eventNames.map(value => {
            return this.getEvent(value);
        });
    }

    // Get all Events from the Package.
    getAllEvents(): Event[] {
        return this.getEventsYaml()?.items.map(pair => {
            return new Event(pair);
        }) || [];
    }

    // Create a new Event on the Package.
    createEvent(eventName: string): Event {
        this.yamlAddIn([new Scalar("events")], this.yaml.createPair(new Scalar<string>(eventName), new Scalar<string>("")));
        return this.getEvent(eventName)!;
    }

    // Delete a Event from the package.
    removeEvent(eventName: string) {
        this.yaml.deleteIn(["events", eventName]);
    }

    private getConditionsYaml() {
        return this.yaml.get("conditions") as YAMLMap<Scalar<string>, Scalar<string>> | undefined;
    }

    // Get a Condition by name.
    getCondition(conditionName: string): Condition | undefined {
        const index = this.getConditionsYaml()?.items.findIndex(pair => pair.key.value === conditionName);
        if (index) {
            return new Condition(this.getConditionsYaml()!.items[index]);
        }
        return undefined;
    }

    // Get multiple Conditions by names.
    getConditions(conditionNames: string[]): (Condition | undefined)[] {
        return conditionNames.map(value => {
            return this.getCondition(value);
        });
    }

    // get all Conditions from the Package.
    getAllConditions(): Condition[] {
        return this.getConditionsYaml()?.items.map(pair => {
            return new Condition(pair);
        }) || [];
    }

    // Create a new Condition on the Package.
    createCondition(conditionName: string): Event {
        this.yamlAddIn([new Scalar("conditions")], this.yaml.createPair(new Scalar<string>(conditionName), new Scalar<string>("")));
        return this.getCondition(conditionName)!;
    }

    // Delete a Condition from the package.
    removeCondition(conditionName: string) {
        this.yaml.deleteIn(["conditions", conditionName]);
    }

    private getObjectivesYaml() {
        return this.yaml.get("objectives") as YAMLMap<Scalar<string>, Scalar<string>> | undefined;
    }

    // Get an Objective by name.
    getObjective(objectiveName: string): Objective | undefined {
        const index = this.getObjectivesYaml()?.items.findIndex(pair => pair.key.value === objectiveName);
        if (index) {
            return new Objective(this.getObjectivesYaml()!.items[index]);
        }
        return undefined;
    }

    // Get multiple Objectives by names.
    getObjectives(objectiveNames: string[]): (Objective | undefined)[] {
        return objectiveNames.map(value => {
            return this.getObjective(value);
        });
    }

    // Get all Objectives from the Package.
    getAllObjectives(): Objective[] {
        return this.getObjectivesYaml()?.items.map(pair => {
            return new Objective(pair);
        }) || [];
    }

    // Create a new Objective on the Package.
    createObjective(objectiveName: string): Event {
        this.yamlAddIn([new Scalar("objectives")], this.yaml.createPair(new Scalar<string>(objectiveName), new Scalar<string>("")));
        return this.getObjective(objectiveName)!;
    }

    // Delete a Objective from the package.
    removeObjective(objectiveName: string) {
        this.yaml.deleteIn(["objectives", objectiveName]);
    }

    private getItemsYaml() {
        return this.yaml.get("items") as YAMLMap<Scalar<string>, Scalar<string>> | undefined;
    }

    // Get an Item by name.
    getItem(itemName: string): Item | undefined {
        const index = this.getItemsYaml()?.items.findIndex(pair => pair.key.value === itemName);
        if (index !== undefined) {
            return new Item(this.getItemsYaml()!.items[index]);
        }
        return undefined;
    }

    // Get multiple Items by names.
    getItems(itemNames: string[]): (Item | undefined)[] {
        return itemNames.map(value => {
            return this.getItem(value);
        });
    }

    // Get all Items from the Package.
    getAllItems(): Item[] {
        const yaml = this.getItemsYaml();
        if (yaml) {
            return yaml.items.map(pair => {
                return new Item(pair);
            }) || [];
        }
        return [];
    }

    // Create a new Item on the Package.
    createItem(itemName: string): Event {
        this.yamlAddIn([new Scalar("items")], this.yaml.createPair(new Scalar<string>(itemName), new Scalar<string>("")));
        return this.getItem(itemName)!;
    }

    // Delete a Item from the package.
    removeItem(itemName: string) {
        this.yaml.deleteIn(["items", itemName]);
    }

    private getConversationsYaml() {
        return this.yaml.get("conversations") as YAMLMap<
            // Name of conversation
            Scalar<string>,
            // Content of the actuarial conversation script
            YAMLMap<
                Scalar<string>,
                Scalar<string> | // quester-monolingual, first, stop,
                YAMLMap<
                    Scalar<string>,
                    Scalar<string> | // quester-multilingual
                    YAMLMap<
                        Scalar<string>,
                        Scalar<string> | // text-monolingual, conditions, events, pointers
                        YAMLMap<
                            Scalar<string>,
                            Scalar<string> // text-multilingual
                        >
                    >
                >
            >
        > | undefined;
    }

    // Get all conversations
    // TODO: return array instead, for key renaming etc
    getConversations(): Map<string, Conversation> {
        const map = new Map<string, Conversation>();
        const yaml = this.yaml.getIn(["conversations"]);
        if (yaml instanceof YAMLMap) {
            yaml.items.forEach((pair, i) => {
                if (pair.value instanceof YAMLMap) {
                    map.set(pair.key.toString(), new Conversation({ yamlMap: pair.value }));
                }
            });
        }
        return map;
    }

    // Get the Conversation Model by script name.
    getConversation(scriptName: string): Conversation | undefined {
        let result: Conversation | undefined;
        const yaml = this.yaml.getIn(["conversations"]);
        if (yaml instanceof YAMLMap) {
            yaml.items.forEach(pair => {
                if (pair.key instanceof Scalar && pair.key.value === scriptName) {
                    result = new Conversation({ yamlMap: pair.value });
                }
            });
        }
        return result;
    }

    // Set name of the Conversation script
    // Returns "false" on duplicated key.
    setConversationScriptName(oldScriptName: string, newScriptName: string): boolean {
        const yaml = this.yaml.getIn(["conversations"]);
        if (yaml instanceof YAMLMap) {
            // Check duplicate
            if (yaml.items.find(pair => {
                if (pair.key instanceof Scalar && pair.key.value === newScriptName) {
                    return true;
                }
            })) {
                return false;
            }

            // Set key
            yaml.items.forEach(pair => {
                if (pair.key instanceof Scalar && pair.key.value === oldScriptName) {
                    pair.key.value = newScriptName;
                }
            });
        }
        return true;
    }

    // Create a new Conversation
    createConversation(scriptName: string, quester: string = scriptName, isMultilingual: boolean = true, transitionName: string = 'en'): Conversation | undefined {
        const map = new YAMLMap(this.yaml.schema);
        // Create conversation by translation
        if (isMultilingual) {
            map.addIn([new Scalar("quester")], this.yaml.createPair(new Scalar(transitionName), new Scalar(quester)));
        } else {
            map.add(new Pair(new Scalar("quester"), new Scalar(quester)));
        }
        // Add node to the YAML
        try {
            this.yamlAddIn([new Scalar("conversations")], this.yaml.createPair(new Scalar(scriptName), map));
        } catch (e) {
            return undefined;
        }
        return this.getConversation(scriptName)!;
    }

    // Remove a Conversation
    removeConversation(scriptName: string) {
        this.yaml.deleteIn(["conversations", scriptName]);
    }

    private yamlAddIn(path: Scalar[] | string[], value: any) {
        // Overwrite invalid datatype
        if (!(this.yaml.getIn(path) instanceof YAMLMap)) {
            this.yaml.setIn(path, new YAMLMap(this.yaml.schema));
        }
        // Add value onto the YAML
        try {
            this.yaml.addIn(path, value);
        } catch (e) {
            throw e;
        }
    }

}
