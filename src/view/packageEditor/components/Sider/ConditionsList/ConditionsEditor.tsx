import React from "react";
import { DefaultOptionType } from "antd/es/select";

import Condition from "../../../../../betonquest/Condition";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import { ArgumentsPatternOptional } from "../../../../../betonquest/Arguments";

import Default from "./ConditionsEditor/Default";

import BaseLocation from "../CommonList/Input/BaseLocation";
import BlockSelector from "../CommonList/Input/BlockSelector";
import Checkbox from "../CommonList/Input/Checkbox";
import EntityType from "../CommonList/Input/EntityType";
import EntityTypeList from "../CommonList/Input/EntityTypeList";
// import EntityTypeListWithAmount from "../CommonList/Input/EntityTypeListWithAmount";
import Input from "../CommonList/Input/Input";
import InputList from "../CommonList/Input/InputList";
import ItemList from "../CommonList/Input/ItemList";
import Number from "../CommonList/Input/Number";
import PotionEffectType from "../CommonList/Input/PotionEffectType";
import PotionEffectTypeList from "../CommonList/Input/PotionEffectTypeList";
import Select from "../CommonList/Input/Select";
import TextArea from "../CommonList/Input/TextArea";
import TextAreaList from "../CommonList/Input/TextAreaList";

// All kinds
const kinds: Kind<Condition>[] = [
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
        value: 'advancement',
        display: 'Advancement',
        description: 'Does the player have a specified advancement?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name', type: 'string', defaultValue: 'minecraft:adventure/some_advancement', placeholder: 'e.g. minecraft:adventure/kill_a_mob', tooltip: 'name of advancement', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'and',
        display: 'And',
        description: 'Checks if every condition are met.',
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Condition List', type: 'string[,]', defaultValue: ['some_condition_1'], placeholder: 'e.g. some_condition_1', tooltip: 'The conditions that must be met', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'armor',
        display: 'Armor',
        description: 'Does the player wearing an specified armor?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', placeholder: 'e.g. a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'biome',
        display: 'Biome',
        description: 'Does the player inside a specific biome?',
        argumentsPattern: {
            mandatory: [
                // TODO: Biome Selector https://hub.spigotmc.org/javadocs/spigot/org/bukkit/block/Biome.html
                { jsx: Input, name: 'Biome Type', type: 'string', defaultValue: 'CUSTOM', placeholder: 'e.g. SAVANNA_ROCK', tooltip: '', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'burning',
        display: 'Burning',
        description: 'Does the player on fire?',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        value: 'check',
        display: 'Check Conditions',
        description: 'Define list of specific conditions, and check if the are all met.',
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Conditions', type: 'string[^]', defaultValue: [''] },
            ],
            keepWhitespaces: true
        }
    },
    {
        value: 'chestitem',
        display: 'Chest Item',
        description: 'Does a chest have specific items?',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: 'Chest\' location' },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        value: 'conversation',
        display: 'Conversation',
        description: 'Check if the current conversation has an available starting option. It could be used to check if this is the conversation we want.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Option Name', type: 'string', defaultValue: 'an_option_1', placeholder: 'e.g. innkeeper', tooltip: 'Name of option e.g. "option_1"', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'dayofweek',
        display: 'Day of week',
        description: 'What day it is today?',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'monday', placeholder: 'e.g. any', tooltip: 'Type of action', config: {
                        options: [
                            { label: 'Monday', value: 'monday' },
                            { label: 'Tuesday', value: 'tuesday' },
                            { label: 'Wednesday', value: 'wednesday' },
                            { label: 'Thursday', value: 'thursday' },
                            { label: 'Friday', value: 'friday' },
                            { label: 'Saturday', value: 'saturday' },
                            { label: 'Sunday', value: 'sunday' },
                        ] as DefaultOptionType[]
                    }
                },
            ]
        }
    },
    {
        value: 'effect',
        display: 'Potion Effect',
        description: 'Does the player has an active potion effect?',
        argumentsPattern: {
            mandatory: [
                { jsx: PotionEffectType, name: 'Effect', type: 'string', defaultValue: 'SPEED', tooltip: 'Potion Effect Type' },
            ]
        }
    },
    {
        value: 'empty',
        display: 'Empty Inventory Slots',
        description: 'Does the player\'s inventory have enough empty slots?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 0, config: { min: 0 } },
            ]
        }
    },
    {
        value: 'entities',
        display: 'Entities in Area',
        description: 'Are there any specified amount of mobs in an area?',
        argumentsPattern: {
            mandatory: [
                // TODO: Entity Type list with amount
                { jsx: EntityTypeList, name: 'Type', type: 'string[,]', defaultValue: ['ZOMBIE'] },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 1.0, tooltip: 'A radius around location where the mobs must be', config: { min: 0 } },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mob', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Should the mobs have the same mark from the spawn mob event?', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'experience',
        display: 'Experience',
        description: 'Does the player have the specified amount of experience levels?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Level', type: 'float', defaultValue: 1.0, tooltip: 'Number could be a decimal', config: { min: 0 } },
            ]
        }
    },
    {
        value: 'facing',
        display: 'Facing Direction',
        description: 'Where does the player is looking at?',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Direction', type: 'string', defaultValue: 'UP', placeholder: 'e.g. UP', tooltip: 'Up and down start at a pitch of 60°',  config: {
                        options: [
                            { label: 'North', value: 'NORTH' },
                            { label: 'East', value: 'EAST' },
                            { label: 'West', value: 'WEST' },
                            { label: 'South', value: 'SOUTH' },
                            { label: 'Up (>60°)', value: 'UP' },
                            { label: 'Down (>60°)', value: 'DOWN' },
                        ] as DefaultOptionType[]
                    }
                },
            ]
        }
    },
    // ...
];


export default function (props: ListElementEditorProps<Condition>) {
    return (
        <CommonEditor<Condition> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}