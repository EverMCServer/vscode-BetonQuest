import YAML, { Pair, Scalar, YAMLError, YAMLMap } from 'yaml';

// Conversation
export default class Conversation {
    private yaml: YAMLMap;
    private yamlErrors?: YAMLError[];
    private name: string;

    constructor(yaml: { yamlMap?: YAMLMap, yamlText?: string, yamlParseOption?: (YAML.ParseOptions & YAML.DocumentOptions & YAML.SchemaOptions) }, name?: string) {
        this.name = name ?? "";
        if (yaml.yamlMap) {
            this.yaml = yaml.yamlMap;
        } else if (yaml.yamlText) {
            const document = YAML.parseDocument<YAMLMap<string>, false>(yaml.yamlText, yaml.yamlParseOption);
            this.yaml = document.contents;
            if (document.errors.length) {
                this.yamlErrors = document.errors;
            }
        } else {
            this.yaml = new YAMLMap();
        }
    }

    // Get Yaml parse errors
    getYamlErrors() {
        return this.yamlErrors;
    }

    // Emit the Yaml text file.
    getYamlText(yamlToStringOptions?: YAML.ToStringOptions): string {
        return YAML.stringify(this.yaml, {
            collectionStyle: 'block',
            lineWidth: 0,
            nullStr: ``,
            ...yamlToStringOptions
        }) || "";
    }

    getName() {
        return this.name;
    }

    getQuester(translation?: string): string {
        return this.getStringOnYamlPath(["quester"], translation);
    }

    setQuester(quester: string, translation?: string) {
        this.setValueOnYamlPath(["quester"], new Scalar(quester), translation);
    }

    getFirst(): string[] {
        const pointers = this.getStringArrayOnYamlPath(["first"], true);

        // Filter duplicated pointers, prevent looped connection
        const pointersFiltered = pointers.filter((pointer, index, allPointers) => index === allPointers.indexOf(pointer));
        if (pointers.length !== pointersFiltered.length) {
            this.setStringArrayOnYamlPath(["first"], pointersFiltered);
        }

        return pointersFiltered;
    }

    setFirst(pointers: string[]) {
        this.setStringArrayOnYamlPath(["first"], pointers);
    }

    insertFirst(pointers: string[], location?: number | string) {
        this.insertElementsToStringArrayOnYamlPath(["first"], pointers, location, true);
    }

