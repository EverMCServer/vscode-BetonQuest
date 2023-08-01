import L from "../i18n/i18n";


export interface IOptionConfig extends IOptionConfigInfo {
    // Mark the option be required or optional (could be omited).
    // Note that not all option are required in all Events / Conditions / Objectives,
    // so this value sould be set in their corresponding List.
    isRequired: boolean,
}

export interface IOptionConfigInfo {
    // Kind of a config option, e.g. "location".
    kind: string,

    // Name of a config option, for display only. e.g. "Location".
    name: string,

    // Description of the option, e.g. "Teleport destination."
    description: string

    // Parser for GUI object input
    parse(input: any): string
}

interface IOptionList {
    [optionName: string]: IOptionConfigInfo
}

export const optionList : IOptionList = {
    "example": {
        kind: "",
        name: L(""),
        description: L(""),
        parse: stringParser,
    },
    "cancelerIdentifier" : {
        kind: "cancelerIdentifier",
        name: L("betonquest.option.cancelerIdentifier.name"),
        description: L("betonquest.option.cancelerIdentifier.description"),
        parse: stringParser,
    },
    "location": {
        kind: "location",
        name: L("betonquest.option.location.name"),
        description: L("betonquest.option.location.description"),
        parse: locationParser,
    },
};

function stringParser(input: string): string {
    return input;
}

function locationParser(input: any): string {
    // TODO
    return input.toString();
}
