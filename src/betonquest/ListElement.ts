import { Pair, Scalar } from "yaml";
import Arguments, { ArgumentsPattern } from "./Arguments";

export type ListElementType = 'events' | 'conditions' | 'objectives' | 'conversations' | 'items' | 'unknown';

export default class ListElement {
    protected yaml: Pair<Scalar<string>, Scalar<string>>;

    protected arguments: Arguments;

    constructor(pair: Pair<Scalar<string>, Scalar<string>>) {
        this.yaml = pair;

        // Initialize arguments
        this.arguments = this.parseArguments();
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

        // Reset / remove all arguments when siwtching kind
        if (instructions.length>0 && instructions[0] !== kind) {
            this.yaml.value!.value = kind;
            this.arguments = this.getArguments();
        }
    }

    getArguments(pattern?: ArgumentsPattern): Arguments {
        if (pattern) {
            this.arguments = this.parseArguments(pattern);
        }
        return this.arguments;
    }

    private parseArguments(pattern?: ArgumentsPattern): Arguments {
        return new Arguments(this.yaml, pattern);
    }

}
