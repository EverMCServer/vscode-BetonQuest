import { YAMLMap, Pair } from 'yaml';

// Conversation
export default class Conversation {
    private yaml: YAMLMap;

    constructor(yaml: YAMLMap) {
        this.yaml = yaml;
    }

    getQuester(translation?: string): string {
        return this.getStringOnYamlPath(["quester"], translation);
    }

    setQuester(quester: string, translation?: string) {
        this.setValueOnYamlPath(["quester"], quester, translation);
    }

    getFirst(): string[] {
        return this.getStringArrayOnYamlPath(["first"]);
    }

    setFirst(pointers: string[]) {
        this.setStringArrayOnYamlPath(["first"], pointers);
    }

    insertFirst(pointers: string[], before?: string) {
        this.insertElementToStringArrayOnYamlPath(["first"], pointers, before);
    }

    removeFirst(pointers: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["first"], pointers);
    }

    getFirstOptions(optionNames: string[]): (Option | undefined)[] {
        return optionNames.map(optionName => {
            return this.getOption("NPC_options", optionName);
        });
    }

    // setFirstOptions() {} // Not needed, should use setFirst/insertFirst instead

    getStop(): string {
        return this.getStringOnYamlPath(["stop"]);
    }

    setStop(value: string) {
        this.setValueOnYamlPath(["stop"], value);
    }

    getFinalEventNames(): string[] {
        return this.getStringArrayOnYamlPath(["final_events"]);
    }
    
    setFinalEventNames(events: string[]) {
        this.setStringArrayOnYamlPath(["final_events"], events);
    }

    insertFinalEventNames(events: string[], before?: string) {
        this.insertElementToStringArrayOnYamlPath(["final_events"], events, before);
    }

    removeFinalEventNames(events: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["final_events"], events);
    }

    getFinalEvents() {} // TODO

    getInterceptor(): string {
        return this.getStringOnYamlPath(["interceptor"]);
    }

    setInterceptor(interceptor: string) {
        this.setValueOnYamlPath(["interceptor"], interceptor);
    }

    getNpcOption(optionName: string): Option | undefined {
        return this.getOption("NPC_options", optionName);
    }

    getPlayerOption(optionName: string): Option | undefined {
        return this.getOption("player_options", optionName);
    }

    private getStringOnYamlPath(yamlPath: string[], translation: string = "en"): string {
        let result: unknown;
        try {
            result = this.yaml.getIn(yamlPath);
        } catch {
            return "";
        }
        if (result instanceof YAMLMap) {
            // Check if value saved with YAML.YAMLMap or string
            try {
                return result.get(translation) as string;
            } catch {
                return "";
            }
        } else if (typeof result === "string") {
            return result;
        }
        return "";
    }

    private setValueOnYamlPath(yamlPath: string[], value: unknown, translation?: string) {
        let node: unknown;
        try {
            node = this.yaml.getIn(yamlPath);
        } catch {
            return;
        }
        if (node instanceof YAMLMap) {
            // Check if value saved with YAML.YAMLMap or string
            node.set(translation||"en", value);
        } else if (typeof node === "string" || !translation) {
            this.yaml.setIn(yamlPath, value);
        } else {
            const map = new YAMLMap();
            map.add(new Pair(translation, value));
            this.yaml.setIn(yamlPath, map);
        }
    }

    private getStringArrayOnYamlPath(yamlPath: string[]): string[] {
        let str: unknown;
        try {
            str = this.yaml.getIn(yamlPath);
        } catch {
            return [];
        }
        if (typeof str !== "string") {
            return [];
        }
        // Split element by ","
        return str.split(/[ \t\r]*,[ \t\r]*/)
            // Remove any "empty" pointer
            .filter((value) => {
                return value.match(/^[ \t\r]*$/) === null;
            });
    }

    private setStringArrayOnYamlPath(yamlPath: string[], stringArray: string[]) {
        const str = stringArray.filter((value) => {
            // Filter out empty elements
            return value.match(/^[ \t\r]*$/) === null;
        }).join(", ");
        this.yaml.setIn(yamlPath, str);
    }

    private insertElementToStringArrayOnYamlPath(yamlPath: string[], elements: string[], before?: string) {
        // Search pos to insert
        const existArray = this.getStringArrayOnYamlPath(yamlPath);
        let pos = existArray.length;
        if (before) {
            existArray.forEach((value, index) => {
                if (before === value) {
                    pos = index;
                }
            });
        }

        // Save
        this.setStringArrayOnYamlPath(yamlPath, [...existArray.slice(0, pos), ...elements, ...existArray.slice(pos)]);
    }

    private removetElementsFromStringArrayOnYamlPath(yamlPath: string[], elements: string[]) {
        elements.forEach(element => {
            this.setStringArrayOnYamlPath(yamlPath, this.getStringArrayOnYamlPath(yamlPath).filter(value => {
                return value.match(new RegExp("$[ \t\r]*"+element+"[ \t\r]*^")) === null;
            }));
        });
    }

    private getOption(type: string, optionName: string): Option | undefined {
        let yaml: unknown;
        try {
            yaml = this.yaml.getIn([type, optionName]);
        } catch {
            return undefined;
        }
        
        if (yaml instanceof YAMLMap) {
            return new Option(optionName, type, yaml, this);
        }
        return undefined;
    }
}

// Conversation's Option
export class Option {
    private name: string;
    private type: string; // = "NPC_options" / "player_options"
    private yaml: YAMLMap;
    private conversation: Conversation; // the Conversation this Option belongs to
    // private package?: Package; // the Package this Option belongs to
    // private completeConversation?: Conversation; // the complete Conversation this Option belongs to, from the complete Package
    // private completePackage?: Package; // the complete Package

