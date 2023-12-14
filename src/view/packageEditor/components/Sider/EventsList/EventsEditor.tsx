import React from "react";
import { Input } from "antd";

import Event from "../../../../../betonquest/Event";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";
import KillMob from "./EventsEditor/KillMob";

const textInput = <Input />;

export default function (props: ListElementEditorProps<Event>) {

    // All kinds
    const kinds: Kind<Event>[] = [
        {
            value: 'unknown',
            display: 'Unknown',
            editor: Default,
            argumentsConfig: {
                mandatory: [
                    { jsx: textInput, name: 'unspecified', type: '*', placeholder: '' },
                ],
            }
        },
        {
            value: 'give',
            display: 'Give',
            editor: Give,
            // e.g. emerald:5,emerald_block:9,important_sign notify backpack
            argumentsConfig: {
                // default: "emerald:5,emerald_block:9,important_sign notify backpack",
                mandatory: [
                    { jsx: textInput, name: 'item_list', type: '[string:number][,]', placeholder: [["emerald", 5], ["emerald_block", 9], ["important_sign", 1]] },
                ],
                optional: [
                    { jsx: textInput, name: 'notify', key: 'notify', type: 'boolean' },
                    { jsx: textInput, name: 'backpack', key: 'backpack', type: 'boolean' }
                ]
            }
        },
        {
            value: 'killmob',
            display: 'Kill Mob',
            editor: KillMob,
            // e.g. killmob ZOMBIE 100;200;300;world 40 name:Bolec marked:quest_mob
            argumentsConfig: {
                mandatory: [
                    { jsx: textInput, name: 'entity_type', type: 'string', placeholder: 'ZOMBIE' },
                    { jsx: textInput, name: 'location', type: 'string', placeholder: '100;200;300;world' },
                    { jsx: textInput, name: 'float', type: 'string', placeholder: 1.0 },
                ],
                optional: [
                    { jsx: textInput, name: 'name', key: 'name', type: 'string' },
                    { jsx: textInput, name: 'marked', key: 'marked', type: 'string' }
                ]
            }
        }
    ];

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditor={Default} />
    );
}