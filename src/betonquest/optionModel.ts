import L from "../i18n/i18n";


export interface IOptionConfig extends IOptionConfigInfo {
    isRequired: boolean,
}

export interface IOptionConfigInfo {
    kind: string,
    name: string,
    description: string
}

interface IOptionList {
    [optionName: string]: IOptionConfigInfo
}

export const OptionList : IOptionList = {
    "example": {
        kind: "",
        name: L(""),
        description: L("")
    },
    "cancelerIdentifier" : {
        kind: "cancelerIdentifier",
        name: L("betonquest.option.cancelerIdentifier.name"),
        description: L("betonquest.option.cancelerIdentifier.description"),
    },
    "location": {
        kind: "location",
        name: L("betonquest.option.location.name"),
        description: L("betonquest.option.location.description")
    },
};

