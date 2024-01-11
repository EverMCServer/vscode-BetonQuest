import React from "react";
import { DefaultOptionType } from "antd/es/select";

import Condition from "../../../betonquest/Condition";
import { Kind, ListElementEditorProps } from "../../legacyListEditor/components/CommonList/CommonEditor";
import CommonEditor from "../../legacyListEditor/components/CommonList/CommonEditor";
import { ArgumentsPatternOptional } from "../../../betonquest/Arguments";

import Default from "./ConditionsEditor/Default";

import BaseLocation from "../../legacyListEditor/components/CommonList/Input/BaseLocation";
import Biome from "../../legacyListEditor/components/CommonList/Input/Biome";
import BlockSelector from "../../legacyListEditor/components/CommonList/Input/BlockSelector";
import Checkbox from "../../legacyListEditor/components/CommonList/Input/Checkbox";
import EntityType from "../../legacyListEditor/components/CommonList/Input/EntityType";
import EntityTypeList from "../../legacyListEditor/components/CommonList/Input/EntityTypeList";
import EntityTypeListWithAmount from "../../legacyListEditor/components/CommonList/Input/EntityTypeListWithAmount";
import Input from "../../legacyListEditor/components/CommonList/Input/Input";
import InputList from "../../legacyListEditor/components/CommonList/Input/InputList";
import ItemList from "../../legacyListEditor/components/CommonList/Input/ItemList";
import Number from "../../legacyListEditor/components/CommonList/Input/Number";
import PotionEffectType from "../../legacyListEditor/components/CommonList/Input/PotionEffectType";
import PotionEffectTypeList from "../../legacyListEditor/components/CommonList/Input/PotionEffectTypeList";
import Select from "../../legacyListEditor/components/CommonList/Input/Select";
import TextArea from "../../legacyListEditor/components/CommonList/Input/TextArea";
import TextAreaList from "../../legacyListEditor/components/CommonList/Input/TextAreaList";
import Variable from "../../legacyListEditor/components/CommonList/Input/Variable";

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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/AdvancementCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ConjunctionCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ArmorCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/BiomeCondition.java
        value: 'biome',
        display: 'Biome',
        description: 'Does the player inside a specific biome?',
        argumentsPattern: {
            mandatory: [
                { jsx: Biome, name: 'Biome Type', type: 'string', defaultValue: 'CUSTOM', placeholder: 'e.g. SAVANNA_ROCK', tooltip: '', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/CheckCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ChestItemCondition.java
        value: 'chestitem',
        display: 'Chest Item',
        description: 'Does a chest have specific items?',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: 'Chest\'s location', allowVariable: true },
                // TODO: Item ID itself not support variable, but amount does. Variable editing should be done inside ItemList.tsx
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ConversationCondition.java
        value: 'conversation',
        display: 'Conversation',
        description: 'Does the player could begin a specified conversation? It checks the conversation\'s start options to see if any of them return true.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Conversation Name', type: 'string', defaultValue: 'a_conversation_1', placeholder: 'e.g. innkeeper', tooltip: 'Name of a conversation e.g. "innkeeper"', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/DayOfWeekCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/EffectCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/EmptySlotsCondition.java
        value: 'empty',
        display: 'Empty Inventory Slots',
        description: 'Does the player\'s inventory have enough empty slots?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'Equal?', key: 'equal', type: 'boolean', tooltip: 'The player should have exact number of slots and no more' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/EntityCondition.java
        value: 'entities',
        display: 'Entities in Area',
        description: 'Are there any specified amount of mobs in an area?',
        argumentsPattern: {
            mandatory: [
                { jsx: EntityTypeListWithAmount, name: 'Type', type: '[string:number?][,]', defaultValue: [['ZOMBIE', 1]], placeholder: ['', '1'] },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 1.0, tooltip: 'A radius around location where the mobs must be', config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mob', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Should the mobs have the same mark from the spawn mob event?', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ExperienceCondition.java
        value: 'experience',
        display: 'Experience',
        description: 'Does the player have the specified amount of experience levels?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 1.0, tooltip: 'Number could be a decimal', config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'Level?', key: 'level', type: 'boolean', tooltip: 'Unit in level instead of experience point?' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/FacingCondition.java
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
                            { label: 'South', value: 'SOUTH' },
                            { label: 'West', value: 'WEST' },
                            { label: 'Up (>60°)', value: 'UP' },
                            { label: 'Down (>60°)', value: 'DOWN' },
                        ] as DefaultOptionType[]
                    }
                },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/FlyingCondition.java
        value: 'fly',
        display: 'Fly',
        description: 'Is the player flying?',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/GameModeCondition.java
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
                            { label: 'Spectator', value: 'spectator' },
                        ] as DefaultOptionType[]
                    }
                },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/GlobalPointCondition.java
        value: 'globalpoint',
        display: 'Global Point',
        description: 'Is the global point equal or greater than a specified value?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name', type: 'string', defaultValue: 'a_global_point_1', placeholder: 'e.g. a_global_point_1', tooltip: 'The name of Global Point', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Point', type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'Equal?', key: 'equal', type: 'boolean', tooltip: 'The Global Point should have exact number of points and no more' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/GlobalTagCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/HandCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/HealthCondition.java
        value: 'health',
        display: 'Health',
        description: 'Does the player have equal or more health than specified amount?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Health', type: 'float', defaultValue: 0.0, tooltip: 'Health level could be a decimal', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/HeightCondition.java
        value: 'height',
        display: 'Height',
        description: 'Does the player stand BELOW specific height?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Height', type: 'float', defaultValue: 255.0, tooltip: 'Height Y could be a decimal', allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ItemCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/JournalCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/LocationCondition.java
        value: 'location',
        display: 'Location',
        description: 'Does the player stand within a specified location?',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 1.0, tooltip: 'A radius around the location', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/LookingAtCondition.java
        // TODO: Custom editor for binary optional arguments
        value: 'looking',
        display: 'Looking at a Block',
        description: 'Does the player looking at a block? You must specified either a Location or Type of Block.',
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: BaseLocation, name: 'Location', key: 'loc', type: 'string', placeholder: 'e.g. 12.0;14.0;-15.0;world', config: { optional: true }, allowVariable: true },
                { jsx: BlockSelector, name: 'Type of Block', key: 'type', type: 'string', placeholder: 'e.g. AIR', tooltip: 'Type of Block' },
                { jsx: Checkbox, name: 'Exact State?', key: 'exactMatch', type: 'boolean', tooltip: 'The target block is not allowed to have more BlockStates than specified' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/MooncycleCondition.java
        value: 'mooncycle',
        display: 'Moon Cycle',
        description: 'Is the phase of the moon the same as specified?',
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Phase', type: 'int', defaultValue: '1', placeholder: 'e.g. Full Moon', config: {
                        options: [
                            { label: '🌕 Full Moon', value: 1 },
                            { label: '🌖 Waning Gibbous', value: 2 },
                            { label: '🌗 Last Quarter', value: 3 },
                            { label: '🌘 Waning Crescent', value: 4 },
                            { label: '🌑 New Moon', value: 5 },
                            { label: '🌒 Waxing Crescent', value: 6 },
                            { label: '🌓 First Quarter', value: 7 },
                            { label: '🌔 Waxing Gibbous', value: 8 },
                        ] as DefaultOptionType[]
                    }, allowVariable: true
                },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ObjectiveCondition.java
        value: 'objective',
        display: 'Objective',
        description: 'Does the player have an active objective?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Objective Name', type: 'string', defaultValue: 'an_objective_1', placeholder: 'e.g. objective_wood', tooltip: 'Name of an Objective', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/AlternativeCondition.java
        value: 'or',
        display: 'Alternative Conditions',
        description: 'Checks if any one condition is met.',
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Condition List', type: 'string[,]', defaultValue: ['some_condition_1'], placeholder: 'e.g. some_condition_1', tooltip: 'The conditions that must be met', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/PartialDateCondition.java
        value: 'partialdate',
        display: 'Partial Date',
        description: 'Does the current date match a given pattern?',
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Input, name: 'Day of Month', key: 'day', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: 'The day of the month, e.g. 2 means 2nd of every month', config: { allowedPatterns: [/^[0-9-]*$/] } },
                { jsx: Input, name: 'Month', key: 'month', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: 'The month of the year, e.g. 2-4 means from February to April', config: { allowedPatterns: [/^[0-9-]*$/] } },
                { jsx: Input, name: 'Year', key: 'year', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: 'Year, e.g. 2024-2025', config: { allowedPatterns: [/^[0-9-]*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/PartyCondition.java
        value: 'party',
        display: 'Party',
        description: 'Check conditions within party members.',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Distance', type: 'float', defaultValue: 0.0, tooltip: 'The coverage distance from the player whom triggers this condition', config: { min: 0 }, allowVariable: true },
                { jsx: InputList, name: 'Condition Names', type: 'string[,]', placeholder: '(none)', defaultValue: ['a_condition_1'], tooltip: 'Party member will be selected with these conditions', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: InputList, name: 'Everyone', key: 'every', type: 'string[,]', placeholder: 'e.g. some_condition_1', tooltip: 'The conditions that must be met by all party members', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: 'Anyone', key: 'any', type: 'string[,]', placeholder: 'e.g. some_condition_1', tooltip: 'The conditions that only need to be met by one party member', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Count', key: 'count', type: 'int', placeholder: '0', tooltip: 'Minimun amount of members in the party', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/PermissionCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/PointCondition.java
        value: 'point',
        display: 'Point',
        description: 'Does the player have enough points?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name', type: 'string', defaultValue: 'a_point_1', placeholder: 'e.g. a_point_1', tooltip: 'The name of a Point', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Point', type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'Equal?', key: 'equal', type: 'boolean', tooltip: 'The player should have exact number of points and no more' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/VehicleCondition.java
        value: 'riding',
        display: 'Ride an Entity',
        description: 'Is the player riding an entity?',
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Type', type: 'string', defaultValue: 'any', tooltip: '"any" means any entities are ok' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/RandomCondition.java
        // TODO: Custom chance input, or seprated standalone editor
        value: 'random',
        display: 'Random',
        description: 'Randomly return true by probability',
        argumentsPattern: {
            mandatory: [
                // TODO: variable support
                { jsx: Input, name: 'Probability', type: 'string', defaultValue: '0-100', placeholder: 'e.g. 12-100', tooltip: 'e.g. 12-100 means 12 out of 100 times return true', config: { allowedPatterns: [/^[0-9-]*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ArmorRatingCondition.java
        value: 'rating',
        display: 'Armor Rating',
        description: 'Is the armor have enough protection (armor icons) the plaryer wearing?',
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 0, tooltip: 'Increament by 1, equals to 0.5 armor icon in-game', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/RealTimeCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/ScoreboardCondition.java
        value: 'score',
        display: 'Objective Scoreboard',
        description: 'Does the playe gained enough score in a specified objective on a scoreboard?',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Objective Name', type: 'string', defaultValue: 'an_objective_1', placeholder: 'e.g. objective_wood', tooltip: 'Name of an Objective', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: 'Score', type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/SneakCondition.java
        value: 'sneak',
        display: 'Sneaking',
        description: 'Is the player sneaking? (Pressing Ctrl-key)',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/TagCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/TestForBlockCondition.java
        value: 'testforblock',
        display: 'Test for block',
        description: 'Is there a specific block on a location?',
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: 'Block\'s location', allowVariable: true },
                { jsx: BlockSelector, name: 'Type of Block', type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: 'Type of Block' },
            ],
            optional: [
                { jsx: Checkbox, name: 'Exact State?', key: 'exactMatch', type: 'boolean', tooltip: 'The target block is not allowed to have more BlockStates than specified' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/TimeCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/VariableCondition.java
        // TODO: Custom standalone editor for RegEx format checking
        value: 'variable',
        display: 'Variable',
        description: 'Is a variable match a regular expression?',
        argumentsPattern: {
            mandatory: [
                { jsx: Variable, name: 'Variable', type: 'string', defaultValue: '%unknown.variable%', placeholder: 'e.g. itemdurability.HAND', tooltip: 'Name of a Variable' },
                { jsx: Input, name: 'RegEx', type: 'string', defaultValue: 'some value', placeholder: 'e.g. 16', tooltip: '', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/WeatherCondition.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/conditions/WorldCondition.java
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