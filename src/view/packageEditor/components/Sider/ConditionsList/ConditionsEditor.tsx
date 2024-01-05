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
import EntityTypeListWithAmount from "../CommonList/Input/EntityTypeListWithAmount";
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
                { jsx: Input, name: 'Name', type: 'string', defaultValue: 'minecraft:adventure/some_advancement', placeholder: 'e.g. minecraft:adventure/kill_a_mob', tooltip: 'Name of advancement', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'and',
        display: 'And',
        description: 'Checks if every conditions are met.',
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
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item_1', placeholder: 'e.g. a_quest_item_1', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
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
        description: 'Is the player on fire?',
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
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: 'Chest\'s location' },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        value: 'conversation',
        display: 'Conversation',
        description: 'Does the player could begin a specified conversation? It checks the conversation\'s starting options to see if any of them return true.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Conversation ID', type: 'string', defaultValue: 'a_conversation_1', placeholder: 'e.g. innkeeper', tooltip: 'ID of a conversation e.g. "innkeeper"', config: { allowedPatterns: [/^\S*$/] } },
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
            ],
            optional: [
                { jsx: Checkbox, name: 'Equal?', key: 'equal', type: 'boolean', tooltip: 'The player should have exact number of slots and no more' },
            ]
        }
    },
    {
        value: 'entities',
        display: 'Entities in Area',
        description: 'Are there any specified amount of mobs in an area?',
        argumentsPattern: {
            mandatory: [
                { jsx: EntityTypeListWithAmount, name: 'Type', type: '[string:number?][,]', defaultValue: [['ZOMBIE', 1]], placeholder: ['', '1'] },
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
    {
        value: 'fly',
        display: 'Fly',
        description: 'Is the player flying?',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        value: 'gamemode',
        display: 'Game Mode',
        description: 'Is the the player in a specified game mode?',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Game Mode', type: 'string', defaultValue: 'survival', placeholder: 'e.g. Survival', tooltip: 'What game mode the player should be?',  config: {
                        options: [
                            { label: 'Survival', value: 'survival' },
                            { label: 'Creative', value: 'creative' },
                            { label: 'Adventure', value: 'adventure' },
                        ] as DefaultOptionType[]
                    }
                },
            ]
        }
    },
    {
        value: 'globalpoint',
        display: 'Global Point',
        description: 'Is the global point equal or greater than a specified value?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name', type: 'string', defaultValue: 'a_global_point_1', placeholder: 'e.g. a_global_point_1', tooltip: 'The name of a Global Point', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Point', type: 'int', defaultValue: 0, config: { min: 0 } },
            ]
        }
    },
    {
        value: 'globaltag',
        display: 'Global Tag',
        description: 'Is the global tag exists?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name', type: 'string', defaultValue: 'a_global_tag_1', placeholder: 'e.g. a_global_tag_1', tooltip: 'Name of a Global Tag', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'hand',
        display: 'Item in Hand',
        description: 'Is the player holding a specific item on hand?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Item', type: 'string', defaultValue: 'a_quest_item_1', placeholder: 'e.g. a_quest_item_1', tooltip: 'Quest\'s item name', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Off-Hand?', key: 'offhand', type: 'boolean', tooltip: 'Check off-hand instead?' },
            ]
        }
    },
    {
        value: 'health',
        display: 'Health',
        description: 'Does the player have equal or more health than specified amount?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Health', type: 'float', defaultValue: 0.0, tooltip: 'Health level could be a decimal', config: { min: 0 } },
            ]
        }
    },
    {
        value: 'height',
        display: 'Height',
        description: 'Does the player stand BELOW specific height?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Height', type: 'float', defaultValue: 255.0, tooltip: 'Height Y could be a decimal' },
            ]
        }
    },
    {
        value: 'hunger',
        display: 'Hunger',
        description: 'Does the player have equal or more specified Hunger Level? Note that the player can not sprint if the hunger level is below 7.',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Hunger Level', type: 'float', defaultValue: 0.0, tooltip: 'Hunger Level could be a decimal', config: { min: 0 } },
            ]
        }
    },
    {
        value: 'inconversation',
        display: 'In Conversation',
        description: 'Is the player in a conversation?',
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Input, name: 'Conversation ID', key: 'conversation', type: 'string', placeholder: 'e.g. "innkeeper"', tooltip: 'ID of a conversation e.g. "innkeeper"', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'item',
        display: 'Item in Inventory',
        description: 'Does the player have all the specified items in inventory?',
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        value: 'itemdurability',
        display: 'Durability of Item',
        description: 'Does the player have a certain amount of durability on an item? Will return false if the item does not have durability e.g. stone, stick.',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Slot', type: 'string', defaultValue: 'HAND', placeholder: 'e.g. HAND', config: {
                        options: [
                            { label: 'Hand', value: 'HAND' },
                            { label: 'Off-Hand', value: 'OFF_HAND' },
                            { label: 'Head', value: 'HEAD' },
                            { label: 'Chest', value: 'CHEST' },
                            { label: 'Legs', value: 'LEGS' },
                            { label: 'Feet', value: 'FEET' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Number, name: 'Durability', type: 'float', defaultValue: 0.0, tooltip: 'Durability could be a decimal', config: { min: 0 } },
            ],
            optional: [
                { jsx: Checkbox, name: '0-1 Scale?', key: 'relative', type: 'boolean', tooltip: 'Define the durability above on a 0.0 to 1.0 scale? Instead of a real value, you can define 0.0 as completely broken, 1.0 as maximun durability.' },
            ]
        }
    },
    {
        value: 'journal',
        display: 'Journal Entry',
        description: 'Does the player have a specified entry in his/her journal?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Journal Name', type: 'string', defaultValue: 'a_journal_entry_1', placeholder: 'e.g. a_journal_entry_1', tooltip: 'An internal name of the entry defined in the `journal` section', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'language',
        display: 'Language',
        description: 'Does the player has one of the specified languages selected as their quest language?',
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Language ID', type: 'string[,]', defaultValue: ['en'], placeholder: 'e.g. en', tooltip: 'IDs of language', config: { allowedPatterns: [/^[a-zA-Z_-]*$/] } },
            ]
        }
    },
    {
        value: 'location',
        display: 'Location',
        description: 'Does the player stand within a specified location?',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 1.0, tooltip: 'A radius around the location', config: { min: 0 } },
            ]
        }
    },
    {
        // TODO: Custom editor for binary optional arguments
        value: 'looking',
        display: 'Looking at a Block',
        description: 'Does the player looking at a block? You must specified either a Location or Type of Block.',
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: BaseLocation, name: 'Location', key: 'loc', type: 'string', placeholder: 'e.g. 12.0;14.0;-15.0;world', config: { optional: true } },
                { jsx: BlockSelector, name: 'Type of Block', key: 'type', type: 'string', placeholder: 'e.g. AIR', tooltip: 'Type of Block' },
            ]
        }
    },
    {
        value: 'mooncycle',
        display: 'Moon Cycle',
        description: 'Is the phase of the moon the same as specified?',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Phase', type: 'string', defaultValue: '1', placeholder: 'e.g. Full Moon', config: {
                        options: [
                            { label: '🌕 Full Moon', value: '1' },
                            { label: '🌖 Waning Gibbous', value: '2' },
                            { label: '🌗 Last Quarter', value: '3' },
                            { label: '🌘 Waning Crescent', value: '4' },
                            { label: '🌑 New Moon', value: '5' },
                            { label: '🌒 Waxing Crescent', value: '6' },
                            { label: '🌓 First Quarter', value: '7' },
                            { label: '🌔 Waxing Gibbous', value: '8' },
                        ] as DefaultOptionType[]
                    }
                },
            ]
        }
    },
    {
        value: 'numbercompare',
        display: 'Compare Number',
        description: 'Is one number greater / less / equals to another?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Number A', type: 'string', defaultValue: '0', placeholder: 'e.g. %ph.other_plugin:points%', tooltip: 'Could be a variable', config: { allowedPatterns: [/^\S*$/] } },
                {
                    jsx: Select, name: 'Compare', type: 'string', defaultValue: '=', placeholder: 'e.g. =', config: {
                        options: [
                            { label: '<  less than', value: '<' },
                            { label: '<= less or equals to', value: '<=' },
                            { label: '=  equals to', value: '=' },
                            { label: '!= not equals to', value: '!=' },
                            { label: '>  greater than', value: '>' },
                            { label: '>= greater or equals to', value: '>=' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Input, name: 'Number A', type: 'string', defaultValue: '0', placeholder: 'e.g. %ph.other_plugin:points%', tooltip: 'Could be a variable', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'objective',
        display: 'Objective',
        description: 'Does the player have an active objective?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name of Objective', type: 'string', defaultValue: 'an_objective_1', placeholder: 'e.g. objective_wood', tooltip: 'ID of an Objective', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'or',
        display: 'Alternative',
        description: 'Checks if any one condition is met.',
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Condition List', type: 'string[,]', defaultValue: ['some_condition_1'], placeholder: 'e.g. some_condition_1', tooltip: 'The conditions that must be met', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'partialdate',
        display: 'Partial Date',
        description: 'Does the current date match a given pattern?',
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: InputList, name: 'Day of Month', key: 'day', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: 'The day of the month, e.g. 2 means 2nd of every month', config: { allowedPatterns: [/^[0-9-]*$/] } },
                { jsx: InputList, name: 'Month', key: 'month', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: 'The month of the year, e.g. 2-4 means from February to April', config: { allowedPatterns: [/^[0-9-]*$/] } },
                { jsx: InputList, name: 'Year', key: 'year', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: 'Year, e.g. 2024-2025', config: { allowedPatterns: [/^[0-9-]*$/] } },
            ]
        }
    },
    {
        value: 'party',
        display: 'Party',
        description: 'Check conditions within party members.',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Distance', type: 'float', defaultValue: 0.0, tooltip: 'The coverage distance from the player whom triggers this condition', config: { min: 0 } },
                { jsx: InputList, name: 'Condition Names', type: 'string[,]', placeholder: '(none)', defaultValue: ['a_condition_1'], tooltip: 'Party member will be selected with these conditions', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: InputList, name: 'Every', key: 'every', type: 'string[,]', placeholder: 'e.g. some_condition_1', tooltip: 'The conditions that must be met by all party members', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: 'Any', key: 'any', type: 'string[,]', placeholder: 'e.g. some_condition_1', tooltip: 'The conditions that only need to be met by one party member', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Members', key: 'count', type: 'int', placeholder: '0', tooltip: 'Minimun amount of members in the party', config: { min: 0 } },
            ]
        }
    },
    {
        value: 'permission',
        display: 'Permission',
        description: 'Does the player have a specific permission node?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Permission Node', type: 'string', defaultValue: 'minecraft.command.op', placeholder: 'e.g. essentials.tpa', tooltip: 'Permission node', config: { allowedPatterns: [/^[a-zA-Z0-9\.!_-]*$/] } },
            ]
        }
    },
    {
        value: 'point',
        display: 'Point',
        description: 'Does the player have enough points?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name', type: 'string', defaultValue: 'a_point_1', placeholder: 'e.g. a_point_1', tooltip: 'The name of a Point', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Point', type: 'int', defaultValue: 0, config: { min: 0 } },
            ]
        }
    },
    {
        value: 'ride',
        display: 'Ride an Entity',
        description: 'Is the player riding an entity?',
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Type', type: 'string', defaultValue: 'any', tooltip: '"any" means any entities are ok' },
            ]
        }
    },
    {
        // TODO: Custom chance input, or seprated standalone editor
        value: 'random',
        display: 'Random',
        description: 'Randomly return true by probability',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Probability', type: 'string', defaultValue: '0-100', placeholder: 'e.g. 12-100', tooltip: 'e.g. 12-100 means 12 out of 100 times return true', config: { allowedPatterns: [/^[0-9-]*$/] } },
            ]
        }
    },
    {
        value: 'rating',
        display: 'Armor Rating',
        description: 'Is the armor have enough protection (armor icons) the plaryer wearing?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 0, tooltip: 'Increament by 1, equals to 0.5 armor icon in-game', config: { min: 0 } },
            ]
        }
    },
    {
        // TODO: Custom time range input, or seprated standalone editor
        value: 'realtime',
        display: 'Real Time',
        description: 'Is the current real-world\'s time within a range?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Time Range', type: 'string', defaultValue: '0:00-23:59', placeholder: 'e.g. 8:00-13:30', tooltip: '24-Hour format, seprated by a dash "-"', config: { allowedPatterns: [/^[0-9:-]*$/] } },
            ]
        }
    },
    {
        value: 'score',
        display: 'Objective Scoreboard',
        description: 'Does the playe gained enough score in a specified objective on a scoreboard?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name of Objective', type: 'string', defaultValue: 'an_objective_1', placeholder: 'e.g. objective_wood', tooltip: 'ID of an Objective', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Score', type: 'int', defaultValue: 0, config: { min: 0 } },
            ]
        }
    },
    {
        value: 'sneak',
        display: 'Sneaking',
        description: 'Is the player sneaking? (Pressing Ctrl-key)',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        value: 'stage',
        display: 'Check Stage',
        description: 'Compares the players current stage with the given stage by its index numbers.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Objective Name', type: 'string', defaultValue: ['an_objective_1'], placeholder: 'e.g. an_objective_1', tooltip: 'The ID of a stage Objective', config: { allowedPatterns: [/^\S*$/] } },
                {
                    jsx: Select, name: 'Compare', type: 'string', defaultValue: '=', placeholder: 'e.g. =', config: {
                        options: [
                            { label: '<  less than', value: '<' },
                            { label: '<= less or equals to', value: '<=' },
                            { label: '=  equals to', value: '=' },
                            { label: '!= not equals to', value: '!=' },
                            { label: '>  greater than', value: '>' },
                            { label: '>= greater or equals to', value: '>=' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Input, name: 'Stage Name', type: 'string', defaultValue: ['some_stage_1'], placeholder: 'e.g. stage_1', tooltip: 'Name of a stage', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'tag',
        display: 'Tag',
        description: 'Does the player have a specified tag?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Tag', type: 'string', defaultValue: 'a_tag_1', placeholder: 'e.g. a_tag_1', tooltip: 'Name of a tag', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'testforblock',
        display: 'Test for block',
        description: 'Is there a specific block on a location?',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: 'Block\'s location' },
                { jsx: BlockSelector, name: 'Type of Block', type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: 'Type of Block' },
            ]
        }
    },
    {
        value: 'time',
        display: 'Time',
        description: 'Is the in-game time within a specific range?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Time Range', type: 'string', defaultValue: '0-23', placeholder: 'e.g. 2-16', tooltip: 'Hour, 0 to 24', config: { allowedPatterns: [/^[0-9-]*$/] } },
            ]
        }
    },
    {
        // TODO: Custom standalone editor for RegEx format checking
        value: 'variable',
        display: 'Variable',
        description: 'Is a variable match a regular expression?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Variable', type: 'string', defaultValue: '', placeholder: 'e.g.', tooltip: '', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'RegEx', type: 'string', defaultValue: '', placeholder: 'e.g.', tooltip: '', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Run on the Main Thread?', key: 'forceSync', type: 'boolean', tooltip: 'Force the checking to be run on the main thread? This is only required by some third-party pluings.' },
            ]
        }
    },
    {
        value: 'weather',
        display: 'Weather',
        description: 'Is the weather matched? Note that you need to use `/weather` to change the weather for this to take effects, NOT `/toggledownfall`.',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Type', type: 'string', defaultValue: 'sun', placeholder: 'e.g. sun', config: {
                        options: [
                            {
                                label: 'Sun', // TODO: i18n
                                value: 'sun'
                            },
                            {
                                label: 'Rain', // TODO: i18n
                                value: 'rain'
                            },
                            {
                                label: 'Storm', // TODO: i18n
                                value: 'storm'
                            },
                        ] as DefaultOptionType[]
                    }
                }
            ]
        }
    },
    {
        value: 'world',
        display: 'World',
        description: 'Is the player staying in a specified world?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'World', type: 'string', defaultValue: 'world', placeholder: 'e.g. world_the_end', tooltip: 'Name of the world', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
];


export default function (props: ListElementEditorProps<Condition>) {
    return (
        <CommonEditor<Condition> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}