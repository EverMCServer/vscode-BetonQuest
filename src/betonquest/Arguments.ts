import { Pair, Scalar } from "yaml";

/**
 * Mandatory arguments' pattern
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * string[|] - string array, separated by "|""
 * * string:number[,] - Items sepprated by ","
 * * \* - all string till the end, including spaces and optional arguments
 */
type MandatoryArgumentsPattern = (
    'string' |
    'int' |
    'float' |
    'string[,]' |
    'string[|]' |
    'string:number[,]' |
    '*'
)[];

type MandatoryArgumentType = string | number | string[] | [string, number][];
class MandatoryArguments extends Array<MandatoryArgumentType> { };

/**
 * Optional arguments' pattern
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * boolean - argument only, no value
 * * string:number[,] - Items sepprated by ","
 */
type OptionalArgumentsPattern = Map<string,
    'string' |
    'int' |
    'float' |
    'string[,]' |
    'boolean' |
    'string:number[,]'
>;

type OptionalArgumentType = string | number | string[] | boolean | [string, number][] | undefined;
class OptionalArguments extends Map<string, OptionalArgumentType> { };

export type ArgumentsPattern = {
    mandatory: MandatoryArgumentsPattern,
    optional?: OptionalArgumentsPattern,
    optionalAtFirst?: boolean,
};

export default class Arguments {
    private yaml: Pair<Scalar<string>, Scalar<string>>;

    // Pattern
    private pattern: ArgumentsPattern;

    // Arguments
    private mandatory: MandatoryArguments = [];
    private optional?: OptionalArguments;

    constructor(
        pair: Pair<Scalar<string>, Scalar<string>>,
        pattern: ArgumentsPattern = { mandatory: ['*'] }
    ) {
        this.yaml = pair;
        this.pattern = pattern;

        this.parse();
    }

    toString(): string {
        return this.unmarshalArguments();
    }

    getMandatoryArgument(index: number): MandatoryArgumentType {
        return this.mandatory[index];
    }

    getOptionalArgument(key: string): OptionalArgumentType {
        return this.optional?.get(key);
    }

    setMandatoryArgument(index: number, value: MandatoryArgumentType) {
        this.mandatory[index] = value;

        // Update YAML
        this.updateYaml();
    }

    setOptionalArgument(name: string, value: OptionalArgumentType) {
        if (!this.optional) {
            this.optional = new Map();
        }
        this.optional.set(name, value);

        // Update YAML
        this.updateYaml();
    }

