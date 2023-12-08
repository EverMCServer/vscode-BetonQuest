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
type MandatoryArgumentsPattern = ('string' | 'int' | 'float' | 'string[,]' | 'string[|]' | '*')[];

type MandatoryArguments = (string | number | string[])[];

/**
 * Optional arguments' pattern
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * null - argument only, no value
 */
type OptionalArgumentsPattern = Map<string, 'string' | 'int' | 'float' | 'string[,]' | 'boolean'>;

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

export type ListElementType = 'events' | 'conditions' | 'objectives' | 'conversations' | 'items' | 'unknown';

export default class ListElement {
    private yaml: Pair<Scalar<string>, Scalar<string>>;

    private pattern: ArgumentsPattern = {
        mandatory: ['*'],
    };

    private arguments: Arguments;

    constructor(pair: Pair<Scalar<string>, Scalar<string>>) {
        this.yaml = pair;

        // init arguments
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

    getArgumentString(): string {
        const cont = this.yaml.value?.value.split(" ");
        if (cont && cont.length) {
            if (cont.length > 1) {
                return cont.slice(1).join(" ");
            }
        }
        return "";
    }

    setArgumentString(argumentString: string) {
        const kind = this.getKind();
        if (argumentString.length) {
            this.yaml.value!.value = [kind, argumentString].join(" ");  
        } else {
            this.yaml.value!.value = kind;
        }

        // Update parsed Arguments
        this.parseArguments(this.pattern);
    }

    // Parse Arguments
    parseArguments(pattern?: ArgumentsPattern): Arguments {
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
        
        const args: Arguments = {
            mandatory: [],
        };

        console.log("debug");

        // Parse mandatory arguments
        for(let i = 0; i < pattern.mandatory.length; i++) {
            if (pattern.mandatory[i] === 'string') {
                args.mandatory[i] = argStrs[i];
            } else if (pattern.mandatory[i] === 'int') {
                args.mandatory[i] = parseInt(argStrs[i]);
            } else if (pattern.mandatory[i] === 'float') {
                args.mandatory[i] = parseFloat(argStrs[i]);
            } else if (pattern.mandatory[i] === 'string[,]') {
                args.mandatory[i] = argStrs[i].split(",");
            } else if (pattern.mandatory[i] === 'string[|]') {
                args.mandatory[i] = argStrs[i].split("|");
            } else if (pattern.mandatory[i] === '*') {
                args.mandatory[i] = argStrs.slice(i).join(" ");
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
                        } else if (value ==='string[,]') {
                            optionalArguments.set(k, argStr.split(":")[1].split(","));
                        } else if (value === 'boolean') {
                            optionalArguments.set(k, true);
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
                args.optional = optionalArguments;
                args.optionalAtFirst = pattern.optionalAtFirst;
            }
        }

        return args;
    }
}
