import { Pair, Scalar } from "yaml";

/**
 * Mandatory arguments' type
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * string[|] - string array, separated by "|""
 * * string:number[,] - Items sepprated by ","
 * * \* - all string till the end, including spaces and optional arguments
 */
type MandatoryArgumentType = (
    'string' |
    'int' |
    'float' |
    'string[,]' |
    'string[|]' |
    'string[^]' |
    '[string:number?][,]' |
    '*' |
    'variable'
);

export type MandatoryArgumentDataType =
    string |
    number |
    string[] |
    [string, number?][]
    ;
type MandatoryArguments = Array<MandatoryArgument>;

/**
 * Optional arguments' type
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * boolean - argument only, no value
 * * string:number[,] - Items sepprated by ","
 */
type OptionalArgumentType = (
    'string' |
    'int' |
    'float' |
    'string[,]' |
    'boolean' |
    // '[string:number][,]' |
    '[string:number?][,]' |
    'variable'
);

export type OptionalArgumentDataType =
    string |
    number |
    string[] |
    boolean |
    // [string, number][] |
    [string, number?][] |
    undefined
    ;
type OptionalArguments = Map<string, OptionalArgument>;

export type ArgumentsPatternMandatory = {
    name: string,
    type: MandatoryArgumentType,
    defaultValue: MandatoryArgumentDataType,
    escapeCharacters?: string[],
    jsx?: (props: any) => React.ReactNode,
    tooltip?: string,
    placeholder?: string | string[],
    config?: any,
    key?: string
};

export type ArgumentsPatternOptional = {
    name: string,
    key: string,
    type: OptionalArgumentType,
    escapeCharacters?: string[],
    jsx?: (props: any) => React.ReactNode,
    tooltip?: string,
    placeholder?: string | string[],
    config?: any
};

export type ArgumentsPattern = {
    mandatory: ArgumentsPatternMandatory[],
    optional?: ArgumentsPatternOptional[],
    optionalAtFirst?: boolean,
    keepWhitespaces?: boolean, // Do not split by whitespaces. Used by "chat", "command", "sudo", "opsudo", "notify" etc.
};

class Argument<T = MandatoryArgumentType | OptionalArgumentType, V = MandatoryArgumentDataType | OptionalArgumentDataType> {
    private value: V;
    private type: T;

    constructor(type: T, value: V) {
        this.type = type;
        this.value = value;
    }

    get() {
        return [this.value, this.type];
    }

    set(type: T, value: V) {
        this.type = type;
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    setValue(value: V) {
        this.value = value;
    }

    getType() {
        return this.type;
    }

    setType(type: T) {
        this.type = type;
    }
}

export class MandatoryArgument extends Argument<MandatoryArgumentType, MandatoryArgumentDataType> { }

export class OptionalArgument extends Argument<OptionalArgumentType, OptionalArgumentDataType> { }

export default class Arguments {
    private yaml: Pair<Scalar<string>, Scalar<string>>;

    // Pattern
    private pattern: ArgumentsPattern;

    // Arguments
    private mandatory: MandatoryArguments = [];
    private optional: OptionalArguments = new Map();

    constructor(
        pair: Pair<Scalar<string>, Scalar<string>>,
        pattern: ArgumentsPattern = { mandatory: [{ name: 'unspecified', type: '*', defaultValue: '' }] }
    ) {
        this.yaml = pair;
        this.pattern = pattern;

        this.parse();
    }

    toString(): string {
        return this.marshalArguments();
    }

    getMandatoryArgument(index: number) {
        return this.mandatory[index];
    }

    getOptionalArgument(key: string) {
        return this.optional?.get(key);
    }

    setMandatoryArgument(index: number, value: MandatoryArgumentDataType, type?: MandatoryArgumentType) {
        this.getMandatoryArgument(index).setValue(value);
        if (type) {
            this.getMandatoryArgument(index).setType(type);
        }

        // Update YAML
        this.updateYaml();
    }