    constructor(name: string, type: string, yaml: YAMLMap, conversation: Conversation) {
        this.name = name;
        this.type = type;
        this.yaml = yaml;
        this.conversation = conversation;

        // Fix incorrect named sections:
        // conditions vs condition
        const condition = this.getStringOnYamlPath(["condition"]);
        if (!this.getStringOnYamlPath(["conditions"]).length && condition.length) {
            this.yaml.setIn(["conditions"], condition);
            this.yaml.deleteIn(["condition"]);
        }
        // events vs event
        const event = this.getStringOnYamlPath(["event"]);
        if (!this.getStringOnYamlPath(["events"]).length && event.length) {
            this.yaml.setIn(["events"], event);
            this.yaml.deleteIn(["event"]);
        }
        // pointers vs pointer
        const pointer = this.getStringOnYamlPath(["pointer"]);
        if (!this.getStringOnYamlPath(["pointers"]).length && pointer.length) {
            this.yaml.setIn(["pointers"], pointer);
            this.yaml.deleteIn(["pointer"]);
        }

    }

    getName(): string {
        return this.name;
    }

    getConditionNames() {
        return this.getStringArrayOnYamlPath(["conditions"]);
    }

    setConditionNames(conditionNames: string[]) {
        this.setStringArrayOnYamlPath(["conditions"], conditionNames);
    }

    insertConditionNames(conditionNames: string[], before?: string) {
        this.insertElementToStringArrayOnYamlPath(["conditions"], conditionNames, before);
    }

    removeConditionNames(conditionNames: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["conditions"], conditionNames);
    }

    getEventNames(): string[] {
        return this.getStringArrayOnYamlPath(["events"]);
    }

    setEventNames(eventNames: string[]) {
        this.setStringArrayOnYamlPath(["events"], eventNames);
    }

    insertEventNames(eventNames: string[], before: string) {
        this.insertElementToStringArrayOnYamlPath(["events"], eventNames, before);
    }

    removeEventNames(eventNames: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["events"], eventNames);
    }

    getPointerNames() {
        return this.getStringArrayOnYamlPath(["pointers"]);
    }

    setPointerNames(pointerNames: string[]) {
        this.setStringArrayOnYamlPath(["pointers"], pointerNames);
    }

    insertPointerNames(pointerNames: string[], before: string) {
        this.insertElementToStringArrayOnYamlPath(["pointers"], pointerNames, before);
    }

    removePointerNames(pointerNames: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["pointers"], pointerNames);
    }

    // getPeriousOptions() {}
    // getNextOptions() {}
    // setNextOptions() {} // needed?

    getText(translation?: string): string {
        return this.getStringOnYamlPath(["text"], translation);
    }

    setText(text: string, translation?: string) {
        this.setValueOnYamlPath(["text"], text, translation);
    }

    private getStringOnYamlPath(yamlPath: string[], translation: string = "en"): string {
        let result: unknown;
        try {
            result = this.yaml.getIn(yamlPath);
        } catch {
            return "";
        }
        if (result instanceof YAMLMap) {
            // Check if value saved with YAML.YAMLMap or string
            try {
                return result.get(translation) as string;
            } catch {
                return "";
            }
        } else if (typeof result === "string") {
            return result;
        }
        return "";
    }

    private setValueOnYamlPath(yamlPath: string[], value: unknown, translation?: string) {
        let node: unknown;
        try {
            node = this.yaml.getIn(yamlPath);
        } catch {
            return;
        }
        if (node instanceof YAMLMap) {
            // Check if value saved with YAML.YAMLMap or string
            node.set(translation||"en", value);
        } else if (typeof node === "string" || !translation) {
            this.yaml.setIn(yamlPath, value);
        } else {
            const map = new YAMLMap();
            map.add(new Pair(translation, value));
            this.yaml.setIn(yamlPath, map);
        }
    }

    private getStringArrayOnYamlPath(yamlPath: string[]): string[] {
        let str: unknown;
        try {
            str = this.yaml.getIn(yamlPath);
        } catch {
            return [];
        }
        if (typeof str !== "string") {
            return [];
        }
        // Split element by ","
        return str.split(/[ \t\r]*,[ \t\r]*/)
            // Remove any "empty" pointer
            .filter((value) => {
                return value.match(/^[ \t\r]*$/) === null;
            });
    }

    private setStringArrayOnYamlPath(yamlPath: string[], stringArray: string[]) {
        const str = stringArray.filter((value) => {
            // Filter out empty elements
            return value.match(/^[ \t\r]*$/) === null;
        }).join(", ");
        this.yaml.setIn(yamlPath, str);
    }

    private insertElementToStringArrayOnYamlPath(yamlPath: string[], elements: string[], before?: string) {
        // Search pos to insert
        const existArray = this.getStringArrayOnYamlPath(yamlPath);
        let pos = existArray.length;
        if (before) {
            existArray.forEach((value, index) => {
                if (before === value) {
                    pos = index;
                }
            });
        }

        // Save
        this.setStringArrayOnYamlPath(yamlPath, [...existArray.slice(0, pos), ...elements, ...existArray.slice(pos)]);
    }

    private removetElementsFromStringArrayOnYamlPath(yamlPath: string[], elements: string[]) {
        elements.forEach(element => {
            this.setStringArrayOnYamlPath(yamlPath, this.getStringArrayOnYamlPath(yamlPath).filter(value => {
                return value.match(new RegExp("$[ \t\r]*"+element+"[ \t\r]*^")) === null;
            }));
        });
    }

    // private getOption(optionName: string): Option | undefined {
    //     if (this.type === "NPC_options") {
    //         return this.conversation.getPlayerOption(optionName);
    //     } else if (this.type === "player_options") {
    //         return this.conversation.getNpcOption(optionName);
    //     }
    // }
}
