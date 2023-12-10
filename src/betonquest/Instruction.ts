import { Pair, Scalar } from "yaml";

/**
 * Mandatory arguments' pattern
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * string[|] - string array, separated by "|""
 * * \* - all string till the end, including spaces and optional arguments
 */
type MandatoryArgumentsPattern = (
    'string' |
    'int' |
    'float' |
    'string[,]' |
    'string[|]' |
    'ItemName:number[,]' |
    '*')[];

type MandatoryArguments = (string | number | string[])[];

/**
 * Optional arguments' pattern
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * boolean - argument only, no value
 */
type OptionalArgumentsPattern = Map<string,
'string' |
'int' |
'float' |
'string[,]' |
'ItemName:number[,]' |
'boolean'>;

type OptionalArguments = Map<string, string | number | string[] | boolean | undefined>;

type ArgumentsPattern = {
    mandatory: MandatoryArgumentsPattern,
    optional?: OptionalArgumentsPattern,
    optionalAtFirst?: boolean,
};

type Arguments = {
    mandatory: MandatoryArguments,
    optional?: OptionalArguments,
    optionalAtFirst?: boolean,
};

export default class Instruction {
    // Original YAML entry, with a key
    private yaml: Pair<Scalar<string>, Scalar<string>>;

    // Cache parsed configs
    private configs: string[];

    private arguments?: Arguments;

    private patten?: ArgumentsPattern;

    constructor(pair: Pair<Scalar<string>, Scalar<string>>, patten?: ArgumentsPattern) {
        // Set default value
        if (pair.value! instanceof Scalar) {
            pair.value = new Scalar("");
        }

        // if (pair.value) {
        //     // remove extra spaces
        //     pair.value.value = pair.value?.value.trim().replace(/ {2,}/g, " ");

        //     // remove duplicated options and arguments
        //     // TODO
        // }

        this.yaml = pair;

        this.patten = patten;

        this.configs = this.parseConfigs(); // TODO: with patten
    }

    private getKind(): string {
        const cont = this.yaml.value?.value.split(" ");
        if (cont && cont.length) {
            return cont[0];
        }
        return "";
    }

    toString(): string {
        return this.configs.join(" ");
    }

    setString(configString: string) {
        const kind = this.getKind();
        this.yaml.value!.value = [kind, configString].join(" ");
        this.configs = this.parseConfigs();
    }

    getRawConfigs(): string[] {
        return this.configs;
    }

    setRawConfigs(configs: string[]) {
        this.setConfigs(configs);
    }

    private parseConfigs(): string[] {
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
            if (array1[0] !== undefined) {
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

    getMandatoryArgument(index: number, escape: boolean = false) {
        // TODO
    }

    setMandatoryArgument(index: number, value: string, escape: boolean = false) {
        // TODO: Excape "\" and "\n" and ":"
    }

    getOption(optionName: string): string {
        const regex = new RegExp(`^${optionName}:`, "i");
        return this.configs.find(e => e.match(regex))?.replace(regex, "") || "";
    }

    setOption(optionName: string, optionValue: string, addToHead: boolean = false) {
        const regex = new RegExp(`^${optionName}:`, "i");

        // replace old option if exists
        if (this.configs.find(e => e.match(regex))) {
            this.configs = this.configs.splice(this.configs.findIndex(e => e.match(regex)), 1, `${optionName}:${optionValue}`);
        } else {
            if (addToHead) {
                this.configs.unshift(`${optionName}:${optionValue}`);
            } else {
                this.configs.push(`${optionName}:${optionValue}`);
            }
        }

        this.setConfigs(this.configs);
    }

    removeOption(optionName: string) {
        const regex = new RegExp(`^${optionName}:`, "i");
        this.setConfigs(this.configs.filter(e => !e.match(regex)));
    }

    hasArgument(argumentName: string) {
        const regex = new RegExp(`^${argumentName}$`, "i");
        return this.configs.some(e => e.match(regex));
    }

    setArgument(argumentName: string, addToHead: boolean = false) {
        if (!this.hasArgument(argumentName)) {
            if (addToHead) {
                this.configs.unshift(argumentName);
            } else {
                this.configs.push(argumentName);
            }
            this.setConfigs(this.configs);
        }
    }

    removeArgument(argumentName: string) {
        const regex = new RegExp(`^${argumentName}$`, "i");
        this.setConfigs(this.configs.filter(e => !e.match(regex)));
    }
}
