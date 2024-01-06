import YAML, { Document, Pair, Scalar, YAMLMap } from 'yaml';
import Conversation from './Conversation';
import Event from './Event';
import Condition from './Condition';
import Objective from './Objective';
import Item from './Item';
import ListElement, { ListElementType } from './ListElement';

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

    // Get YAMl parse errors
    getYamlErrors() {
        return this.yaml.errors;
    }

    // Reload the whole yaml file.
    // Warning: it will make all Events, Conditions, Objectives, Conversations detached from yaml. You should re-get them after.
    // reloadYaml() {
    //     this.yaml = YAML.parseDocument<YAMLMap<string>, false>(this.yaml.toString());
    // }

    // Emit the Yaml text file.
    getYamlText(yamlToStringOptions?: YAML.ToStringOptions): string {
        return this.yaml.toString({
            collectionStyle: 'block',
            lineWidth: 0,
            nullStr: ``,
            ...yamlToStringOptions
        });
    }

    private getListElementsYaml(type: ListElementType) {
        const yaml = this.yaml.get(type);
        if (yaml instanceof YAMLMap) {
            return yaml;
        }
        return undefined;
    }

    private createElementByType(type: ListElementType, pair: Pair<Scalar<string>, Scalar<string>>) {
        // Fix null value
        if (pair.value instanceof Scalar) {
            if (!pair.value.value) {
                pair.value.value = "";
            }
        }

        switch (type) {
            case "events":
                return new Event(pair);
            case "conditions":
                return new Condition(pair);
            case "objectives":
                return new Objective(pair);
            case "items":
                return new Item(pair);
            default:
                return new ListElement(pair);
        }
    };

    getListElements<T extends ListElement>(type: ListElementType, name: string): T | undefined {
        const yaml = this.getListElementsYaml(type);
        if (yaml !== undefined) {
            const index = yaml.items.findIndex(pair => pair.key.value === name);
            if (index !== -1) {
                const pair = yaml.items[index];
                return this.createElementByType(type, pair) as T;
            }
        }
        return undefined;
    }

    getListElementsByNames<T extends ListElement>(type: ListElementType, names: string[]): (T | undefined)[] {
        return names.map(name => {
            return this.getListElements(type, name);
        });
    }

    getAllListElements<T extends ListElement>(type: ListElementType): T[] {
        return this.getListElementsYaml(type)?.items.map(pair => {
            return this.createElementByType(type, pair) as T;
        }) || [];
    }

    createListElement<T extends ListElement>(type: ListElementType, name: string): T {
        this.yamlAddIn([new Scalar(type)], this.yaml.createPair(new Scalar<string>(name), new Scalar<string>("")));
        return this.getListElements(type, name)! as T;
    }

    removeListElement(type: ListElementType, name: string) {
        this.yaml.deleteIn([type, name]);
    }

    // ----==== Events ====----

    // Get an Event by name.
    getEvent(eventName: string): Event | undefined {
        return this.getListElements("events", eventName);
    }

    // Get multiple Events by names.
    getEvents(eventNames: string[]): (Event | undefined)[] {
        return this.getListElementsByNames("events", eventNames);
    }

    // Get all Events from the Package.
    getAllEvents(): Event[] {
        return this.getAllListElements("events");
    }

    // Create a new Event on the Package.
    createEvent(eventName: string): Event {
        return this.createListElement("events", eventName);
    }

    // Delete a Event from the package.
    removeEvent(eventName: string) {
        this.removeListElement("events", eventName);
    }

    // ----==== Conditions ====----

    // Get a Condition by name.
    getCondition(conditionName: string): Condition | undefined {
        return this.getListElements("conditions", conditionName);
    }

    // Get multiple Conditions by names.
    getConditions(conditionNames: string[]): (Condition | undefined)[] {
        return this.getListElementsByNames("conditions", conditionNames);
    }

    // get all Conditions from the Package.
    getAllConditions(): Condition[] {
        return this.getAllListElements("conditions");
    }

    // Create a new Condition on the Package.
    createCondition(conditionName: string): Condition {
        return this.createListElement("conditions", conditionName);
    }

    // Delete a Condition from the package.
    removeCondition(conditionName: string) {
        this.removeListElement("conditions", conditionName);
    }

    // ----==== Objectives ====----

    getObjective(objectiveName: string): Objective | undefined {
        return this.getListElements("objectives", objectiveName);
    }

    // Get multiple Objectives by names.
    getObjectives(objectiveNames: string[]): (Objective | undefined)[] {
        return this.getListElementsByNames("objectives", objectiveNames);
    }

    // Get all Objectives from the Package.
    getAllObjectives(): Objective[] {
        return this.getAllListElements("objectives");
    }

    // Create a new Objective on the Package.
    createObjective(objectiveName: string): Objective {
        return this.createListElement("objectives", objectiveName);
    }

    // Delete a Objective from the package.
    removeObjective(objectiveName: string) {
        this.removeListElement("objectives", objectiveName);
    }

    // ----==== Items ====----

    // Get an Item by name.
    getItem(itemName: string): Item | undefined {
        return this.getListElements("items", itemName);
    }

    // Get multiple Items by names.
    getItems(itemNames: string[]): (Item | undefined)[] {
        return this.getListElementsByNames("items", itemNames);
    }

    // Get all Items from the Package.
    getAllItems(): Item[] {
        return this.getAllListElements("items");
    }

    // Create a new Item on the Package.
    createItem(itemName: string): Item {
        return this.createListElement("items", itemName);
    }

    // Delete a Item from the package.
    removeItem(itemName: string) {
        this.removeListElement("items", itemName);
    }

    // ----==== Conversations ====----

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
            if (yaml.items.find(pair => pair.key instanceof Scalar && pair.key.value === newScriptName)) {
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
            this.yaml.setIn(path, new YAMLMap(this.yaml.schema)); //
        }
        // Add value onto the YAML
        try {
            this.yaml.addIn(path, value);
        } catch (e) {
            throw e;
        }
    }

}
