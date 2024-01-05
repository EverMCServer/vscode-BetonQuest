import React from "react";
import { Tooltip } from "antd";
import { DefaultOptionType } from "antd/es/select";

import Objective from "../../../../../betonquest/Objective";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import { ArgumentsPatternOptional } from "../../../../../betonquest/Arguments";

import Default from "./ObjectivesEditor/Default";

import BaseLocation from "../CommonList/Input/BaseLocation";
import BlockSelector from "../CommonList/Input/BlockSelector";
import Checkbox from "../CommonList/Input/Checkbox";
import DyeColor from "../CommonList/Input/DyeColor";
import EnchantmentList from "../CommonList/Input/EnchantmentList";
import EntityType from "../CommonList/Input/EntityType";
import EntityTypeList from "../CommonList/Input/EntityTypeList";
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
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'any', placeholder: 'e.g. any', tooltip: 'Type of action', config: {
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
                { jsx: Checkbox, name: 'Exact State?', key: 'exactMatch', type: 'boolean', tooltip: 'The target block is not allowed to have more BlockStates than specified' },
                { jsx: Checkbox, name: 'Cancel Click?', key: 'cancel', type: 'boolean', tooltip: 'Should the clikc, e.g. left click hit mobs, be cancelled?' },
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
                { jsx: Number, name: 'Precision (Radius)', type: 'float', defaultValue: 1.0, tooltip: 'A radius around location where the arrow must land, should be small', config: { min: 0 } },
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
                { jsx: EntityType, name: 'Type', type: 'string', defaultValue: 'PIG' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of animals', config: { min: 1 } },
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
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
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
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of items', config: { min: 1 } },
            ]
        }
    },
    {
        value: 'enchant',
        display: 'Enchant item',
        description: 'The player must enchant the specified quest item with a specified enchantment.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
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
    {
        value: 'experience',
        display: 'Experience',
        description: 'The player must reach the specified amount of experience levels.',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Level', type: 'float', defaultValue: 1.0, tooltip: 'Number could be a decimal', config: { min: 0 } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'delay',
        display: 'Wait',
        description: 'The player must wait for certain amount of time, including offline. Unit defaults to "minutes".',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Time', type: 'int', defaultValue: 1.0, tooltip: 'Time duration', config: { min: 0 } },
            ],
            optional: [
                // Bad design. Should use "Select" instead.
                // https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/objectives/DelayObjective.java#L73
                { jsx: Checkbox, name: 'Minutes?', key: 'minutes', type: 'boolean', tooltip: 'Unit' },
                { jsx: Checkbox, name: 'Seconds?', key: 'seconds', type: 'boolean', tooltip: 'Unit' },
                { jsx: Checkbox, name: 'Ticks?', key: 'ticks', type: 'boolean', tooltip: 'Unit' },
                { jsx: Number, name: 'Check Precision', key: 'interval', type: 'int', placeholder: '200', tooltip: 'The interval in which the objective checks if the time is up. Measured in ticks. Low values cost more performance but make the objective preciser.', config: { min: 0, undefinedValue: 0 } },
            ]
        }
    },
    {
        value: 'die',
        display: 'Death',
        description: 'The player must die with conditions.',
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Checkbox, name: 'Cancel Death?', key: 'cancel', type: 'boolean', tooltip: 'Cancel player\' death?' },
                { jsx: BaseLocation, name: 'Respawn Location', key: 'respawn', type: 'string', config: { optional: true } },
            ]
        }
    },
    {
        value: 'fish',
        display: 'Fishing',
        description: 'The player must catch something with the fishing rod. The "fish" could be any item.',
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Item', type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: 'The item that must be caught' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, config: { min: 1 } },
            ],
            optional: [
                { jsx: BaseLocation, name: 'Hook Location', key: 'hookLocation', type: 'string', tooltip: 'Where the hook needs to be', config: { optional: true } },
                { jsx: Number, name: 'Radius', key: 'range', type: 'float', tooltip: 'A radius around the hook\'s landing', config: { min: 0 } },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'interact',
        display: 'Interact with entity',
        description: 'The player must click on an entity.',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'any', placeholder: 'e.g. any', tooltip: 'Type of action', config: {
                        options: [
                            { label: 'Any', value: 'any' },
                            { label: 'Right', value: 'right' },
                            { label: 'Left', value: 'left' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: EntityType, name: 'Entity Type', type: 'string', defaultValue: 'ZOMBIE' },
                { jsx: Number, name: 'Mobs', type: 'int', defaultValue: 1, tooltip: 'How many UNIQUE mobs that need to be cliked (not the same mob)', config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mob to be clicked', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Real Name', key: 'realname', type: 'string', placeholder: 'e.g. "Notch"', tooltip: 'If the mob is a player, the real name of the player to be clicked', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Should the mobs have the same mark from the spawn mob event?', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: 'Cancel Click?', key: 'cancel', type: 'boolean', tooltip: 'Should the clikc, e.g. left click hit mobs, be cancelled?' },
                { jsx: BaseLocation, name: 'Location', key: 'loc', type: 'string', tooltip: 'Where the click should be happened', config: { optional: true } },
                { jsx: Number, name: 'Radius', key: 'range', type: 'float', tooltip: 'A radius around the location', config: { min: 0 } },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'kill',
        display: 'Kill player',
        description: 'The player needs to kill another players.',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'How many players that need to be killed', config: { min: 1 } },
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Notch"', tooltip: 'The name of the player to be killed', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
                { jsx: InputList, name: 'Conditions', key: 'required', type: 'string[,]', placeholder: '(none)', tooltip: 'Conditions that need to be satisfied by the players whom are going to be killed, e.g. tag_team_b', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'location',
        display: 'Location',
        description: 'The player must move into a specified range of a location.',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 1.0, tooltip: 'A radius around location where the player must be', config: { min: 0 } },
            ]
        }
    },
    {
        value: 'login',
        display: 'Login',
        description: 'The player simply needs to login to the server.',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        value: 'logout',
        display: 'Logout',
        description: 'The player simply needs to leave the server.',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // TODO: a seprated standalone editor for password preview
        value: 'password',
        display: 'Password',
        description: <><div>The player has to write a certain password in chat.</div><div>This is what the player has to type in chat:</div><div><Tooltip title="Prefix (If specified)"><u>Solution:</u></Tooltip> <Tooltip title="Password"><u>The Cake is a lie!</u></Tooltip></div></>,
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Password', type: 'string', defaultValue: 'Some Passwords', tooltip: 'Could be a Regular Expression', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ignore Case', key: 'ignoreCase', type: 'boolean', tooltip: 'Case insensitive?' },
                { jsx: Input, name: 'Prefix', key: 'prefix', type: 'string', placeholder: 'e.g. "Secret Password"', tooltip: 'A prefix before the password', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: InputList, name: 'Events on Failed', key: 'fail', type: 'string[,]', placeholder: '(none)', tooltip: 'List of events to be executed when password incorrect', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'pickup',
        display: 'Pickup Item',
        description: 'The player needs to pickup the specified amount of items.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: 'Total Amount', key: 'amount', type: 'int', placeholder: '1', tooltip: 'Number of items to be picked up, in total.', config: { min: 0, undefinedValue: 0 } },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'mobkill',
        display: 'Entity Kill',
        description: 'The player must kill the specified amount of entities.',
        argumentsPattern: {
            mandatory: [
                { jsx: EntityTypeList, name: 'Type', type: 'string[,]', defaultValue: ['ZOMBIE'] },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of mobs to be killed', config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mob to be killed', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Should the mobs have the same mark from the spawn mob event?', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'brew',
        display: 'Potion Brewing',
        description: 'The player needs to brew specified amount of specified potions.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_potion', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of potions', config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'shear',
        display: 'Sheep shearing',
        description: 'The player has to shear specified amount of sheep.',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of sheeps', config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Farmer\'s Sheep"', tooltip: 'The name of the sheep', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: DyeColor, name: 'Color', key: 'color', type: 'string', placeholder: 'e.g. "black"', config: { allowClear: true } },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'smelt',
        display: 'Smelting',
        description: 'The player must smelt the specified item.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of items to be smelt', config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'stage',
        display: 'Stages',
        description: <><div>The player must complete the specified stages.</div><div>You can modify the stages with the `stage` event and check it with the `stage` condition.</div></>,
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Stage List', type: 'string[,]', defaultValue: ['some_stage_1'], placeholder: 'e.g. stage_1', tooltip: 'The stages that must be completed', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ignore Stage Increasing', key: 'preventCompletion', type: 'boolean', tooltip: 'Make this objective must be completed by `objective` event. Prevents it from being completed by increasing the stage.' },
            ]
        }
    },
    {
        value: 'step',
        display: 'Step on pressure plate',
        description: 'The player has to step on a pressure plate at a given location. The type of plate does not matter.',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
            ]
        }
    },
    {
        value: 'tame',
        display: 'Taming',
        description: 'The player must tame some amount of mobs.',
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Type', type: 'string', defaultValue: 'WOLF' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of mobs', config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'jump',
        display: 'Player must Jump',
        description: <><div>The player must jump.</div><div>This feature requires <a href="https://papermc.io/" target="_blank">Paper</a>.</div></>,
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of jumps', config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        value: 'ride',
        display: 'Ride an entity',
        description: 'The player must ride a specific entitiy',
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Type', type: 'string', defaultValue: 'any', tooltip: '"any" means any entities are ok' },
            ]
        }
    },
    {
        value: 'command',
        display: 'Run a Command',
        description: 'The player must execute a specified command.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Command', type: 'string', defaultValue: '/spawn', tooltip: 'Could be a non-exists command', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ignore Case', key: 'ignoreCase', type: 'boolean', tooltip: 'Case insensitive?' },
                { jsx: Checkbox, name: 'Exact', key: 'exact', type: 'boolean', tooltip: 'Match everything till the end, not just the begining' },
                { jsx: Checkbox, name: 'Cancel Execution', key: 'cancel', type: 'boolean', tooltip: 'Prevent the command from being executed. Useful when the command is not exist.' },
                { jsx: InputList, name: 'Events on Failed', key: 'failEvents', type: 'string[,]', placeholder: '(none)', tooltip: 'List of events to be executed when command does not match', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'equip',
        display: 'Equip Armor Item',
        description: <><div>The player must equip the specified quest item in the specified slot.</div><div>This feature requires <a href="https://papermc.io/" target="_blank">Paper</a>.</div></>,
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Slot', type: 'string', defaultValue: 'HEAD', placeholder: 'e.g. HEAD', config: {
                        options: [
                            { label: 'Head', value: 'HEAD' },
                            { label: 'Chest', value: 'CHEST' },
                            { label: 'Legs', value: 'LEGS' },
                            { label: 'Feet', value: 'FEET' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'variable',
        display: 'Variable',
        description: <><div>Allow thethe player set a variable typed in chat with format "key: value".</div><div>For more details, please refer to the <a href="https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Building-Blocks/Objectives-List/#variable-variable" target="_blank">documentation</a>.</div></>,
        argumentsPattern: {
            mandatory: []
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