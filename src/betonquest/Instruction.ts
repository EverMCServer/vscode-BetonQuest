import { Pair, Scalar } from "yaml";

export default class Instruction {
    private yaml: Pair<Scalar<string>, Scalar<string>>;

    constructor(pair: Pair<Scalar<string>, Scalar<string>>) {
        // set default value
        if (pair.value !instanceof Scalar) {
            pair.value = new Scalar("");
        }

        // if (pair.value) {
        //     // remove extra spaces
        //     pair.value.value = pair.value?.value.trim().replace(/ {2,}/g, " ");

        //     // remove duplicated options and arguments
        //     // TODO
        // }

        this.yaml = pair;
    }

    private getKind(): string {
        const cont = this.yaml.value?.value.split(" ");
        if (cont && cont.length) {
            return cont[0];
        }
        return "";
    }

    toString(): string {
        return this.getConfigs().join(" ");
    }

    setString(configString: string) {
        const kind = this.getKind();
        this.yaml.value!.value = [kind, configString].join(" ");
    }

    private getConfigs(): string[] {
        if (!this.yaml.value) {
            return [];
        }

        // Split all configs by whitespaces, with respect to quotes ("")
        const regex = /(?=[^\S]*)(?:(\"[^\"]*?\")|(\'[^\']*?\'))(?=[^\S]+|$)|(\S+)/g; // keep quotes
        // const regex = /(?=[^\S]*)(?:\"([^\"]*?)\"|\'([^\']*?)\')(?=[^\S]+|$)|(\S+)/g; // without quotes
        let array1: RegExpExecArray | null;
        let result: string[] = [];
        while ((array1 = regex.exec(this.yaml.value.value)) !== null) {
            // keep quotes
            if (array1[0]!== undefined) {
                result.push(array1[0]);
            }

            // // without quotes
            // if (array1[1] !== undefined) {
            //     result.push(array1[1]);
            // } else if (array1[2]!== undefined) {
            //     result.push(array1[2]);
            // } else if (array1[3]!== undefined) {
            //     result.push(array1[3]);
            // }
        }
        return result;
    }

    private setConfigs(configs: string[]) {
        const kind = this.getKind();
        this.yaml.value!.value = [kind, ...configs].join(" ");
    }

    getValue() {
        // TODO
    }

    setValue() {
        // TODO: Excape "\" and "\n" and ":"
    }

    getOption(optionName: string) {
        const configs = this.getConfigs();
        const regex = new RegExp(`^${optionName}:`, "i");
        return configs.find(e => e.toLowerCase().match(regex))?.replace(regex, "") || "";
    }

    setOption(optionName: string, optionValue: string, addToHead: boolean = false) {
        const configs = this.getConfigs();
        const regex = new RegExp(`^${optionName}:`, "i");

        // replace old option if exists
        if (configs.find(e => e.toLowerCase().match(regex))) {
            configs.splice(configs.findIndex(e => e.toLowerCase().match(regex)), 1, `${optionName}:${optionValue}`);
        } else {
            if (addToHead) {
                configs.unshift(`${optionName}:${optionValue}`);
            } else {
                configs.push(`${optionName}:${optionValue}`);
            }
        }

        this.setConfigs(configs);
    }

    hasArgument(argumentName: string) {
        const configs = this.getConfigs();
        return configs.some(e => e.toLowerCase().match(`^${argumentName.toLowerCase()}`));
    }

    setArgument(argumentName: string, addToHead: boolean = false) {
        const configs = this.getConfigs();
        if (!this.hasArgument(argumentName)) {
            if (addToHead) {
                configs.unshift(argumentName);
            } else {
                configs.push(argumentName);
            }
            this.setConfigs(configs);
        }
    }

    removeArgument(argumentName: string) {
        const configs = this.getConfigs();
        configs.filter(e => !e.toLowerCase().match(`^${argumentName.toLowerCase()}`));
        this.setConfigs(configs);
    }
}
