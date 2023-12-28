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
    { jsx: InputList, name: 'Conditions', key: 'conditions', type: 'string[,]', placeholder: '(none)', tooltip: 'Conditions to be satisfied.', config: { allowedPatterns: [/^\S*$/] } },
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
        description: 'Completes when the player clicks on the given block type',
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
                { jsx: Number, name: 'Range (Radius)', key: 'range', type: 'float', config: { min: 0 } },
            ]
        }
    },
    {
        value: 'arrow',
        display: 'Arrow',
        description: 'The player needs to shoot an arrow into the target',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] } },
                { jsx: Number, name: 'Precision (Radius)', type: 'float', defaultValue: 0.0, tooltip: 'A radius around location where the arrow must land, should be small', config: { min: 0 } },
            ]
        }
    },
    {
        value: 'block',
        display: 'Break or Place Blocks',
        description: 'The player must break or place the specified amount of blocks',
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Block', type: 'string', defaultValue: 'any', placeholder: 'e.g. AIR', tooltip: 'Block Selector' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 0, tooltip: 'Number of blocks' },
            ],
            optional: [
                { jsx: Checkbox, name: 'Disable Safety Check', key: 'noSafety', type: 'boolean', tooltip: 'Disable cheating check. Counts blocks the player placed themself.' },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
                // { jsx: OptionalNumber, name: 'Notify', key: 'notify', type: 'int', placeholder: '1', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, setMinToNull: true } },
            ]
        }
    }
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