    private parse(pattern?: ArgumentsPattern) {
        // Load pattern from this.pattern, if not provided
        if (!pattern) {
            pattern = this.pattern;
        } else {
            this.pattern = pattern;
        }

        // split arguments by whitespaces, with respect to quotes ("")
        const regex = /(?=[^\S]*)(?:(\"[^\"]*?\")|(\'[^\']*?\'))(?=[^\S]+|$)|(\S+)/g; // keep quotes
        // const regex = /(?=[^\S]*)(?:\"([^\"]*?)\"|\'([^\']*?)\')(?=[^\S]+|$)|(\S+)/g; // without quotes
        let array1: RegExpExecArray | null;
        let argStrs: string[] = [];
        while ((array1 = regex.exec(this.getArgumentString())) !== null) {
            // keep quotes
            if (array1[0] !== undefined) {
                argStrs.push(array1[0]);
            }

            // // without quotes
            // if (array1[1] !== undefined) {
            //     argStrs.push(array1[1]);
            // } else if (array1[2]!== undefined) {
            //     argStrs.push(array1[2]);
            // } else if (array1[3]!== undefined) {
            //     argStrs.push(array1[3]);
            // }
        }

        console.log("debug");

        // Parse mandatory arguments
        for (let i = 0; i < pattern.mandatory.length; i++) {
            if (pattern.mandatory[i] === 'string') {
                this.mandatory[i] = argStrs[i];
            } else if (pattern.mandatory[i] === 'int') {
                this.mandatory[i] = parseInt(argStrs[i]);
            } else if (pattern.mandatory[i] === 'float') {
                this.mandatory[i] = parseFloat(argStrs[i]);
            } else if (pattern.mandatory[i] === 'string[,]') {
                this.mandatory[i] = argStrs[i].split(",");
            } else if (pattern.mandatory[i] === 'string[|]') {
                this.mandatory[i] = argStrs[i].split("|");
            } else if (pattern.mandatory[i] === 'string:number[,]') {
                this.mandatory[i] = argStrs[i].split(",").map(v => {
                    const arg = v.split(":");
                    return [arg[0], parseInt(arg[1])] as [string, number];
                });
            } else if (pattern.mandatory[i] === '*') {
                this.mandatory[i] = argStrs.slice(i).join(" ");
                break;
            }
        }

        // Parse optional arguments
        if (pattern.optional && !pattern.mandatory.some(v => v === '*')) { // Skip when mandatory pattern is "*"
            const optionalArguments: OptionalArguments = new Map();
            pattern.optional.forEach((value, k) => {
                for (let i = 0; i < argStrs.length; i++) {
                    const argStr = argStrs[i];
                    if (argStr.startsWith(k)) {
                        if (value === 'int') {
                            optionalArguments.set(k, parseInt(argStr.split(":")[1]));
                        } else if (value === 'float') {
                            optionalArguments.set(k, parseFloat(argStr.split(":")[1]));
                        } else if (value === 'string[,]') {
                            optionalArguments.set(k, argStr.split(":")[1].split(","));
                        } else if (value === 'boolean') {
                            optionalArguments.set(k, true);
                        } else if (value === 'string:number[,]') {
                            this.mandatory[i] = argStrs[i].split(",").map(v => {
                                const arg = v.split(":");
                                return [arg[0], parseInt(arg[1])] as [string, number];
                            });
                        } else { // if (value === 'string')
                            optionalArguments.set(k, argStr.split(":")[1]);
                        }
                        break;
                    } else {
                        optionalArguments.set(k, undefined);
                    }
                }
            });
            if (optionalArguments.size > 0) {
                this.optional = optionalArguments;
            }
        }
    }

    // Get arguments string from YAML
    private getArgumentString(): string {
        const cont = this.yaml.value?.value.split(" ");
        if (cont && cont.length) {
            if (cont.length > 1) {
                return cont.slice(1).join(" ");
            }
        }
        return "";
    }

    // Set arguments to YAML
    private updateYaml() {
        if (!this.yaml.value) {
            this.yaml.value = new Scalar("");
        }

        const argStr = this.unmarshalArguments();
        if (argStr.length > 0) {
            this.yaml.value.value = this.getKind() + " " + this.unmarshalArguments();
        } else {
            this.yaml.value.value = this.getKind();
        }
    }
    private getKind(): string {
        const cont = this.yaml.value?.value.split(" ");
        if (cont && cont.length) {
            return cont[0];
        }
        return "";
    }

    // Convert mandatory and optional arguments to string
    private unmarshalArguments(): string {
        // Convert mandatory arguments to string
        const mandatoryStr = this.unmarshalMandatoryArguments();

        // Convert optional arguments to string
        const optionalStr = this.unmarshalOptionalArguments();

        // Concat mandatory and optional arguments
        let str = mandatoryStr;
        if (optionalStr.length > 0) {
            if (this.pattern.optionalAtFirst) {
                str = `${optionalStr} ${str}`;
            } else {
                str = `${str} ${optionalStr}`;
            }
        }

        return str;
    }

    // Convert mandatory arguments to string
    private unmarshalMandatoryArguments(): string {
        const mandatoryStrs: string[] = [];

        for (let i = 0; i < this.pattern.mandatory.length; i++) {
            let element = "";
            const type = this.pattern.mandatory[i];
            const value = this.mandatory[i];
            if (type === 'int') {
                element = (value as number).toString();
            } else if (type === 'float') {
                element = (value as number).toString();
            } else if (type === 'string[,]') {
                element = (value as string[]).join(",");
            } else if (type === 'string[|]') {
                element = (value as string[]).join("|");
            } else if (type === 'string:number[,]') {
                element = (value as [string, number][]).map(v => `${v[0]}:${v[1]}`).join(",");
            } else { // if (type === 'string' || '*')
                element = value as string;
            }

            mandatoryStrs.push(element);
        }

        return mandatoryStrs.join(" ");
    }

    // Convert optional arguments to string
    private unmarshalOptionalArguments(): string {
        const optionalStrs: string[] = [];
        this.pattern.optional?.forEach((type, key) => {
            const value = this.optional?.get(key);

            if (type === 'int') {
                optionalStrs.push(`${key}:${(value as number).toString()}`);
            } else if (type === 'float') {
                optionalStrs.push(`${key}:${(value as number).toString()}`);
            } else if (type === 'string[,]') {
                optionalStrs.push(`${key}:${(value as string[]).join(",")}`);
            } else if (type === 'boolean') {
                if (value) {
                    optionalStrs.push(`${key}`);
                }
            } else if (type === 'string:number[,]') {
                optionalStrs.push(`${key}:${(value as [string, number][]).map(v => `${v[0]}:${v[1]}`).join(",")}`);
            } else { // if (type === 'string')
                const valueStr = value as string;
                if (valueStr.length > 0) {
                    optionalStrs.push(`${key}:${valueStr}`);
                }
            }
        });

        return optionalStrs.join(' ');
    }

};
