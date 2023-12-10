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
    '*')[];

class MandatoryArguments extends Array<string | number | string[]> {};

/**
 * Optional arguments' pattern
 * 
 * * string - string
 * * int - interger
 * * float - number with a decimal point
 * * string[,] - string array, separated by comma
 * * boolean - argument only, no value
 * * ItemName:number[,] - Items sepprated by ","
 */
type OptionalArgumentsPattern = Map<string,
    'string' |
    'int' |
    'float' |
    'string[,]' |
    'boolean' |
    'ItemName:number[,]'>;

class OptionalArguments extends Map<string, string | number | string[] | boolean | undefined> {};

type ArgumentsPattern = {
    mandatory: MandatoryArgumentsPattern,
    optional?: OptionalArgumentsPattern,
    optionalAtFirst?: boolean,
};

export class Arguments {
    private yaml: Pair<Scalar<string>, Scalar<string>>;

    // Pattern
    mandatoryPattern: MandatoryArgumentsPattern;
    optionalPattern?: OptionalArgumentsPattern;
    optionalAtFirst?: boolean;

    // Arguments
    mandatory: MandatoryArguments;
    optional?: OptionalArguments;

    constructor(
        pair: Pair<Scalar<string>, Scalar<string>>,
        pattern: ArgumentsPattern = { mandatory: ['*'] }
        ) {
        this.yaml = pair;
        this.mandatoryPattern = pattern.mandatory;
        this.optionalPattern = pattern.optional;
        this.optionalAtFirst = pattern.optionalAtFirst;

        this.mandatory = this.parseMandatory();
        this.optional = this.parseOptional();
    }

    private parseMandatory(mandatoryPattern?: MandatoryArgumentsPattern): MandatoryArguments {
        if (!mandatoryPattern) {
            mandatoryPattern = this.mandatoryPattern;
        } else {
            this.mandatoryPattern = mandatoryPattern;
        }

        // ...
        
        return [];
    }

    private parseOptional(optionalPattern?: OptionalArgumentsPattern, optionalAtFirst?: boolean): OptionalArguments | undefined {
        if (!optionalPattern) {
            optionalPattern = this.optionalPattern;
            optionalAtFirst = this.optionalAtFirst;
        } else {
            this.optionalPattern = optionalPattern;
            this.optionalAtFirst = optionalAtFirst;
        }

        if (!optionalPattern) {
            return undefined;
        }

        // ...
        
        return new Map();
    }


};
