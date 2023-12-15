import React from "react";

import Event from "../../../../../betonquest/Event";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";

import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";
import KillMob from "./EventsEditor/KillMob";

import Input from "../CommonList/Input/Input";
import InputList from "../CommonList/Input/InputList";
import TextArea from "../CommonList/Input/TextArea";
import TextAreaList from "../CommonList/Input/TextAreaList";
import Checkbox from "../CommonList/Input/Checkbox";
import Number from "../CommonList/Input/Number";

export default function (props: ListElementEditorProps<Event>) {

    // All kinds
    const kinds: Kind<Event>[] = [
        {
            value: 'unknown',
            display: 'Unknown',
            description: 'Unknown Event',
            argumentsPattern: {
                mandatory: [
                    { jsx: TextArea, name: 'Value', type: '*', defaultValue: '' },
                ]
            }
        },
        {
            value: 'chat',
            display: 'Chat',
            description: 'Send the given message as the player.',
            argumentsPattern: {
                mandatory: [
                    { jsx: TextAreaList, name: 'Messages', type: 'string[|]', defaultValue: [''] },
                ],
                keepWhitespaces: true
            }
        },
        {
            value: 'give',
            display: 'Give',
            description: 'Gives the player predefined items.',
            // editorBody: Give,
            // e.g. emerald:5,emerald_block:9,important_sign notify backpack
            argumentsPattern: {
                mandatory: [
                    // { jsx: ItemList, name: 'Item List', type: 'ItemList', default: [["emerald", 5], ["emerald_block", 9], ["important_sign", 1]] },
                    // { jsx: ItemList, name: 'Item List', type: '[string:number][,]', default: [["emerald", 5], ["emerald_block", 9], ["important_sign", 1]] },
                    { jsx: Input, name: 'Item List', type: 'string', defaultValue: 'emerald:5,emerald_block:9,important_sign', placeholder: 'e.g. emerald:5', tooltip: 'List of Items, seprated by ","' },
                ],
                optional: [
                    { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a simple message to the player about receiving items' },
                    { jsx: Checkbox, name: 'Backpack', key: 'backpack', type: 'boolean', tooltip: 'Forces quest items to be placed in the backpack' }
                ]
            }
        },
        {
            value: 'killmob',
            display: 'Kill Mob',
            description: 'Kills all mobs of given type at the location.',
            // editorBody: KillMob,
            // e.g. killmob ZOMBIE 100;200;300;world 40 name:Bolec marked:quest_mob
            argumentsPattern: {
                mandatory: [
                    // { jsx: Input, name: 'Entity Type', type: 'entity', defaultValue: 'ZOMBIE' },
                    { jsx: Input, name: 'Entity Type', type: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                    { jsx: Input, name: 'Location', type: 'string', defaultValue: '100;200;300;world', placeholder: 'e.g. 100;200;300;world' },
                    { jsx: Number, name: 'Radius', type: 'string', defaultValue: 1.0 },
                ],
                optional: [
                    { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. Super_Zombie', tooltip: 'The name of the mob which should get killed' },
                    { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Kill only mobs that with the same mark using the spawn mob event' }
                ]
            }
        },
        {
            value: 'notify',
            display: 'Notify',
            description: 'Send notifications to the player.',
            argumentsPattern: {
                mandatory: [
                    { jsx: TextArea, name: 'Message', type: 'string', defaultValue: 'Notice', escapeCharacters: [':', '\n'] },
                ],
                optional: [
                    { jsx: InputList, name: 'Category', key: 'category', type: 'string[,]', placeholder: 'e.g. info', tooltip: 'Will load all settings from that Notification Category' },
                    { jsx: Input, name: 'IO', key: 'io', type: 'string', placeholder: 'e.g. bossbar', tooltip: 'Any NotifyIO Overrides the "category" settings' },
                    // TODO: Seprated editor body. https://docs.betonquest.org/2.0-DEV/Documentation/Visual-Effects/Notifications/Notification-IO%27s-%26-Categories/
                ],
                keepWhitespaces: true
            }
        }
    ];

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}