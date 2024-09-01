import { Pair, Scalar } from "yaml";

/**
 * Argument Type
 */
export enum ArgumentType {

    /** unknown */
    unknown = "unknown",

    /** Unspecified string */
    string = "string",

    /** Unspecified string list */
    stringList = "stringList",

    /** Interger number */
    interger = "interger",

    /** Floating point number */
    float = "float",

    /** Conversation Name / ID without cross-conversation path */
    conversationID = "conversationID",

    /** Condiiton ID */
    conditionID = "conditionID",

    /** Condiiton ID List */
    conditionIdList = "conditionIdList",

    /** Event ID */
    eventID = "eventID",

    /** Event ID List */
    eventIdList = "eventIdList",

    /** Objective ID */
    objectiveID = "objectiveID",

    /** Objective ID List */
    objectiveIdList = "objectiveIdList",

    /** BetonQuest's Item ID */
    itemID = "itemID",

    /** Multiple BetonQuest's Item ID seprated by `,` with amount */
    itemIdListWithAmount = "itemIdListWithAmount",

    /** Tag ID */
    tagID = "tagID",

    /** Global Point ID */
    globalTagID = "globalTagID",

    /** Point ID */
    pointID = "pointID",

    /** Global Point ID */
    globalPointID = "globalPointID",

    /** Journal ID */
    journalID = "journalID",

    /** Stage Objective ID */
    stageObjectiveID = "stageObjectiveID",

    /** Stage name */
    stageName = "stageName",

    /** Complete Instructions seprated by `^` */
    instructionSet = "instructionSet",

    /** Variable Name */
    variable = "variable",

    /** Regular expression */
    regex = "regEx",

    /** Selection */
    selection = "selection",

    /** Constant value / string */
    constant = "constant",

    /** Location coordinate */
    location = "location",

    /** Entity / Mob name */
    entityName = "entityName",

    /** Entity / Mob mark */
    entityMark = "entityMark",

    /** Language ID list */
    languageIdList = "languageIdList",

    /** Minecraft's Advancement */
    advancement = "advancement",

    /** Minecraft's Biome */
    biome = "biome",

    /** Minecraft's Block ID */
    blockID = "blockID",

    /** Minecraft's Entity */
    entity = "entity",

    /** Minecraft's Entities seprted by commas `,` */
    entityList = "entityList",

    /** Minecraft's Entities with amount devided by `:`, e.g. CREEPER:2 */
    entityListWithAmount = "entityListWithAmount",

    /** Minecraft's Potion Effect */
    potionEffect = "potionEffect",

    /** Any string */
    any = "any",
}
// type ArgumentType = (
//     'string'
// );

/**
 * Mandatory arguments' value format
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * string[|] - string array, separated by "|"
 * * string[^] - string array, separated by "^"
 * * [string:number?][,] - Items / entities sepprated by ","
 * * \* - all string till the end, including spaces and optional arguments
 * * 'variable' - variable quoted by %%
 */
