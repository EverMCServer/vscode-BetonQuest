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
import EntityType from "../CommonList/Input/EntityType";
import BlockSelector from "../CommonList/Input/BlockSelector";
import BaseLocation from "../CommonList/Input/BaseLocation";
import Select from "../CommonList/Input/Select";
import { DefaultOptionType } from "antd/es/select";
import ItemList from "../CommonList/Input/ItemList";

// All kinds
const kinds: Kind<Event>[] = [
    {
        value: '*',
        display: '*',
        description: undefined,
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: 'Value', type: '*', defaultValue: '' },
            ],
            keepWhitespaces: true
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
        // e.g. emerald:5,emerald_block:9,important_sign notify backpack
        argumentsPattern: {
            mandatory: [
                // { jsx: ItemList, name: 'Item List', type: 'ItemList', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a simple message to the player about receiving items' },
                { jsx: Checkbox, name: 'Backpack', key: 'backpack', type: 'boolean', tooltip: 'Forces quest items to be placed in the backpack' }
            ]
        }
    },
    {
        value: 'hunger',
        display: 'Hunger',
        description: 'Changes the food level of the player.',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Modification', type: 'string', defaultValue: 'set', placeholder: 'e.g. set', config: {
                        options: [
                            {
                                label: 'Set', // TODO: i18n
                                value: 'set'
                            },
                            {
                                label: 'Give +', // TODO: i18n
                                value: 'give'
                            },
                            {
                                label: 'Take -', // TODO: i18n
                                value: 'take'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'For "set", the amount can be any value.\nFor "give" or "take", the final value will be limited between 0 and 20.' },
            ]
        }
    },
    {
        value: 'kill',
        display: 'Kill',
        description: 'Kills the player',
        argumentsPattern: {
            mandatory: []
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
                { jsx: EntityType, name: 'Entity Type', type: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] } },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 0.0, config: { min: 0 } },
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
                { jsx: TextArea, name: 'Message', type: 'string', defaultValue: '', escapeCharacters: [':', '\n'] },
            ],
            optional: [
                { jsx: InputList, name: 'Category', key: 'category', type: 'string[,]', placeholder: 'e.g. info', tooltip: 'Will load all settings from that Notification Category' },
                { jsx: Input, name: 'IO', key: 'io', type: 'string', placeholder: 'e.g. bossbar', tooltip: 'Any NotifyIO Overrides the "category" settings' },
                // TODO: Seprated editor body. https://docs.betonquest.org/2.0-DEV/Documentation/Visual-Effects/Notifications/Notification-IO%27s-%26-Categories/
            ],
            keepWhitespaces: true
        }
    },
    {
        value: 'run',
        display: 'Run Events',
        description: <><div style={{ marginBottom: 8 }}>Specify multiple instructions in one, long instruction.</div><div>Actual instruction need to be specified, not an event name. Don't use conditions here, it behaves strangely.</div></>,
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Event Instruction', type: 'string[^]', defaultValue: '', placeholder: 'e.g. give item:1', tooltip: 'Actual instruction need to be specified, not an event name.' },
            ],
            keepWhitespaces: true
        }
    },
    {
        value: 'setblock',
        display: 'Set Block',
        description: 'Changes the block at the given position.',
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Block Selector', type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: 'Block Selector' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ignore Physics', key: 'ignorePhysics', type: 'boolean', tooltip: 'Deactivate the physics of the block' },
            ]
        }
    }
];

export default function (props: ListElementEditorProps<Event>) {

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}