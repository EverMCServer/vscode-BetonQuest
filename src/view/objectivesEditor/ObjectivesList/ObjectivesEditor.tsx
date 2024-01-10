import React from "react";
import { Tooltip } from "antd";
import { DefaultOptionType } from "antd/es/select";

import Objective from "../../../betonquest/Objective";
import { Kind, ListElementEditorProps } from "../../legacyListEditor/components/CommonList/CommonEditor";
import CommonEditor from "../../legacyListEditor/components/CommonList/CommonEditor";
import { ArgumentsPatternOptional } from "../../../betonquest/Arguments";

import Default from "./ObjectivesEditor/Default";

import BaseLocation from "../../legacyListEditor/components/CommonList/Input/BaseLocation";
import BlockSelector from "../../legacyListEditor/components/CommonList/Input/BlockSelector";
import Checkbox from "../../legacyListEditor/components/CommonList/Input/Checkbox";
import DyeColor from "../../legacyListEditor/components/CommonList/Input/DyeColor";
import EnchantmentList from "../../legacyListEditor/components/CommonList/Input/EnchantmentList";
import EntityType from "../../legacyListEditor/components/CommonList/Input/EntityType";
import EntityTypeList from "../../legacyListEditor/components/CommonList/Input/EntityTypeList";
import Input from "../../legacyListEditor/components/CommonList/Input/Input";
import InputList from "../../legacyListEditor/components/CommonList/Input/InputList";
import ItemList from "../../legacyListEditor/components/CommonList/Input/ItemList";
import Number from "../../legacyListEditor/components/CommonList/Input/Number";
import PotionEffectTypeList from "../../legacyListEditor/components/CommonList/Input/PotionEffectTypeList";
import Select from "../../legacyListEditor/components/CommonList/Input/Select";
import TextArea from "../../legacyListEditor/components/CommonList/Input/TextArea";
import TextAreaList from "../../legacyListEditor/components/CommonList/Input/TextAreaList";
import OptionalNumber from "../../legacyListEditor/components/CommonList/Input/OptionalNumber";

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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ActionObjective.java
        value: 'action',
        display: 'Action',
        description: 'Completes when the player clicks on the given block type.',
        // e.g. action right DOOR conditions:holding_key loc:100;200;300;world range:5
        // e.g. action any any conditions:holding_magicWand events:fireSpell #Custom click listener for a wand
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
                { jsx: BaseLocation, name: 'Location', key: 'loc', type: 'string', config: { optional: true }, allowVariable: true },
                { jsx: Number, name: 'Range (Radius)', key: 'range', type: 'float', placeholder: '1', config: { min: 0, undefinedValue: 0 }, allowVariable: true },
                { jsx: Checkbox, name: 'Exact State?', key: 'exactMatch', type: 'boolean', tooltip: 'The target block is not allowed to have more BlockStates than specified' },
                { jsx: Checkbox, name: 'Cancel Click?', key: 'cancel', type: 'boolean', tooltip: 'Should the clikc, e.g. left click hit mobs, be cancelled?' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ArrowShootObjective.java
        value: 'arrow',
        display: 'Arrow',
        description: 'The player needs to shoot an arrow into the target.',
        // e.g. arrow 100.5;200.5;300.5;world 1.1 events:reward conditions:correct_player_position
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: 'Precision (Radius)', type: 'float', defaultValue: 1.0, tooltip: 'A radius around location where the arrow must land, should be small', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/BlockObjective.java
        value: 'block',
        display: 'Break or Place Blocks',
        description: 'The player must break or place the specified amount of blocks.',
        // e.g. block LOG -16 events:reward notify:5
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Block', type: 'string', defaultValue: 'any', placeholder: 'e.g. AIR', tooltip: 'Block Selector' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of blocks', config: { min: 1 } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Exact State?', key: 'exactMatch', type: 'boolean', tooltip: 'The target block is not allowed to have more BlockStates than specified' },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
                // { jsx: OptionalNumber, name: 'Notify', key: 'notify', type: 'int', placeholder: '1', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, setMinToNull: true } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/BreedObjective.java
        value: 'breed',
        display: 'Breed Animals',
        description: 'The player must breed a type of animals for certain amounts.',
        // e.g. breed cow 10 notify:2 events:reward
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ChestPutObjective.java
        value: 'chestput',
        display: 'Put Items in a Chest',
        description: 'The player must put the specified items in a specified chest.',
        // e.g. chestput 100;200;300;world emerald:5,sword events:tag,message
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: 'Chest\'s location', allowVariable: true },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: 'Keep Item', key: 'items-stay', type: 'boolean', tooltip: 'Do not remove the items from chest when objective completed' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ConsumeObjective.java
        value: 'consume',
        display: 'Eat / Drink',
        description: 'The player must eat the specified foods, or drink the specified potion.',
        // e.g. consume tawny_owl events:faster_endurance_regen
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/CraftingObjective.java
        value: 'craft',
        display: 'Crafting',
        description: 'The player must craft specified items.',
        // e.g. craft saddle 5 events:reward
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of items', config: { min: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/EnchantObjective.java
        value: 'enchant',
        display: 'Enchant Item',
        description: 'The player must enchant the specified quest item with a specified enchantment.',
        // e.g. enchant sword damage_all:1,knockback:1 events:reward
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: EnchantmentList, name: 'Enchantment List', type: '[string:number?][,]', defaultValue: [["", 1]], placeholder: ['e.g. ARROW_DAMAGE', '1'] },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ExperienceObjective.java
        value: 'experience',
        display: 'Experience',
        description: 'The player must reach the specified amount of experience levels.',
        // e.g. experience 25 level events:reward
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Experience', type: 'int', defaultValue: 1, tooltip: 'Number could be a decimal', config: { min: 1 } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Level?', key: 'level', type: 'boolean', tooltip: 'Unit in level instead of experience point?' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/DelayObjective.java
        value: 'delay',
        display: 'Wait',
        description: 'The player must wait for certain amount of time, including offline. Unit defaults to "minutes".',
        // e.g. delay 1000 ticks interval:5 events:event1,event2
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Time', type: 'int', defaultValue: 1.0, tooltip: 'Time duration', config: { min: 0 } },
            ],
            optional: [
                // TODO: Bad design. Should use "Select" instead.
                // https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/objectives/DelayObjective.java#L73
                { jsx: Checkbox, name: 'Ticks?', key: 'ticks', type: 'boolean', tooltip: 'Unit' },
                { jsx: Checkbox, name: 'Seconds?', key: 'seconds', type: 'boolean', tooltip: 'Unit' },
                { jsx: Checkbox, name: 'Minutes?', key: 'minutes', type: 'boolean', tooltip: 'Unit' },
                { jsx: Number, name: 'Interval', key: 'interval', type: 'int', placeholder: '200', tooltip: 'The interval in which the objective checks if the time is up. Measured in ticks. Low values cost more performance but make the objective preciser.', config: { min: 0, undefinedValue: 0 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/DieObjective.java
        value: 'die',
        display: 'Death',
        description: 'The player must die with conditions.',
        // e.g. die cancel respawn:100;200;300;world;90;0 events:teleport
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Checkbox, name: 'Cancel Death?', key: 'cancel', type: 'boolean', tooltip: 'Cancel player\' death?' },
                { jsx: BaseLocation, name: 'Respawn Location', key: 'respawn', type: 'string', config: { optional: true }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/FishObjective.java
        value: 'fish',
        display: 'Fishing',
        description: 'The player must catch something with the fishing rod. The "fish" could be any item.',
        // e.g. fish SALMON 5 notify events:tag_fish_caught
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Item', type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: 'The item that must be caught' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/EntityInteractObjective.java
        value: 'interact',
        display: 'Interact with an Entity',
        description: 'The player must click on an entity.',
        // e.g. interact right creeper 1 marked:sick condition:syringeInHand cancel
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
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'How many UNIQUE mobs that need to be cliked (not the same mob)', config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mob to be clicked', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Real Name', key: 'realname', type: 'string', placeholder: 'e.g. "Notch"', tooltip: 'If the mob is a player, the real name of the player to be clicked', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Should the mobs have the same mark from the spawn mob event?', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: 'Cancel Click?', key: 'cancel', type: 'boolean', tooltip: 'Should the clikc, e.g. left click hit mobs, be cancelled?' },
                { jsx: BaseLocation, name: 'Location', key: 'loc', type: 'string', tooltip: 'Where the click should be happened', config: { optional: true }, allowVariable: true },
                { jsx: Number, name: 'Radius', key: 'range', type: 'float', tooltip: 'A radius around the location', config: { min: 0 }, allowVariable: true },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/KillPlayerObjective.java
        value: 'kill',
        display: 'Kill Players',
        description: 'The player needs to kill another players.',
        // e.g. kill 5 required:team_B
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'How many players that need to be killed', config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Notch"', tooltip: 'The name of the player to be killed', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: 'Conditions', key: 'required', type: 'string[,]', placeholder: '(none)', tooltip: 'Conditions that need to be satisfied by the players whom are going to be killed, e.g. tag_team_b', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/LocationObjective.java
        value: 'location',
        display: 'Location',
        description: 'The player must move into a specified range of a location.',
        // e.g. location 100;200;300;world 5 condition:test1,!test2 events:test1,test2
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 1.0, tooltip: 'A radius around location where the player must be', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/LoginObjective.java
        value: 'login',
        display: 'Login',
        description: 'The player simply needs to login to the server.',
        // e.g. login events:welcome_message
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/LogoutObjective.java
        value: 'logout',
        display: 'Logout',
        description: 'The player simply needs to leave the server.',
        // e.g. logout events:delete_objective
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/PasswordObjective.java
        // TODO: a seprated standalone editor for password preview
        value: 'password',
        display: 'Password',
        description: <><div>The player has to write a certain password in chat.</div><div>This is what the player has to type in chat:</div><div><Tooltip title="Prefix (If specified)"><u>Solution:</u></Tooltip> <Tooltip title="Password"><u>The Cake is a lie!</u></Tooltip></div></>,
        // e.g. password beton ignoreCase prefix:secret fail:failEvent1,failEvent2 events:message,reward
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/PickupObjective.java
        value: 'pickup',
        display: 'Pickup Item',
        description: 'The player needs to pickup the specified amount of items.',
        // e.g. pickup emerald amount:3 events:reward notify
        // e.g. pickup emerald,diamond amount:6 events:reward notify
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Item List', type: 'string[,]', defaultValue: ["a_quest_item_1"], placeholder: 'e.g. emerald' },
            ],
            optional: [
                { jsx: Number, name: 'Total Amount', key: 'amount', type: 'int', placeholder: '1', tooltip: 'Number of items to be picked up, in total.', config: { min: 0, undefinedValue: 0 } },
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/MobKillObjective.java
        value: 'mobkill',
        display: 'Entity Kill',
        description: 'The player must kill the specified amount of entities.',
        // e.g. mobkill ZOMBIE 5 name:Uber_Zombie conditions:night
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/FishObjective.java
        value: 'brew',
        display: 'Potion Brewing',
        description: 'The player needs to brew specified amount of specified potions.',
        // e.g. brew weird_concoction 4 event:add_tag
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ShearObjective.java
        value: 'shear',
        display: 'Sheep Shearing',
        description: 'The player has to shear specified amount of sheep.',
        // e.g. shear 1 name:Bob color:black
        // e.g. shear 1 name:jeb\_
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/SmeltingObjective.java
        value: 'smelt',
        display: 'Smelting',
        description: 'The player must smelt the specified item.',
        // e.g. smelt IRON_INGOT 5 events:reward
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Item', type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: 'The item that must be smelt' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of items to be smelt', config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: 'Notify', key: 'notify', type: 'int', placeholder: '(none)', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/StepObjective.java
        value: 'step',
        display: 'Step on a Pressure Plate',
        description: 'The player has to step on a pressure plate at a given location. The type of plate does not matter.',
        // e.g. step 100;200;300;world events:done
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/TameObjective.java
        value: 'tame',
        display: 'Taming',
        description: 'The player must tame some amount of mobs.',
        // tame WOLF 2 events:wolfs_tamed
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Type', type: 'string', defaultValue: 'WOLF' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of mobs', config: { min: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/JumpObjective.java
        value: 'jump',
        display: 'Player Jump',
        description: <><div>The player must jump.</div><div>This feature requires <a href="https://papermc.io/" target="_blank">Paper</a>.</div></>,
        // e.g. jump 15 events:legExerciseDone
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1, tooltip: 'Number of jumps', config: { min: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/VehicleObjective.java
        value: 'ride',
        display: 'Ride an entity',
        description: 'The player must ride a specific entitiy',
        // e.g. riding horse
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Type', type: 'string', defaultValue: 'any', tooltip: '"any" means any entities are ok' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/VariableObjective.java
        value: 'variable',
        display: 'Variable',
        description: <><div>tores custom variables. It also allows the player to set custom variables typed in chat with format "key: value".</div><div>For more details, please refer to the <a href="https://betonquest.org/1.12/User-Documentation/Objectives-List/#variable-variable" target="_blank">documentation</a>.</div></>,
        // e.g. variable
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Checkbox, name: 'Through Events Only', key: 'no-chat', type: 'boolean', tooltip: 'Prevent players from changing variables through chat. All variales must be changed with a `variable` Event.' },
            ]
        }
    },
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