import L from "../i18n/i18n";
import { IOptionConf, IOptionConfig, OptionList } from "./optionModel";

// ========== Event ==========

export class Event implements IEvent {
    eventName: string;
    tagName: string;
    optionStr: string;
    options: IEventOption[] = [];

    constructor(eventName: string, tagName: string, optionStr: string) {
        this.eventName = eventName;
        this.tagName = tagName;
        this.optionStr = optionStr;
        this.parseOption(optionStr);
    }

    parseOption(optionStr: string): void {
        for (const [bqEventName, bqEvent] of Object.entries(EventList)) {
            if (bqEventName === this.eventName) {
                // bqEvent.options.array.forEach(element => {
                //     this.options.push({
                //         optionName: "",
                //         optionValue: ""
                //     });
                // });
            }
        }
    }
    
}

interface IEvent {
    eventName: string,
    tagName: string,
    optionStr: string,
    options: IEventOption[],
    parseOption(optionStr: string): void
}


// Method to parse event options
export function parseOption(optionStr: string) {
    // ...
}

interface IEventOption {
    optionName: string,
    optionValue: string,
}

// ========== Event List ==========

interface IEventConfigList {
    [eventName: string]: IEventConfig
}

interface IEventConfig {
    eventName: string,
    eventDescription: string,
    options: IOptionConfig[] // options is an ordered list
}

// The BetonQuest's Event List
export const EventList : IEventConfigList = {
    "cancel": {
        eventName: L("betonquest.event.cancel.name"),
        eventDescription: L("betonquest.event.cancel.description"),
        options: [
            {
                ...OptionList.cancelerIdentifier,
                isRequired: true,
                tagDescription: L("betonquest.option.cancelerIdentifier.description.event"),
            },
        ],
    },
    "teleport": {
        eventName: L("betonquest.event.list.teleport.name"),
        eventDescription: L("betonquest.event.list.teleport.description"),
        options: [
            {
                ...OptionList.cancelerIdentifier,
                isRequired: true,
                tagDescription: L("betonquest.option.location.description.event"),
            }
        ]
    }
};


// ========== How to draw UI? ==========
for (const [bqEventName, bqEvent] of Object.entries(EventList)) {
    // the name of "event" is "bqEventName"
    // render(<div>{bqEventName}</div>) ...
    
    bqEvent.options.forEach(element => {
        if (element.isRequired) {
            // check user input ...
        }
    });
}

//  ========== How to create a event? (e.g. "teleport event") ==========
// let myTpEvent : IEvent = {

// }




// ========= below are drafts, please ignore ================

// interface cancelEvent {
//     availableOptions: {
//         "cancelerIdentifier": {
//             value: string,
//             setCancelerIdentifier: Function,
//         }
//     }
//     option: string,
//     outputOption: Function
// }

// const TitleOption = {
//     value: "",
//     setCancelerIdentifier: function(value: string) {
//         this.value = value;
//     }
// }

// interface canEvent : cancelEvent = {
//     availableOptions: {
//         cancelerIdentifier: TitleOption,
//     },
//     option: "",
//     outputOption: function() {
//         this.availableOptions.entries();
//         // ...
//         return this.option;
//     }
// }

// let myBook : canEvent{}

// "titlea authorb date13246"

// // ================= method 0 ======================

// interface IBQEvent {
//     [key: string]: any,
// };

// interface BQEventTag extends IBQEvent {
//     tagName: string,
// };

// let myTag : BQEventTag = {
//     tagName: "simple_tag",
// };

// const EventList : {[bqEvent: string]: IBQEvent} = {
    
// };

// ================= method 1 ======================

// // Interface for Event
// export interface IBQEvent {
//     type: string, // e.g. "tag"
//     description: string, // description of the option
//     options: IEventOption[],
// };

// interface IEventOption {
//     kind: string, // "string" "number" "boolean" "location" "minecraft_block" "items"
//     must: boolean,
// };

// export const events: IBQEvent[] = [
//     {
//         type: "cancel",
//         description: "",
//         options: [
//             {
//                 kind: "questName",
//                 must: true
//             },
//         ]
//     },
//     {
//         type: "tag",
//         description: "",
//         options: [
//             {
//                 kind: "tagName",
//                 must: true
//             },
//         ]
//     },
// ];

// ================= method 2 ======================

// // Interface for Event
// export interface IBQEvent<T> {
//     // type: string, // e.g. "tag"
//     options: T,
// };

// type Student = IBQEvent<[firstName:TString, age?:TNumber]>;

// var st : Student = {
//     options: [
//         "Sam",
//         16
//     ]
// };

// interface IEventOption<T> {
//     // kind: string, // "string" "number" "boolean" "location" "minecraft_block" "items"
//     // must: boolean,
//     value: T,
// };

// type TString = string;
// type TNumber = number;
// type TLocation = string;

// var str : TString = "str";

