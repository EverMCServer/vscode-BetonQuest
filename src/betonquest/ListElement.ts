import { Pair, Scalar } from "yaml";
import Arguments, { ArgumentsPattern } from "./Arguments";

export type ListElementType = 'events' | 'conditions' | 'objectives' | 'conversations' | 'items' | 'unknown';

export default class ListElement {
    protected yaml: Pair<Scalar<string>, Scalar<string>>;

    constructor(pair: Pair<Scalar<string>, Scalar<string>>) {
        this.yaml = pair;
    }

    getName(): string {
        return this.yaml.key.value;
    }

    setName(name: string) {
        this.yaml.key.value = name.trim();
    }

    toString(): string {
        return this.yaml.value?.value || "";
    }

    getKind(): string {
        const instructions = this.yaml.value?.value.split(" ");
        if (instructions && instructions.length) {
            return instructions[0];
        }
        return "";
    }

    setKind(kind: string) {
        let instructions = this.yaml.value?.value.split(" ") || [];

        // Set kind
        if (instructions.length > 0 && instructions[0] !== kind) {
            instructions[0] = kind;
            this.yaml.value!.value = instructions.join(" ");
        } else if (instructions.length === 0) {
            this.yaml.value!.value = kind;
        }
    }

    getArguments(pattern?: ArgumentsPattern): Arguments {
        return new Arguments(this.yaml, pattern);
    }

}
