import React from "react";

import Event from "../../../../../betonquest/Event";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";
import KillMob from "./EventsEditor/KillMob";

export default function (props: ListElementEditorProps<Event>) {

    // All kinds
    const kinds: Kind<Event>[] = [
        {
            value: 'unknown',
            display: 'Unknown',
            editor: Default,
            argumentsPattern: {
                mandatory: ['*'],
                mandatoryDefault: [
                    ""
                ]
            }
        },
        {
            value: 'give',
            display: 'Give',
            editor: Give,
            // e.g. emerald:5,emerald_block:9,important_sign notify backpack
            argumentsPattern: {
                mandatory: ['[string:number][,]'],
                mandatoryDefault: [
                    [["emerald", 5], ["emerald_block", 9], ["important_sign", 1]]
                ],
                optional: new Map([
                    ['notify', 'boolean'],
                    ['backpack', 'boolean']
                ])
            }
        },
        {
            value: 'killmob',
            display: 'Kill Mob',
            editor: KillMob,
            // e.g. killmob ZOMBIE 100;200;300;world 40 name:Bolec marked:quest_mob
            argumentsPattern: {
                mandatory: ['string', 'string', 'float'],
                mandatoryDefault: [
                    'ZOMBIE',
                    '100;200;300;world',
                    1.0
                ],
                optional: new Map([
                    ['name', 'string'],
                    ['marked', 'string']
                ])
            }
        }
    ];

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditor={Default} />
    );
}