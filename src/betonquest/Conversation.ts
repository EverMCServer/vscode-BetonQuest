import YAML, { Document, YAMLMap, Scalar, Pair } from 'yaml';

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
        console.log(translation);
        this.setValueOnYamlPath(["quester"], quester, translation);
    }

    getFirst(): string[] {
        return this.getStringArrayOnYamlPath(["first"]);
    }

    setFirst(pointers: string[]) {
        this.setStringArrayOnYamlPath(["first"], pointers);
    }

    insertFirst(pointers: string[], after?: string) {
        this.insertElementToStringArrayOnYamlPath(["first"], pointers, after);
    }

    removeFirst(pointers: string[]) {
        this.removetElementFromStringArrayOnYamlPath(["first"], pointers);
    }

    getStop(): string {
        return this.getStringOnYamlPath(["stop"]);
    }

    setStop(value: string) {
        this.setValueOnYamlPath(["stop"], value);
    }

    getFinalEvents(): string[] {
        return this.getStringArrayOnYamlPath(["final_events"]);
    }
    
    setFinalEvents(events: string[]) {
        this.setStringArrayOnYamlPath(["final_events"], events);
    }

    insertFinalEvents(events: string[], after?: string) {
        this.insertElementToStringArrayOnYamlPath(["final_events"], events, after);
    }

    removeFinalEvents(events: string[]) {
        this.removetElementFromStringArrayOnYamlPath(["final_events"], events);
    }

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

    // TODO
    getFirstOptions() {}
    // setFirstOptions() {} // needed?

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

    private removetElementFromStringArrayOnYamlPath(yamlPath: string[], elements: string[]) {
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
            return new Option(yaml);
        }
        return undefined;
    }
}

// Conversation's Option
export class Option {
    private yaml: YAMLMap;

    constructor(yaml: YAMLMap) {
        this.yaml = yaml;
    }

    // TODO

    getConditions() {}
    setConditions() {}
    insertConditions() {}
    removeConditions() {}

    getEvents() {}
    setEvents() {}
    insertEvents() {}
    removeEvents() {}

    getPointers() {}
    setPointers() {}
    insertPointers() {}
    removePointers() {}
    getPeriousOptions() {}
    getNextOptions() {}
    // setNextOptions() {} // needed?

    getText() {}
    setText() {}

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

    private removetElementFromStringArrayOnYamlPath(yamlPath: string[], elements: string[]) {
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
            return new Option(yaml);
        }
        return undefined;
    }
}
