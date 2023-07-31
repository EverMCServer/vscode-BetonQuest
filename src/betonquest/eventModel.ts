import L from "../i18n/i18n";
import { IOptionConfig, OptionList } from "./optionModel";

// ========== Event ==========

export class Event implements IEvent {
    // The kind of an Event, e.g. "teleport". This is the "tag name" of the Event.
    kind: string;

    // The key of an Event. It is the name of a single Event from events.yml.
    key: string;

    // The string value of an Event.
    optionStr: string;

    // Parsed value of an Event.
    options: IEventOption[] = [];

    constructor(eventKind: string, key: string, optionStr: string) {
        this.kind = eventKind;
        this.key = key;
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
    kind: string,
    key: string,
    optionStr: string,
    options: IEventOption[],
    parseOption(optionStr: string): void
}


// Method to parse event options
export function parseOption(optionStr: string) {
    // ...
}

interface IEventOption {
    kind: string,
    value: string,
}

// ========== Event List ==========

interface IEventConfigList {
    [eventName: string]: IEventConfig
}

interface IEventConfig {
    // Name of an Event, for display only. e.g. "Location".
    name: string,

    // Description of the Event, e.g. "Teleport a player to somewhere."
    description: string,

    // All option availabled for the Event. Options should be an ordered list.
    options: IOptionConfig[]
}

// The BetonQuest's Events List
export const EventsList : IEventConfigList = {
    "cancel": {
        name: L("betonquest.event.cancel.name"),
        description: L("betonquest.event.cancel.description"),
        options: [
            {
                ...OptionList.cancelerIdentifier,
                isRequired: true,
                description: L("betonquest.option.cancelerIdentifier.description.event"),
            },
        ],
    },
    "teleport": {
        name: L("betonquest.event.list.teleport.name"),
        description: L("betonquest.event.list.teleport.description"),
        options: [
            {
                ...OptionList.cancelerIdentifier,
                isRequired: true,
                description: L("betonquest.option.location.description.event"),
            }
        ]
    }
};


// ========== How to draw UI? ==========
for (const [bqEventName, bqEvent] of Object.entries(EventsList)) {
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