    removeFirst(pointers: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["first"], pointers);
    }

    // Remove first pointers till the end, for easy dealing with "else" conditions, return removed pointers
    removeFirstTillEnd(pointer: string) {
        const allPointers = this.getFirst();
        const pos = allPointers.indexOf(pointer);
        if (pos > -1) {
            this.setFirst(allPointers.slice(0, pos));
        }
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
        this.setValueOnYamlPath(["stop"], new Scalar(value));
    }

    getFinalEventNames(): string[] {
        return this.getStringArrayOnYamlPath(["final_events"]);
    }

    setFinalEventNames(events: string[]) {
        this.setStringArrayOnYamlPath(["final_events"], events);
    }

    editFinalEventName(location: number | string, eventName: string) {
        this.editElementOfStringArrayOnYamlPath(["final_events"], location, eventName);
    }

    insertFinalEventNames(events: string[], location?: number | string) {
        this.insertElementsToStringArrayOnYamlPath(["final_events"], events, location);
    }

    removeFinalEventNames(events: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["final_events"], events);
    }

    getFinalEvents() { } // TODO

    getInterceptor(): string[] {
        return this.getStringArrayOnYamlPath(["interceptor"], true);
    }

    setInterceptor(interceptors: string[]) {
        this.setStringArrayOnYamlPath(["interceptor"], interceptors);
    }

    getNpcOption(optionName: string): Option | undefined {
        return this.getOption("NPC_options", optionName);
    }

    getAllNpcOptions(): Option[] {
        return this.getOptions("NPC_options") || [];
    }

    getPlayerOption(optionName: string): Option | undefined {
        return this.getOption("player_options", optionName);
    }

    getAllPlayerOptions(): Option[] {
        return this.getOptions("player_options") || [];
    }

    createNpcOption(optionName: string): Option | undefined {
        return this.createOption("NPC_options", optionName);
    }

    createPlayerOption(optionName: string): Option | undefined {
        return this.createOption("player_options", optionName);
    }

    deleteNpcOption(optionName: string) {
        this.deleteOption("NPC_options", optionName);
    }

    deletePlayerOption(optionName: string) {
        this.deleteOption("player_options", optionName);
    }

    // Get a single Option
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

    // Get all Options of a type
    private getOptions(type: string): Option[] | undefined {
        let yaml: unknown;
        try {
            yaml = this.yaml.getIn([type]);
        } catch {
            return undefined;
        }

        if (yaml instanceof YAMLMap) {
            return yaml.items.map(e => new Option(e.key.value, type, e.value, this));
        }
        return undefined;
    }

    // Create a new Option
    createOption(type: string, optionName: string): Option | undefined {
        this.setValueOnYamlPath([type, optionName], new YAMLMap(this.yaml.schema));
        return this.getOption(type, optionName);
    }

    // Remove an Option from the Yaml
    deleteOption(type: string, optionName: string) {
        let yaml: unknown;
        try {
            yaml = this.yaml.getIn([type, optionName]);
        } catch {
            return;
        }

        if (yaml) {
            this.yaml.deleteIn([type, optionName]);
        }
    }

    // Check if the Yaml multilingual
    isMultilingual(): boolean {
        return this.isPathYAMLMap(["quester"])
            || !(this.getOptions("NPC_options") || []).every(e => !e.isMultilingual())
            || !(this.getOptions("player_options") || []).every(e => !e.isMultilingual());
    }

    // Get number of translations of the Yaml
    getTranslations(): string[] {
        let translations: Map<string, boolean> = new Map();
        let yamlResult: unknown;

        // Get translations from "quester" name
        try {
            yamlResult = this.yaml.getIn(["quester"]);
            if (yamlResult instanceof YAMLMap) {
                // Check if value saved with YAML.YAMLMap or string
                yamlResult.items.forEach(e => {
                    translations.set(e.key.value as string, true);
                });
            }
        } catch { }

        // Get translations from "NPC_options" & "player_options"
        ["NPC_options", "player_options"].forEach(l => {
            try {
                yamlResult = this.yaml.getIn([l]);
                if (yamlResult instanceof YAMLMap) {
                    yamlResult.items.forEach(o => {
                        if (o instanceof Pair && o.value instanceof YAMLMap) {
                            let yamlResult2: unknown;
                            try {
                                yamlResult2 = o.value.getIn(["text"]);
                                if (yamlResult2 instanceof YAMLMap) {
                                    yamlResult2.items.forEach(e => {
                                        translations.set(e.key.value as string, true);
                                    });
                                }
                            } catch { }
                        }
                    });
                }
            } catch { }
        });

        const result: string[] = [];
        translations.forEach((_, k) => {
            result.push(k);
        });
        return result;
    }

    private isPathYAMLMap(yamlPath: string[]): boolean {
        try {
            let result = this.yaml.getIn(yamlPath);
            return result instanceof YAMLMap;
        } catch { }
        return false;
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

    private setValueOnYamlPath(yamlPath: string[], value?: unknown, translation?: string) {
        let node: unknown;
        try {
            node = this.yaml.getIn(yamlPath);
        } catch {
            return;
        }
        // Check if value saved with YAML.YAMLMap or string
        if (node instanceof YAMLMap) {
            node.set(new Scalar(translation || "en"), value);
        } else if (typeof node === "string" || !translation) {
            this.yaml.setIn(yamlPath.map(e => new Scalar(e)), value);
        } else {
            const map = new YAMLMap(this.yaml.schema);
            map.add(new Pair(new Scalar(translation), value));
            this.yaml.setIn(yamlPath.map(e => new Scalar(e)), map);
        }
    }

    private getStringArrayOnYamlPath(yamlPath: string[], removeEmpty: boolean = false): string[] {
        let str: unknown;
        try {
            str = this.yaml.getIn(yamlPath);
        } catch {
            return [];
        }
        if (typeof str !== "string" || removeEmpty && str.length === 0) {
            return [];
        }
        // Split element by ","
        const result = str.split(/[ \t\r]*,[ \t\r]*/);
        // Remove any "empty" pointer
        if (removeEmpty) {
            return result.filter(value => value.match(/^[ \t\r]*$/) === null);
        }
        return result;
    }

    private setStringArrayOnYamlPath(yamlPath: string[], stringArray: string[]) {
        // const str = stringArray.filter((value) => {
        //     // Filter out empty elements
        //     return value.match(/^[ \t\r]*$/) === null;
        // }).join(", ");

        // Remove the whole key from YAML if array is empty
        if (stringArray.length === 0) {
            this.yaml.deleteIn(yamlPath);
            return;
        }

        const str = new Scalar(stringArray.join(", "));
        this.yaml.setIn(yamlPath.map(e => new Scalar(e)), str);
    }

    private editElementOfStringArrayOnYamlPath(yamlPath: string[], location: number | string, element: string, removeEmpty: boolean = false) {
        // Search pos to edit
        const existArray = this.getStringArrayOnYamlPath(yamlPath, removeEmpty);
        let pos = -1;
        switch (typeof location) {
            case "string":
                pos = existArray.indexOf(location);
                break;
            case "number":
                pos = location;
                break;
        }
        if (pos < 0) {
            return;
        }
        // replace element
        existArray[pos] = element;
        // Save
        this.setStringArrayOnYamlPath(yamlPath, existArray);
    }

    private insertElementsToStringArrayOnYamlPath(yamlPath: string[], elements: string[], location?: number | string, removeEmpty: boolean = false) {
        // Search pos to insert
        const existArray = this.getStringArrayOnYamlPath(yamlPath, removeEmpty);
        let pos = existArray.length;
        switch (typeof location) {
            case "string":
                pos = existArray.indexOf(location);
                break;
            case "number":
                pos = location;
                break;
        }

        // Save
        this.setStringArrayOnYamlPath(yamlPath, [...existArray.slice(0, pos), ...elements, ...existArray.slice(pos)]);
    }

    private removetElementsFromStringArrayOnYamlPath(yamlPath: string[], elements: string[]) {
        elements.forEach(element => {
            this.setStringArrayOnYamlPath(yamlPath, this.getStringArrayOnYamlPath(yamlPath).filter(value => {
                return value.match(new RegExp("^[ \t\r]*" + element + "[ \t\r]*$")) === null;
            }));
        });
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
        const condition = this.yaml.getIn(["condition"]);
        if (!this.yaml.getIn(["conditions"]) && condition) {
            this.yaml.setIn([new Scalar("conditions")], condition);
            this.yaml.deleteIn(["condition"].map(e => new Scalar(e)));
        }
        // events vs event
        const event = this.yaml.getIn(["event"]);
        if (!this.yaml.getIn(["events"]) && event) {
            this.yaml.setIn([new Scalar("events")], event);
            this.yaml.deleteIn(["event"]);
        }
        // pointers vs pointer
        const pointer = this.yaml.getIn(["pointer"]);
        if (!this.yaml.getIn(["pointers"]) && pointer) {
            this.yaml.setIn([new Scalar("pointers")], pointer);
            this.yaml.deleteIn(["pointer"]);
        }

    }

    getType(): string {
        return this.type;
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

    editConditionName(location: number | string, conditionName: string) {
        this.editElementOfStringArrayOnYamlPath(["conditions"], location, conditionName);
    }

    insertConditionNames(conditionNames: string[], location?: number | string) {
        this.insertElementsToStringArrayOnYamlPath(["conditions"], conditionNames, location);
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

    editEventName(location: number | string, eventName: string) {
        this.editElementOfStringArrayOnYamlPath(["events"], location, eventName);
    }

    insertEventNames(eventNames: string[], location?: number | string) {
        this.insertElementsToStringArrayOnYamlPath(["events"], eventNames, location);
    }

    removeEventNames(eventNames: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["events"], eventNames);
    }

    getPointerNames() {
        const pointers = this.getStringArrayOnYamlPath(["pointers"], true);

        // Filter duplicated pointers, prevent looped connection
        const pointersFiltered = pointers.filter((pointer, index, allPointers) => index === allPointers.indexOf(pointer));
        if (pointers.length !== pointersFiltered.length) {
            this.setStringArrayOnYamlPath(["pointers"], pointersFiltered);
        }

        return pointersFiltered;
    }

    setPointerNames(pointerNames: string[]) {
        this.setStringArrayOnYamlPath(["pointers"], pointerNames);
    }

    editPointerName(location: number | string, pointerName: string) {
        this.editElementOfStringArrayOnYamlPath(["pointers"], location, pointerName, true);
    }

    insertPointerNames(pointerNames: string[], location?: number | string) {
        this.insertElementsToStringArrayOnYamlPath(["pointers"], pointerNames, location, true);
    }

    removePointerNames(pointerNames: string[]) {
        this.removetElementsFromStringArrayOnYamlPath(["pointers"], pointerNames);
    }

    // Remove first pointers till the end, for easy dealing with "else" conditions
    removePointerNamesTillEnd(pointer: string) {
        const allPointers = this.getPointerNames();
        const pos = allPointers.indexOf(pointer);
        if (pos > -1) {
            this.setPointerNames(allPointers.slice(0, pos));
        }
    }

    // TODO

    // getPeriousOptions() {}
    // getNextOptions() {}
    // setNextOptions() {} // needed?

    getText(translation?: string): string {
        return this.getStringOnYamlPath(["text"], translation);
    }

    setText(text: string, translation?: string) {
        this.setValueOnYamlPath(["text"], new Scalar(text), translation);
    }

    // Check if text multilingual
    isMultilingual(): boolean {
        let result: unknown;
        try {
            result = this.yaml.getIn(["text"]);
        } catch { }
        return (result instanceof YAMLMap);
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
            node.set(new Scalar(translation || "en"), value);
        } else if (typeof node === "string" || !translation) {
            this.yaml.setIn(yamlPath.map(e => new Scalar(e)), value);
        } else {
            const map = new YAMLMap(this.yaml.schema);
            map.add(new Pair(new Scalar(translation), value));
            this.yaml.setIn(yamlPath.map(e => new Scalar(e)), map);
        }
    }

    private getStringArrayOnYamlPath(yamlPath: string[], removeEmpty: boolean = false): string[] {
        let str: unknown;
        try {
            str = this.yaml.getIn(yamlPath);
        } catch {
            return [];
        }
        if (typeof str !== "string" || removeEmpty && str.length === 0) {
            return [];
        }
        // Split element by ","
        const result = str.split(/[ \t\r]*,[ \t\r]*/);
        // Remove any "empty" pointer
        if (removeEmpty) {
            return result.filter(value => value.match(/^[ \t\r]*$/) === null);
        }
        return result;
    }

    private setStringArrayOnYamlPath(yamlPath: string[], stringArray: string[]) {
        // // Filter out empty elements
        // const str = stringArray.filter((value) => {
        //     return value.match(/^[ \t\r]*$/) === null;
        // }).join(", ");

        // Remove the whole key from YAML if array is empty
        if (stringArray.length === 0) {
            this.yaml.deleteIn(yamlPath);
            return;
        }

        const str = new Scalar(stringArray.join(", "));
        this.yaml.setIn(yamlPath.map(e => new Scalar(e)), str);
    }

    private editElementOfStringArrayOnYamlPath(yamlPath: string[], location: number | string, element: string, removeEmpty: boolean = false) {
        // Search pos to edit
        const existArray = this.getStringArrayOnYamlPath(yamlPath, removeEmpty);
        let pos = -1;
        switch (typeof location) {
            case "string":
                pos = existArray.indexOf(location);
                break;
            case "number":
                pos = location;
                break;
        }
        if (pos < 0) {
            return;
        }
        // replace element
        existArray[pos] = element;
        // Save
        this.setStringArrayOnYamlPath(yamlPath, existArray);
    }

    private insertElementsToStringArrayOnYamlPath(yamlPath: string[], elements: string[], location?: number | string, removeEmpty: boolean = false) {
        // Search pos to insert
        const existArray = this.getStringArrayOnYamlPath(yamlPath, removeEmpty);
        let pos = existArray.length;
        switch (typeof location) {
            case "string":
                pos = existArray.indexOf(location);
                break;
            case "number":
                pos = location;
                break;
        }

        // Save
        this.setStringArrayOnYamlPath(yamlPath, [...existArray.slice(0, pos), ...elements, ...existArray.slice(pos)]);
    }

    private removetElementsFromStringArrayOnYamlPath(yamlPath: string[], elements: string[]) {
        elements.forEach(element => {
            this.setStringArrayOnYamlPath(yamlPath, this.getStringArrayOnYamlPath(yamlPath).filter(value => {
                return value.match(new RegExp("^[ \t\r]*" + element + "[ \t\r]*$")) === null;
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
