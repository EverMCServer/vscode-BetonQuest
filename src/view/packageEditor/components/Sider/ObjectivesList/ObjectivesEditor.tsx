import React from "react";
import { DefaultOptionType } from "antd/es/select";

import Objective from "../../../../../betonquest/Objective";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import { ArgumentsPatternOptional } from "../../../../../betonquest/Arguments";

import Default from "./ObjectivesEditor/Default";

import BaseLocation from "../CommonList/Input/BaseLocation";
import BlockSelector from "../CommonList/Input/BlockSelector";
import Checkbox from "../CommonList/Input/Checkbox";
import EnchantmentList from "../CommonList/Input/EnchantmentList";
import EntityType from "../CommonList/Input/EntityType";
import Input from "../CommonList/Input/Input";
import InputList from "../CommonList/Input/InputList";
import ItemList from "../CommonList/Input/ItemList";
import Number from "../CommonList/Input/Number";
import PotionEffectTypeList from "../CommonList/Input/PotionEffectTypeList";
import Select from "../CommonList/Input/Select";
import TextArea from "../CommonList/Input/TextArea";
import TextAreaList from "../CommonList/Input/TextAreaList";
import OptionalNumber from "../CommonList/Input/OptionalNumber";

// Default optional arguments for every kind
const defaultOptionalArguments: ArgumentsPatternOptional[] = [
    { jsx: InputList, name: 'Conditions', key: 'conditions', type: 'string[,]', placeholder: '(none)', tooltip: 'Conditions to be satisfied', config: { allowedPatterns: [/^\S*$/] } },
    { jsx: InputList, name: 'Events', key: 'events', type: 'string[,]', placeholder: '(none)', tooltip: 'Events to be run if this objective is fulfilled', config: { allowedPatterns: [/^\S*$/] } },
];

// All kinds
const kinds: Kind<Objective>[] = ([
    {
        value: '*',
        display: '*',
        description: undefined,
        editorBody: Default,
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: 'Value', type: '*', defaultValue: '' },
            ],
            keepWhitespaces: true
        }
    },
    {
        value: 'action',
        display: 'Action',
        description: 'Completes when the player clicks on the given block type.',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Type', type: 'string', defaultValue: 'any', placeholder: 'e.g. any', config: {
                        options: [
                            { label: 'Any', value: 'any' },
                            { label: 'Right', value: 'right' },
                            { label: 'Left', value: 'left' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: BlockSelector, name: 'Block', type: 'string', defaultValue: 'any', placeholder: 'e.g. AIR', tooltip: 'Block Selector' },
            ],
            optional: [
                { jsx: BaseLocation, name: 'Location', key: 'loc', type: 'string', config: { optional: true } },
                { jsx: Number, name: 'Range (Radius)', key: 'range', type: 'float', placeholder: '1', config: { min: 0, undefinedValue: 0 } },
            ]
        }
    },
    {
        value: 'arrow',
        display: 'Arrow',
        description: 'The player needs to shoot an arrow into the target.',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
                { jsx: Number, name: 'Precision (Radius)', type: 'float', defaultValue: 0.0, tooltip: 'A radius around location where the arrow must land, should be small', config: { min: 0 } },
            ]
        }
    },
    {
        value: 'block',
        display: 'Break or Place Blocks',
        description: 'The player must break or place the specified amount of blocks.',
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Block', type: 'string', defaultValue: 'any', placeholder: 'e.g. AIR', tooltip: 'Block Selector' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of blocks', config: { min: 1 } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Disable Safety Check', key: 'noSafety', type: 'boolean', tooltip: 'Disable cheating check. Do not counts the blocks the player placed themself.' },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
                // { jsx: OptionalNumber, name: 'Notify', key: 'notify', type: 'int', placeholder: '1', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, setMinToNull: true } },
            ]
        }
    },
    {
        value: 'breed',
        display: 'Breed animals',
        description: 'The player must breed a type of animals for certain amounts.',
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Type', type: 'string', defaultValue: '' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 0, tooltip: 'Number of animals', config: { min: 0 } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'chestput',
        display: 'Put items in a chest',
        description: 'The player must put the specified items in a specified chest.',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: 'Chest\'s location' },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: 'Keep Item', key: 'items-stay', type: 'boolean', tooltip: 'Do not remove the items from chest when objective completed' },
                { jsx: Checkbox, name: 'Simultaneous Chest Access', key: 'multipleaccess', type: 'boolean', tooltip: 'Allow multiple players open the chest at the same time' },
            ]
        }
    },
    {
        value: 'consume',
        display: 'Eat / Drink',
        description: 'The player must eat the specified foods, or drink the specified potion.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: '', tooltip: 'Quest\'s item name' },
            ],
            optional: [
                { jsx: Number, name: 'Amount', key: 'amount', type: 'int', tooltip: 'Number of items', placeholder: '1', config: { min: 0, undefinedValue: 0 } },
            ]
        }
    },
    {
        value: 'craft',
        display: 'Crafting',
        description: 'The player must craft specified items.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: '', tooltip: 'Quest\'s item name' },
                { jsx: Number, name: 'Amount', key: 'amount', type: 'int', defaultValue: 1, tooltip: 'Number of items', config: { min: 1 } },
            ]
        }
    },
    {
        value: 'enchant',
        display: 'Enchant item',
        description: 'The player must enchant the specified quest item with a specified enchantment.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: '', tooltip: 'Quest\'s item name' },
                { jsx: EnchantmentList, name: 'Enchantment List', type: '[string:number?][,]', defaultValue: [["", 1]], placeholder: ['e.g. ARROW_DAMAGE', '1'] },
            ],
            optional: [
                {
                    jsx: Select, name: 'Requirement Mode', key: 'requirementMode', type: 'string', placeholder: 'all', tooltip: 'Should all or only one enchantment need to be completed', config: {
                        options: [
                            {
                                label: 'All', // TODO: i18n
                                value: 'all'
                            },
                            {
                                label: 'Only One', // TODO: i18n
                                value: 'one'
                            },
                        ] as DefaultOptionType[],
                        allowClear: true
                    }
                },
                { jsx: Number, name: 'Amount', key: 'amount', type: 'int', placeholder: '1', tooltip: 'Number of items to be enchanted', config: { min: 0, undefinedValue: 0 } },
            ]
        }
    },
    // ...
] as Kind<Objective>[]).map(kind => {
    if (kind.argumentsPattern.optional) {
        kind.argumentsPattern.optional.unshift(...defaultOptionalArguments);
    } else {
        kind.argumentsPattern.optional = defaultOptionalArguments;
    }
    return kind;
});


export default function (props: ListElementEditorProps<Objective>) {
    return (
        <CommonEditor<Objective> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}