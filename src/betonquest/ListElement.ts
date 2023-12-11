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
        const cont = this.yaml.value?.value.split(" ");
        if (cont && cont.length) {
            return cont[0];
        }
        return "";
    }

    setKind(kind: string) {
        let cont = this.yaml.value?.value.split(" ") || [];
        cont[0] = kind;
        this.yaml.value!.value = cont.join(" ");
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
