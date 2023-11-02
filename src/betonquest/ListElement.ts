import { Pair, Scalar } from "yaml";

export default class ListElement {
    private yaml: Pair<Scalar<string>, Scalar<string>>;

    constructor(pair: Pair<Scalar<string>, Scalar<string>>) {
        this.yaml = pair;
    }

    getName(): string {
        return this.yaml.key.value;
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

    getOptions(): string[] {
        const cont = this.yaml.value?.value.split(" ");
        if (cont && cont.length) {
            if (cont.length > 1) {
                return cont.slice(1);
            }
        }
        return [];
    }

    setOptions(options: string[]) {
        const kind = this.getKind();
        this.yaml.value!.value = [kind, ...options].join(" ");
    }

    toString(): string {
        return this.yaml.value?.value || "";
    }
}