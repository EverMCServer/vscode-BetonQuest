import YAML, { Document, Pair, Scalar, YAMLMap } from "yaml";
import ListElement from "./ListElement";


/**
 * Events / Conditions / Objectives List
 * Primarily for BetonQuest v1.x
 */
export default class List<T extends ListElement> {

    private yaml: Document<YAMLMap<Scalar<string>>, false>;

    constructor(yamlText: string, yamlParseOption?: (YAML.ParseOptions & YAML.DocumentOptions & YAML.SchemaOptions)) {
        // Load YAML contents
        this.yaml = YAML.parseDocument<YAMLMap<Scalar<string>>, false>(yamlText, yamlParseOption);
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

    // Emit the Yaml text file.
    getYamlText(yamlToStringOptions?: YAML.ToStringOptions): string {
        return this.yaml.toString({
            collectionStyle: 'block',
            lineWidth: 0,
            nullStr: ``,
            ...yamlToStringOptions
        });
    }

    // Check if yaml path exists
    hasPath(path: string[]) {
        return this.yaml.hasIn(path);
    }

    getListElement(name: string): T | undefined {
        const index = this.yaml.contents.items.findIndex(pair => pair.key.value === name);
        if (index !== -1) {
            const pair = this.yaml.contents.items[index] as Pair<Scalar<string>, Scalar<string>>;
            try {
                return new ListElement(pair) as T;
            } catch { }
        }
        return undefined;
    }

    // // Search list elements by names
    // getListElements(name: string): T[] {
    //     // TODO
    //     return [];
    // }

    getAllListElements(): T[] {
        return this.yaml.contents.items.map(pair => {
            try {
                return new ListElement(pair as Pair<Scalar<string>, Scalar<string>>) as T;
            } catch {
                return this.createListElement(pair.key.value);
            }
        }) || [];
    }

    createListElement(name: string): T {
        // Overwrite invalid datatype
        if (!(this.yaml.contents instanceof YAMLMap)) {
            this.yaml.contents = new YAMLMap<Scalar<string>, Scalar<string>>(this.yaml.schema);
        }

        // Add value onto the YAML
        try {
            this.yaml.contents.add(this.yaml.createPair(new Scalar<string>(name), new Scalar<string>("")));
        } catch (e) {
            throw e;
        }

        return this.getListElement(name)!;
    }

    removeListElement(name: string) {
        // TODO
    }

}