type MandatoryArgumentFormat = (
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

export type MandatoryArgumentDataFormat =
    string |
    number |
    string[] |
    [string, number?][]
    ;
type MandatoryArguments = Array<MandatoryArgument>;

/**
 * Optional arguments' value format
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * boolean - argument only, no value
 * * [string:number?][,] - Items / entities sepprated by ","
 * * 'variable' - variable quoted by %%
 */
type OptionalArgumentFormat = (
    'string' |
    'int' |
    'float' |
    'string[,]' |
    'boolean' |
    // '[string:number][,]' |
    '[string:number?][,]' |
    'variable'
);

export type OptionalArgumentDataFormat =
    string |
    number |
    string[] |
    boolean |
    // [string, number][] |
    [string, number?][] |
    undefined
    ;
type OptionalArguments = Map<string, OptionalArgument>;

type ArgumentsPattern = {
    name: React.ReactNode,
    type: ArgumentType,
    escapeCharacters?: string[],
    jsx?: (props: any) => React.ReactNode,
    tooltip?: string,
    placeholder?: string | string[],
    config?: any,
    allowVariable?: boolean
};

export type ArgumentsPatternMandatory = ArgumentsPattern & {
    key?: string,
    format: MandatoryArgumentFormat,
    defaultValue: MandatoryArgumentDataFormat,
};

export type ArgumentsPatternOptional = ArgumentsPattern & {
    key: string,
    format: OptionalArgumentFormat,
};

export type ArgumentsPatterns = {
    mandatory: ArgumentsPatternMandatory[],
    optional?: ArgumentsPatternOptional[],
    optionalAtFirst?: boolean,
    keepWhitespaces?: boolean, // Do not split by whitespaces. Used by "chat", "command", "sudo", "opsudo", "notify" etc.
};

class Argument<F = MandatoryArgumentFormat | OptionalArgumentFormat, V = MandatoryArgumentDataFormat | OptionalArgumentDataFormat> {
    private value: V;
    private format: F;

    constructor(format: F, value: V) {
        this.format = format;
        this.value = value;
    }

    get() {
        return [this.value, this.format];
    }

    set(format: F, value: V) {
        this.format = format;
        this.value = value;
    }

    getValue() {
        return this.value;
    }

    setValue(value: V) {
        this.value = value;
    }

    getFormat() {
        return this.format;
    }

    setFormat(format: F) {
        this.format = format;
    }
}

export class MandatoryArgument extends Argument<MandatoryArgumentFormat, MandatoryArgumentDataFormat> { }

export class OptionalArgument extends Argument<OptionalArgumentFormat, OptionalArgumentDataFormat> { }

export abstract class ArgumentsAbstract {
    // Pattern
    protected pattern: ArgumentsPatterns;

    // Arguments
    protected mandatory: MandatoryArguments = [];
    protected optional: OptionalArguments = new Map();

    constructor(
        pattern: ArgumentsPatterns = { mandatory: [{ name: 'unspecified', type: ArgumentType.unknown, format: '*', defaultValue: '' }] }
    ) {
        this.pattern = pattern;
    }

    toString(): string {
        return this.marshalArguments();
    }

    getMandatoryArgument(index: number) {
        return this.mandatory[index];
    }

    getMandatoryArguments() {
        return this.mandatory;
    }

    getOptionalArgument(key: string) {
        return this.optional?.get(key);
    }

    getOptionalArguments() {
        return this.optional;
    }

    protected parse(pattern?: ArgumentsPatterns) {
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

        // console.log("debug");

        // Prepare default mandatory values
        for (let i = 0; i < pattern.mandatory.length; i++) {
            this.mandatory[i] = new MandatoryArgument(pattern.mandatory[i].format, pattern.mandatory[i].defaultValue);
        }

        // Parse mandatory arguments
        let iFrom = 0;
        const mandatoryUnKeyedLength = pattern.mandatory.filter(e => !e.key).length;
        let iTo = mandatoryUnKeyedLength;
        if (pattern.optionalAtFirst) {
            iTo = argStrs.length;
            iFrom = iTo - mandatoryUnKeyedLength;
        }
        const argStrsMandatoryUnKeyed = argStrs.slice(iFrom, iTo);
        for (let i = 0; i < pattern.mandatory.length; i++) {
            const pat = pattern.mandatory[i];

            let argStr = "";
            if (pat.key) {
                // With key
                argStrs.slice(mandatoryUnKeyedLength).some(str => {
                    const slice = str.split(/(?<!\\):/g);
                    if (slice[0] === pat.key) {
                        argStr = slice.slice(1).join(":");
                        return true;
                    }
                    return false;
                });
            } else {
                // Without key
                argStr = argStrsMandatoryUnKeyed[i];
            }

            // Check if variable and parse it
            const variableArray = /^%.*%$/m.exec(argStr);
            if (variableArray && variableArray[0]) {
                this.mandatory[i].setFormat('variable');
                this.mandatory[i].setValue(variableArray[0]);
                continue;
            }

            // Un-Escape special characters
            const escapeCharacters = pat.escapeCharacters ? pat.escapeCharacters : [];

            // Set value by format
            if (pat.format === 'string') {
                this.mandatory[i].setValue(this.unescapeCharacters(escapeCharacters, argStr ? argStr : pat.defaultValue as string));
            } else if (pat.format === 'int') {
                this.mandatory[i].setValue(argStr ? parseInt(argStr) : pat.defaultValue);
            } else if (pat.format === 'float') {
                this.mandatory[i].setValue(argStr ? parseFloat(argStr) : pat.defaultValue);
            } else if (pat.format === 'string[,]') {
                this.mandatory[i].setValue(argStr?.split(/(?<!\\),/g)
                    .map(v => this.unescapeCharacters([...escapeCharacters, ','], v))
                    || pat.defaultValue);
            } else if (pat.format === 'string[|]') {
                this.mandatory[i].setValue(argStr?.split(/(?<!\\)\|/g)
                    .map(v => this.unescapeCharacters([...escapeCharacters, '|'], v))
                    || pat.defaultValue);
            } else if (pat.format === 'string[^]') {
                this.mandatory[i].setValue(argStr?.replace(/^\^/, "").split(/(?<!\\)\s?\^/g)
                    .map(v => this.unescapeCharacters([...escapeCharacters, '^'], v))
                    || pat.defaultValue);
            } else if (pat.format === '[string:number?][,]') {
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
            } else if (pat.format === '*') {
                this.mandatory[i].setValue(argStrsMandatoryUnKeyed.slice(i)
                    .map(v => this.unescapeCharacters(escapeCharacters, v))
                    .join(" ") || pat.defaultValue);
                break;
            }
        }

        // Parse optional arguments
        if (pattern.optional
            && pattern.optional.length > 0
            // && !(!pattern.optionalAtFirst && pattern.mandatory.some(v => v.format === '*')) // Skip when mandatory pattern is "*"
        ) {
            const optionalArguments: OptionalArguments = new Map();
            let iFrom = 0;
            let iTo = argStrs.length;
            if (pattern.optionalAtFirst) {
                iTo -= mandatoryUnKeyedLength;
            } else {
                iFrom = mandatoryUnKeyedLength;
            }

            pattern.optional.forEach(pat => {
                for (let i = iFrom; i < iTo; i++) {
                    let argStr = argStrs[i];

                    // Un-Escape special characters
                    const escapeCharacters = pat.escapeCharacters ? pat.escapeCharacters : [];

                    // Set value by format
                    const argStrSplit = argStr.split(/(?<!\\):/);
                    const argStrValue = argStrSplit.slice(1).join(":");
                    if (pat.key === argStrSplit[0]) {
                        // Set value
                        optionalArguments.set(pat.key, new OptionalArgument(pat.format, argStrValue));

                        const optionalArgument = optionalArguments.get(pat.key)!;

                        // Check if variable and parse it
                        const variableArray = /^%.*%$/m.exec(argStrValue);
                        if (variableArray && variableArray[0]) {
                            optionalArgument.setFormat('variable');
                            optionalArgument.setValue(variableArray[0]);
                            break;
                        }

                        // Parse value
                        if (pat.format === 'int') {
                            optionalArgument.setValue(parseInt(argStrValue));
                        } else if (pat.format === 'float') {
                            optionalArgument.setValue(parseFloat(argStrValue));
                        } else if (pat.format === 'string[,]') {
                            optionalArgument.setValue(argStrValue.split(/(?<!\\),/g)
                                .map(v => this.unescapeCharacters([...escapeCharacters, ','], v)));
                        } else if (pat.format === 'boolean') {
                            optionalArgument.setValue(true);
                        } else if (pat.format === '[string:number?][,]') {
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
                        // Unknown key, remove it
                        optionalArguments.delete(pat.key);
                    }
                }
            });
            if (optionalArguments.size > 0) {
                this.optional = optionalArguments;
            }
        }
    }

    protected abstract getArgumentString(): string;

    // Convert mandatory and optional arguments to string
    protected marshalArguments(): string {
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

        // Set value by format
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

            // Set value by format
            if (pat.format === 'int') {
                element += (value as number).toString();
            } else if (pat.format === 'float') {
                element += (value as number).toString();
            } else if (pat.format === 'string[,]') {
                element += (value as string[])
                    .map(str => this.escapeCharacters([...escapeCharacters, ','], str))
                    .join(",");
            } else if (pat.format === 'string[|]') {
                element += (value as string[])
                    .map(str => this.escapeCharacters([...escapeCharacters, '|'], str))
                    .join("|");
            } else if (pat.format === 'string[^]') {
                element += "^" + (value as string[])
                    .map(str => this.escapeCharacters([...escapeCharacters, '^'], str))
                    .join(" ^");
            } else if (pat.format === '[string:number?][,]') {
                element += (value as [string, number?][])
                    .map(([s, n]) => {
                        s = this.escapeCharacters([...escapeCharacters, ',', ':'], s);
                        return n !== undefined ? `${s}:${n}` : s;
                    })
                    .join(",");
            } else if (pat.format === 'variable') {
                element += value as string;
            } else { // if (format === 'string' || '*')
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

            // Set value by format
            if (value === undefined) {
            } else if (value === null) {
                optionalStrs.push(`${pat.key}`);
            } else {
                if (pat.format === 'int') {
                    optionalStrs.push(`${pat.key}:${(value as number).toString()}`);
                } else if (pat.format === 'float') {
                    optionalStrs.push(`${pat.key}:${(value as number).toString()}`);
                } else if (pat.format === 'string[,]') {
                    const valueArray = value as string[];
                    if (valueArray.length > 1 || valueArray[0].length > 0) {
                        optionalStrs.push(`${pat.key}:${valueArray
                            .map(v => this.escapeCharacters([...escapeCharacters, ','], v))
                            .join(",")}`);
                    }
                } else if (pat.format === 'boolean') {
                    if (value) {
                        optionalStrs.push(`${pat.key}`);
                    }
                } else if (pat.format === '[string:number?][,]') {
                    optionalStrs.push(`${pat.key}:${(value as [string, number?][])
                        .map(([s, n]) => {
                            s = this.escapeCharacters([...escapeCharacters, ',', ':'], s);
                            return n !== undefined ? `${s}:${n}` : s;
                        })
                        .join(",")
                        }`);
                } else if (pat.format === 'variable') {
                    optionalStrs.push(`${pat.key}:${value}`);
                } else { // if (format === 'string' || 'variable')
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
}

export class ArgumentsString extends ArgumentsAbstract {
    private str: string;
    constructor(str: string, pattern: ArgumentsPatterns = { mandatory: [{ name: 'unspecified', type: ArgumentType.unknown, format: '*', defaultValue: '' }] }) {
        super(pattern);
        this.str = str;

        this.parse();
    }

    protected getArgumentString(): string {
        return this.str;
    }
}

export default class Arguments extends ArgumentsAbstract {
    private yaml: Pair<Scalar<string>, Scalar<string>>;

    constructor(
        pair: Pair<Scalar<string>, Scalar<string>>,
        pattern: ArgumentsPatterns = { mandatory: [{ name: 'unspecified', type: ArgumentType.unknown, format: '*', defaultValue: '' }] }
    ) {
        super(pattern);
        this.yaml = pair;

        this.parse();
    }

    setMandatoryArgument(index: number, value: MandatoryArgumentDataFormat, format?: MandatoryArgumentFormat) {
        this.getMandatoryArgument(index).setValue(value);
        if (format) {
            this.getMandatoryArgument(index).setFormat(format);
        }

        // Update YAML
        this.updateYaml();
    }

    setOptionalArgument(name: string, value: OptionalArgumentDataFormat, format: OptionalArgumentFormat = 'string') {
        this.getOptionalArgument(name)?.setValue(value) || this.optional?.set(name, new OptionalArgument(format, value));

        // Update YAML
        this.updateYaml();
    }

    // Get arguments string from YAML
    protected getArgumentString(): string {
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

};
