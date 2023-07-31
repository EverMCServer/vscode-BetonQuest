import L from "../i18n/i18n";


export interface IOptionConfig extends IOptionConf {
    isRequired: boolean,
}

export interface IOptionConf {
    tag: string,
    tagName: string,
    tagDescription: string
}

interface IOptionList {
    [optionName: string]: IOptionConf
}

export const OptionList : IOptionList = {
    "example": {
        tag: "",
        tagName: L(""),
        tagDescription: L("")
    },
    "cancelerIdentifier" : {
        tag: "cancelerIdentifier",
        tagName: L("betonquest.option.cancelerIdentifier.name"),
        tagDescription: L("betonquest.option.cancelerIdentifier.description"),
    },
    "location": {
        tag: "location",
        tagName: L("betonquest.option.location.name"),
        tagDescription: L("betonquest.option.location.description")
    },
};