    setOptionalArgument(name: string, value: OptionalArgumentDataType, type: OptionalArgumentType = 'string') {
        this.getOptionalArgument(name)?.setValue(value) || this.optional?.set(name, new OptionalArgument(type, value));

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

        // Split arguments
        let argStrs: string[] = [];
        // if (pattern.keepWhitespaces && (!pattern.optional || !pattern.optional.length)) {
        //     // Keep the whole arguments without spliting
        //     argStrs = [this.getArgumentString()];
        // } else {
        // Split arguments by whitespaces, with respect to quotes ("")
        const regex = /(?:\"[^\"]*?\"|\'[^\']*?\')\s*|\S+\s*/g; // keep quotes and whitespaces
        // const regex = /((?:\"[^\"]*?\"|\'[^\']*?\'))|(\S+)/g; // keep quotes
        // const regex = /(?:\"([^\"]*?)\"|\'([^\']*?)\')|(\S+)/g; // without quotes or whitespaces
        let array1: RegExpExecArray | null;
        while ((array1 = regex.exec(this.getArgumentString())) !== null) {
            // with quotes
            let matched = array1[0];
            argStrs.push(matched);

            // // without quotes
            // if (array1[1] !== undefined) {
            //     argStrs.push(array1[1]);
            // } else if (array1[2]!== undefined) {
            //     argStrs.push(array1[2]);
            // } else if (array1[3]!== undefined) {
            //     argStrs.push(array1[3]);
            // }
        }

        // Keep whitespaces only for the mandatory part. e.g. "notify", "log"
        if (pattern.keepWhitespaces) {
            let newArgStrs = [this.getArgumentString()];
            if (pattern.optional && pattern.optional.length) {
                // With optional args
                if (pattern!.optionalAtFirst) {
                    argStrs.every((v, i) => {
                        if (/(?<!\\):/g.test(v)) {
                            newArgStrs = [
                                ...argStrs.slice(0, i + pattern!.mandatory.length).map(value => value.replace(/\s$/, "")),
                                argStrs.slice(i + pattern!.mandatory.length).join('')
                            ];
                            return true;
                        }
                        return false;
                    });
                } else {
                    argStrs.some((v, i) => {
                        if (/(?<!\\):/g.test(v)) {
                            newArgStrs = [
                                ...argStrs.slice(0, pattern!.mandatory.length - 1).map(value => value.replace(/\s$/, "")),
                                argStrs.slice(pattern!.mandatory.length - 1, i).join('').replace(/\s$/, ""),
                                ...argStrs.slice(i).map(value => value.replace(/\s$/, ""))
                            ];
                            return true;
                        }
                        return false;
                    });
                }
            } else if (pattern.mandatory.length > 1) {
                // No optional arg, only mandatory
                newArgStrs = [
                    ...argStrs.slice(0, pattern.mandatory.length - 1).map(value => value.replace(/\s$/, "")),
                    argStrs.slice(pattern.mandatory.length - 1).join('')
                ];
            }
            argStrs = newArgStrs;
        } else {
            // remove the tailing seprator whitespace, if any
            argStrs = argStrs.map(value => value.replace(/\s$/, ""));
        }
        // }

        console.log("debug");

        // Prepare default mandatory values
        for (let i = 0; i < pattern.mandatory.length; i++) {
            this.mandatory[i] = new MandatoryArgument(pattern.mandatory[i].type, pattern.mandatory[i].defaultValue);
        }

        // Parse mandatory arguments
        let iFrom = 0;
        let iTo = pattern.mandatory.length;
        if (pattern.optionalAtFirst) {
            iFrom = argStrs.length - pattern.mandatory.length;
            iTo = argStrs.length;
        }
        const argStrsMandatory = argStrs.slice(iFrom, iTo);
        for (let i = 0; i < argStrsMandatory.length; i++) {
            const pat = pattern.mandatory[i];
            let argStr = argStrsMandatory[i];

            // With key
            if (pat.key) {
                argStr = argStr.split(/(?<!\\):/g).slice(1).join(":");
            }

            // Check if variable and parse it
            const variableArray = /^%(.*)%$/m.exec(argStr);
            if (variableArray && variableArray[0]) {
                this.mandatory[i].setType('variable');
                this.mandatory[i].setValue(variableArray[1]);
                continue;
            }

            // Un-Escape special characters
            const escapeCharacters = pat.escapeCharacters ? pat.escapeCharacters : [];

            // Set value by type
            if (pat.type === 'string') {
                this.mandatory[i].setValue(this.unescapeCharacters(escapeCharacters, argStr ? argStr : pat.defaultValue as string));
            } else if (pat.type === 'int') {
                this.mandatory[i].setValue(argStr ? parseInt(argStr) : pat.defaultValue);
            } else if (pat.type === 'float') {
                this.mandatory[i].setValue(argStr ? parseFloat(argStr) : pat.defaultValue);
            } else if (pat.type === 'string[,]') {
                this.mandatory[i].setValue(argStr?.split(/(?<!\\),/g)
                    .map(v => this.unescapeCharacters([...escapeCharacters, ','], v))
                    || pat.defaultValue);
            } else if (pat.type === 'string[|]') {
                this.mandatory[i].setValue(argStr?.split(/(?<!\\)\|/g)
                    .map(v => this.unescapeCharacters([...escapeCharacters, '|'], v))
                    || pat.defaultValue);
            } else if (pat.type === 'string[^]') {
                this.mandatory[i].setValue(argStr?.replace(/^\^/, "").split(/(?<!\\)\s?\^/g)
                    .map(v => this.unescapeCharacters([...escapeCharacters, '^'], v))
                    || pat.defaultValue);
            } else if (pat.type === '[string:number?][,]') {
                let parseError = false;
                const parsedArg: [string, number?][] = argStr?.split(/(?<!\\),/g).map(v => {
                    const arg = /(.*?)(?<!\\):?(\d*)$/.exec(v);
                    if (arg === null) {
                        parseError = true;
                        return ["", undefined];
                    }
                    return [this.unescapeCharacters([...escapeCharacters, ',', ':'], arg[1]), arg[2].length ? parseInt(arg[2]) : undefined];
                }) || pat.defaultValue;
                this.mandatory[i].setValue(parseError ? pat.defaultValue : parsedArg);
            } else if (pat.type === '*') {
                this.mandatory[i].setValue(argStrsMandatory.slice(i)
                    .map(v => this.unescapeCharacters(escapeCharacters, v))
                    .join(" ") || pat.defaultValue);
                break;
            }
        }

        // Parse optional arguments
        if (pattern.optional
            && pattern.optional.length > 0
            // && !(!pattern.optionalAtFirst && pattern.mandatory.some(v => v.type === '*')) // Skip when mandatory pattern is "*"
        ) {
            const optionalArguments: OptionalArguments = new Map();
            let iFrom = 0;
            let iTo = argStrs.length;
            if (pattern.optionalAtFirst) {
                iTo = argStrs.length - pattern.mandatory.length;
            } else {
                iFrom = pattern.mandatory.length;
            }

            pattern.optional.forEach(pat => {
                for (let i = iFrom; i < iTo; i++) {
                    let argStr = argStrs[i];

                    // Un-Escape special characters
                    const escapeCharacters = pat.escapeCharacters ? pat.escapeCharacters : [];

                    // Set value by type
                    const argStrSplit = argStr.split(/(?<!\\):/);
                    const argStrValue = argStrSplit.slice(1).join(":");
                    if (pat.key === argStrSplit[0]) {
                        // Set value
                        optionalArguments.set(pat.key, new OptionalArgument(pat.type, argStrValue));

                        const optionalArgument = optionalArguments.get(pat.key)!;

                        // Check if variable and parse it
                        const variableArray = /^%(.*)%$/m.exec(argStrValue);
                        if (variableArray && variableArray[0]) {
                            optionalArgument.setType('variable');
                            optionalArgument.setValue(variableArray[1]);
                            break;
                        }

                        // Parse value
                        if (pat.type === 'int') {
                            optionalArgument.setValue(parseInt(argStrValue));
                        } else if (pat.type === 'float') {
                            optionalArgument.setValue(parseFloat(argStrValue));
                        } else if (pat.type === 'string[,]') {
                            optionalArgument.setValue(argStrValue.split(/(?<!\\),/g)
                                .map(v => this.unescapeCharacters([...escapeCharacters, ','], v)));
                        } else if (pat.type === 'boolean') {
                            optionalArgument.setValue(true);
                        } else if (pat.type === '[string:number?][,]') {
                            let parseError = false;
                            const parsedArg: [string, number?][] = argStrValue?.split(/(?<!\\),/g).map(v => {
                                const arg = /(.*?)(?<!\\):?(\d*)$/.exec(v);
                                if (arg === null) {
                                    parseError = true;
                                    return ["", undefined];
                                }
                                return [this.unescapeCharacters([...escapeCharacters, ',', ':'], arg[1]), arg[2].length ? parseInt(arg[2]) : undefined];
                            });
                            optionalArgument.setValue(parseError ? [] : parsedArg);
                        } else { // if (value.pattern === 'string')
                            optionalArgument.setValue(this.unescapeCharacters([...escapeCharacters], argStrValue));
                        }
                        break;
                    } else {
                        // Remove value
                        optionalArguments.delete(pat.key);
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

        const argStr = this.marshalArguments();
        if (argStr.length > 0) {
            this.yaml.value.value = this.getKind() + " " + this.marshalArguments();
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
    private marshalArguments(): string {
        // Convert mandatory arguments to string
        let mandatoryStr = '';
        if (this.pattern.mandatory.length) {
            mandatoryStr = this.marshalMandatoryArguments();
        }

        // Convert optional arguments to string
        let optionalStr = '';
        if (this.pattern.optional?.length) {
            optionalStr = this.marshalOptionalArguments();
        }

        if (this.pattern.mandatory.length) {
            // Concat mandatory and optional arguments, then return it
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

        // No mandatory pattern defined, just return the optional parts
        return optionalStr;
    }

    // Convert mandatory arguments to string
    private marshalMandatoryArguments(): string {
        const mandatoryStrs: string[] = [];

        // Set value by type
        for (let i = 0; i < this.pattern.mandatory.length; i++) {
            let element = "";
            const pat = this.pattern.mandatory[i];
            let value = this.mandatory[i].getValue() || pat.defaultValue;

            // With key
            if (pat.key) {
                element = pat.key + ":";
            }

            // Escape special characters
            const escapeCharacters = pat.escapeCharacters ? pat.escapeCharacters : [];

            // Set value by type
            if (pat.type === 'variable') {
                element += '%' + value + '%';
            } else if (pat.type === 'int') {
                element += (value as number).toString();
            } else if (pat.type === 'float') {
                element += (value as number).toString();
            } else if (pat.type === 'string[,]') {
                element += (value as string[])
                    .map(str => this.escapeCharacters([...escapeCharacters, ','], str))
                    .join(",");
            } else if (pat.type === 'string[|]') {
                element += (value as string[])
                    .map(str => this.escapeCharacters([...escapeCharacters, '|'], str))
                    .join("|");
            } else if (pat.type === 'string[^]') {
                element += "^" + (value as string[])
                    .map(str => this.escapeCharacters([...escapeCharacters, '^'], str))
                    .join(" ^");
            } else if (pat.type === '[string:number?][,]') {
                element += (value as [string, number?][])
                    .map(([s, n]) => {
                        s = this.escapeCharacters([...escapeCharacters, ',', ':'], s);
                        return n !== undefined ? `${s}:${n}` : s;
                    })
                    .join(",");
            } else { // if (type === 'string' || '*')
                element += this.escapeCharacters(escapeCharacters, value as string);
            }

            mandatoryStrs.push(element);
        }

        return mandatoryStrs.join(" ");
    }

    // Convert optional arguments to string
    private marshalOptionalArguments(): string {
        const optionalStrs: string[] = [];
        this.pattern.optional?.forEach(pat => {
            const value = this.optional?.get(pat.key)?.getValue();

            // Escape special characters
            const escapeCharacters = pat.escapeCharacters ? pat.escapeCharacters : [];

            // Set value by type
            if (value === undefined) {
            } else if (value === null) {
                optionalStrs.push(`${pat.key}`);
            } else {
                if (pat.type === 'variable') {
                    optionalStrs.push(`${pat.key}:%${value}%`);
                } else if (pat.type === 'int') {
                    optionalStrs.push(`${pat.key}:${(value as number).toString()}`);
                } else if (pat.type === 'float') {
                    optionalStrs.push(`${pat.key}:${(value as number).toString()}`);
                } else if (pat.type === 'string[,]') {
                    const valueArray = value as string[];
                    if (valueArray.length > 1 || valueArray[0].length > 0) {
                        optionalStrs.push(`${pat.key}:${valueArray
                            .map(v => this.escapeCharacters([...escapeCharacters, ','], v))
                            .join(",")}`);
                    }
                } else if (pat.type === 'boolean') {
                    if (value) {
                        optionalStrs.push(`${pat.key}`);
                    }
                } else if (pat.type === '[string:number?][,]') {
                    optionalStrs.push(`${pat.key}:${(value as [string, number?][])
                        .map(([s, n]) => {
                            s = this.escapeCharacters([...escapeCharacters, ',', ':'], s);
                            return n !== undefined ? `${s}:${n}` : s;
                        })
                        .join(",")
                        }`);
                } else { // if (type === 'string')
                    const valueStr = value as string;
                    if (valueStr.length > 0) {
                        optionalStrs.push(`${pat.key}:${this.escapeCharacters(escapeCharacters, valueStr)}`);
                    }
                }
            }
        });

        return optionalStrs.join(' ');
    }

    private unescapeCharacters(characters: string[], str: string): string {
        characters.forEach(c => {
            if (!c.length) {
                return;
            }
            let from = `\\\\${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`;
            let to = c;
            // Handle special escapes
            if (c === ' ') {
                str = str.replace(new RegExp('(?<!\\\\)_', 'g'), to);
                str = str.replace(new RegExp('\\\\_', 'g'), '_'); // unescape "_" it self
            } else if (c === '\n') {
                str = str.replace(new RegExp('(?<!\\\\)\\\\n', 'g'), to);
                str = str.replace(new RegExp(`\\\\\\\\n`, 'g'), '\\n'); // escape "\\n" it self
            } else {
                // Normal unescape
                str = str.replace(new RegExp(from, 'g'), to);
            }
        });
        return str;
    }

    private escapeCharacters(characters: string[], str: string): string {
        characters.forEach(c => {
            if (!c.length) {
                return;
            }
            let from = c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            let to = `\\${c}`;
            // Handle special escapes
            if (c === ' ') {
                to = '_';
                str = str.replace(new RegExp(to, 'g'), `\\${to}`); // escape "_" it self
            } else if (c === '\n') {
                to = '\\n';
                str = str.replace(new RegExp(`\\${to}`, 'g'), `\\${to}`); // escape "\\n" it self
            }
            // Normal escape
            str = str.replace(new RegExp(from, 'g'), to);
        });
        return str;
    }

};
