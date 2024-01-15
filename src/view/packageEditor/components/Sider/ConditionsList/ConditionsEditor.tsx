import React from "react";
import { DefaultOptionType } from "antd/es/select";

import L from "../../../../../i18n/i18n";
import Condition from "../../../../../betonquest/Condition";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import { ArgumentsPatternOptional } from "../../../../../betonquest/Arguments";

import Default from "./ConditionsEditor/Default";

import BaseLocation from "../CommonList/Input/BaseLocation";
import Biome from "../CommonList/Input/Biome";
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
import Variable from "../CommonList/Input/Variable";

// All kinds
const kinds: Kind<Condition>[] = [
    {
        value: '*',
        display: L("betonquest.v2.condition.*.display"),
        description: undefined,
        editorBody: Default,
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: L("betonquest.v2.condition.*.mandatory.value.name"), type: '*', defaultValue: '' },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/AdvancementCondition.java
        value: 'advancement',
        display: L("betonquest.v2.condition.advancement.display"),
        description: L("betonquest.v2.condition.advancement.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.advancement.mandatory.name.name"), type: 'string', defaultValue: 'minecraft:adventure/some_advancement', placeholder: 'e.g. minecraft:adventure/kill_a_mob', tooltip: L("betonquest.v2.condition.advancement.mandatory.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/ConjunctionCondition.java
        value: 'and',
        display: L("betonquest.v2.condition.and.display"),
        description: L("betonquest.v2.condition.and.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.condition.and.mandatory.conditionList.name"), type: 'string[,]', defaultValue: ['some_condition_1'], placeholder: 'e.g. some_condition_1', tooltip: L("betonquest.v2.condition.and.mandatory.conditionList.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/ArmorCondition.java
        value: 'armor',
        display: L("betonquest.v2.condition.armor.display"),
        description: L("betonquest.v2.condition.armor.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.armor.mandatory.item.name"), type: 'string', defaultValue: 'a_quest_item_1', placeholder: 'e.g. a_quest_item_1', tooltip: L("betonquest.v2.condition.armor.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/BiomeCondition.java
        value: 'biome',
        display: L("betonquest.v2.condition.biome.display"),
        description: L("betonquest.v2.condition.biome.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Biome, name: L("betonquest.v2.condition.biome.mandatory.biomeType.name"), type: 'string', defaultValue: 'CUSTOM', placeholder: 'e.g. SAVANNA_ROCK', tooltip: '', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/BurningCondition.java
        value: 'burning',
        display: L("betonquest.v2.condition.burning.display"),
        description: L("betonquest.v2.condition.burning.description"),
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/CheckCondition.java
        value: 'check',
        display: L("betonquest.v2.condition.check.display"),
        description: L("betonquest.v2.condition.check.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: L("betonquest.v2.condition.check.mandatory.conditions.name"), type: 'string[^]', defaultValue: [''] },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/ChestItemCondition.java
        value: 'chestitem',
        display: L("betonquest.v2.condition.chestitem.display"),
        description: L("betonquest.v2.condition.chestitem.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.condition.chestitem.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: L("betonquest.v2.condition.chestitem.mandatory.location.tooltip"), allowVariable: true },
                // TODO: Item ID itself not support variable, but amount does. Variable editing should be done inside ItemList.tsx
                { jsx: ItemList, name: L("betonquest.v2.condition.chestitem.mandatory.itemList.name"), type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/ConversationCondition.java
        value: 'conversation',
        display: L("betonquest.v2.condition.conversation.display"),
        description: L("betonquest.v2.condition.conversation.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.conversation.mandatory.conversationName.name"), type: 'string', defaultValue: 'a_conversation_1', placeholder: 'e.g. innkeeper', tooltip: L("betonquest.v2.condition.conversation.mandatory.conversationName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/DayOfWeekCondition.java
        value: 'dayofweek',
        display: L("betonquest.v2.condition.dayofweek.display"),
        description: L("betonquest.v2.condition.dayofweek.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.condition.dayofweek.mandatory.action.name"), type: 'string', defaultValue: 'monday', placeholder: 'e.g. any', tooltip: L("betonquest.v2.condition.dayofweek.mandatory.action.tooltip"), config: {
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
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/EffectCondition.java
        value: 'effect',
        display: L("betonquest.v2.condition.effect.display"),
        description: L("betonquest.v2.condition.effect.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: PotionEffectType, name: L("betonquest.v2.condition.effect.mandatory.effect.name"), type: 'string', defaultValue: 'SPEED', tooltip: L("betonquest.v2.condition.effect.mandatory.effect.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/conditions/EmptySlotsCondition.java
        value: 'empty',
        display: L("betonquest.v2.condition.empty.display"),
        description: L("betonquest.v2.condition.empty.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.condition.empty.mandatory.amount.name"), type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.condition.empty.optional.equal.name"), key: 'equal', type: 'boolean', tooltip: L("betonquest.v2.condition.empty.optional.equal.tooltip") },
            ]
        }
    },
    {
        value: 'entities',
        display: L("betonquest.v2.condition.entities.display"),
        description: L("betonquest.v2.condition.entities.description"),
        argumentsPattern: {
            mandatory: [
                // TODO: variable amount
                { jsx: EntityTypeListWithAmount, name: L("betonquest.v2.condition.entities.mandatory.type.name"), type: '[string:number?][,]', defaultValue: [['ZOMBIE', 1]], placeholder: ['', '1'] },
                { jsx: BaseLocation, name: L("betonquest.v2.condition.entities.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.condition.entities.mandatory.radius.name"), type: 'float', defaultValue: 1.0, tooltip: L("betonquest.v2.condition.entities.mandatory.radius.tooltip"), config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.condition.entities.optional.name.name"), key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v2.condition.entities.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: L("betonquest.v2.condition.entities.optional.marked.name"), key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v2.condition.entities.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'experience',
        display: L("betonquest.v2.condition.experience.display"),
        description: L("betonquest.v2.condition.experience.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.condition.experience.mandatory.level.name"), type: 'float', defaultValue: 1.0, tooltip: L("betonquest.v2.condition.experience.mandatory.level.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        value: 'facing',
        display: L("betonquest.v2.condition.facing.display"),
        description: L("betonquest.v2.condition.facing.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.condition.facing.mandatory.direction.name"), type: 'string', defaultValue: 'UP', placeholder: 'e.g. UP', tooltip: L("betonquest.v2.condition.facing.mandatory.direction.tooltip"),  config: {
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
        display: L("betonquest.v2.condition.fly.display"),
        description: L("betonquest.v2.condition.fly.description"),
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        value: 'gamemode',
        display: L("betonquest.v2.condition.gamemode.display"),
        description: L("betonquest.v2.condition.gamemode.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.condition.gamemode.mandatory.gameMode.name"), type: 'string', defaultValue: 'survival', placeholder: 'e.g. Survival', tooltip: L("betonquest.v2.condition.gamemode.mandatory.gameMode.tooltip"),  config: {
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
        value: 'globalpoint',
        display: L("betonquest.v2.condition.globalpoint.display"),
        description: L("betonquest.v2.condition.globalpoint.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.globalpoint.mandatory.name.name"), type: 'string', defaultValue: 'a_global_point_1', placeholder: 'e.g. a_global_point_1', tooltip: L("betonquest.v2.condition.globalpoint.mandatory.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.condition.globalpoint.mandatory.point.name"), type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.condition.globalpoint.optional.equal.name"), key: 'equal', type: 'boolean', tooltip: L("betonquest.v2.condition.globalpoint.optional.equal.tooltip") },
            ]
        }
    },
    {
        value: 'globaltag',
        display: L("betonquest.v2.condition.globaltag.display"),
        description: L("betonquest.v2.condition.globaltag.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.globaltag.mandatory.name.name"), type: 'string', defaultValue: 'a_global_tag_1', placeholder: 'e.g. a_global_tag_1', tooltip: L("betonquest.v2.condition.globaltag.mandatory.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'hand',
        display: L("betonquest.v2.condition.hand.display"),
        description: L("betonquest.v2.condition.hand.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.hand.mandatory.item.name"), type: 'string', defaultValue: 'a_quest_item_1', placeholder: 'e.g. a_quest_item_1', tooltip: L("betonquest.v2.condition.hand.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.condition.hand.optional.offhand.name"), key: 'offhand', type: 'boolean', tooltip: L("betonquest.v2.condition.hand.optional.offhand.tooltip") },
            ]
        }
    },
    {
        value: 'health',
        display: L("betonquest.v2.condition.health.display"),
        description: L("betonquest.v2.condition.health.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.condition.health.mandatory.health.name"), type: 'float', defaultValue: 0.0, tooltip: L("betonquest.v2.condition.health.mandatory.health.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        value: 'height',
        display: L("betonquest.v2.condition.height.display"),
        description: L("betonquest.v2.condition.height.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.condition.height.mandatory.height.name"), type: 'float', defaultValue: 255.0, tooltip: L("betonquest.v2.condition.height.mandatory.height.tooltip"), allowVariable: true },
            ]
        }
    },
    {
        value: 'hunger',
        display: L("betonquest.v2.condition.hunger.display"),
        description: L("betonquest.v2.condition.hunger.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.condition.hunger.mandatory.hungerLevel.name"), type: 'float', defaultValue: 0.0, tooltip: L("betonquest.v2.condition.hunger.mandatory.hungerLevel.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        value: 'inconversation',
        display: L("betonquest.v2.condition.inconversation.display"),
        description: L("betonquest.v2.condition.inconversation.description"),
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Input, name: L("betonquest.v2.condition.inconversation.optional.conversation.name"), key: 'conversation', type: 'string', placeholder: 'e.g. "innkeeper"', tooltip: L("betonquest.v2.condition.inconversation.optional.conversation.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'item',
        display: L("betonquest.v2.condition.item.display"),
        description: L("betonquest.v2.condition.item.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: L("betonquest.v2.condition.item.mandatory.itemList.name"), type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        value: 'itemdurability',
        display: L("betonquest.v2.condition.itemdurability.display"),
        description: L("betonquest.v2.condition.itemdurability.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.condition.itemdurability.mandatory.slot.name"), type: 'string', defaultValue: 'HAND', placeholder: 'e.g. HAND', config: {
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
                { jsx: Number, name: L("betonquest.v2.condition.itemdurability.mandatory.durability.name"), type: 'float', defaultValue: 0.0, tooltip: L("betonquest.v2.condition.itemdurability.mandatory.durability.tooltip"), config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.condition.itemdurability.optional.relative.name"), key: 'relative', type: 'boolean', tooltip: L("betonquest.v2.condition.itemdurability.optional.relative.tooltip") },
            ]
        }
    },
    {
        value: 'journal',
        display: L("betonquest.v2.condition.journal.display"),
        description: L("betonquest.v2.condition.journal.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.journal.mandatory.journalName.name"), type: 'string', defaultValue: 'a_journal_entry_1', placeholder: 'e.g. a_journal_entry_1', tooltip: L("betonquest.v2.condition.journal.mandatory.journalName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'language',
        display: L("betonquest.v2.condition.language.display"),
        description: L("betonquest.v2.condition.language.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.condition.language.mandatory.languageID.name"), type: 'string[,]', defaultValue: ['en'], placeholder: 'e.g. en', tooltip: L("betonquest.v2.condition.language.mandatory.languageID.tooltip"), config: { allowedPatterns: [/^[a-zA-Z_-]*$/] } },
            ]
        }
    },
    {
        value: 'location',
        display: L("betonquest.v2.condition.location.display"),
        description: L("betonquest.v2.condition.location.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.condition.location.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.condition.location.mandatory.radius.name"), type: 'float', defaultValue: 1.0, tooltip: L("betonquest.v2.condition.location.mandatory.radius.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // TODO: Custom editor for binary optional arguments
        value: 'looking',
        display: L("betonquest.v2.condition.looking.display"),
        description: L("betonquest.v2.condition.looking.description"),
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: BaseLocation, name: L("betonquest.v2.condition.looking.optional.loc.name"), key: 'loc', type: 'string', placeholder: 'e.g. 12.0;14.0;-15.0;world', config: { optional: true }, allowVariable: true },
                { jsx: BlockSelector, name: L("betonquest.v2.condition.looking.optional.type.name"), key: 'type', type: 'string', placeholder: 'e.g. AIR', tooltip: L("betonquest.v2.condition.looking.optional.type.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.condition.looking.optional.exactMatch.name"), key: 'exactMatch', type: 'boolean', tooltip: L("betonquest.v2.condition.looking.optional.exactMatch.tooltip") },
            ]
        }
    },
    {
        value: 'mooncycle',
        display: L("betonquest.v2.condition.mooncycle.display"),
        description: L("betonquest.v2.condition.mooncycle.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.condition.mooncycle.mandatory.phase.name"), type: 'int', defaultValue: '1', placeholder: 'e.g. Full Moon', config: {
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
        value: 'numbercompare',
        display: L("betonquest.v2.condition.numbercompare.display"),
        description: L("betonquest.v2.condition.numbercompare.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.numbercompare.mandatory.numberA.name"), type: 'string', defaultValue: '0', placeholder: 'e.g. %ph.other_plugin:points%', tooltip: L("betonquest.v2.condition.numbercompare.mandatory.numberA.tooltip"), config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                {
                    jsx: Select, name: L("betonquest.v2.condition.numbercompare.mandatory.compare.name"), type: 'string', defaultValue: '=', placeholder: 'e.g. =', config: {
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
                { jsx: Input, name: L("betonquest.v2.condition.numbercompare.mandatory.numberA.name"), type: 'string', defaultValue: '0', placeholder: 'e.g. %ph.other_plugin:points%', tooltip: L("betonquest.v2.condition.numbercompare.mandatory.numberA.tooltip"), config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
            ]
        }
    },
    {
        value: 'objective',
        display: L("betonquest.v2.condition.objective.display"),
        description: L("betonquest.v2.condition.objective.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.objective.mandatory.objectiveName.name"), type: 'string', defaultValue: 'an_objective_1', placeholder: 'e.g. objective_wood', tooltip: L("betonquest.v2.condition.objective.mandatory.objectiveName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'or',
        display: L("betonquest.v2.condition.or.display"),
        description: L("betonquest.v2.condition.or.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.condition.or.mandatory.conditionList.name"), type: 'string[,]', defaultValue: ['some_condition_1'], placeholder: 'e.g. some_condition_1', tooltip: L("betonquest.v2.condition.or.mandatory.conditionList.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'partialdate',
        display: L("betonquest.v2.condition.partialdate.display"),
        description: L("betonquest.v2.condition.partialdate.description"),
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Input, name: L("betonquest.v2.condition.partialdate.optional.day.name"), key: 'day', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: L("betonquest.v2.condition.partialdate.optional.day.tooltip"), config: { allowedPatterns: [/^[0-9-]*$/] } },
                { jsx: Input, name: L("betonquest.v2.condition.partialdate.optional.month.name"), key: 'month', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: L("betonquest.v2.condition.partialdate.optional.month.tooltip"), config: { allowedPatterns: [/^[0-9-]*$/] } },
                { jsx: Input, name: L("betonquest.v2.condition.partialdate.optional.year.name"), key: 'year', type: 'string[,]', placeholder: 'e.g. 2-4', tooltip: L("betonquest.v2.condition.partialdate.optional.year.tooltip"), config: { allowedPatterns: [/^[0-9-]*$/] } },
            ]
        }
    },
    {
        value: 'party',
        display: L("betonquest.v2.condition.party.display"),
        description: L("betonquest.v2.condition.party.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.condition.party.mandatory.distance.name"), type: 'float', defaultValue: 0.0, tooltip: L("betonquest.v2.condition.party.mandatory.distance.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: InputList, name: L("betonquest.v2.condition.party.mandatory.conditionNames.name"), type: 'string[,]', placeholder: '(none)', defaultValue: ['a_condition_1'], tooltip: L("betonquest.v2.condition.party.mandatory.conditionNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: InputList, name: L("betonquest.v2.condition.party.optional.every.name"), key: 'every', type: 'string[,]', placeholder: 'e.g. some_condition_1', tooltip: L("betonquest.v2.condition.party.optional.every.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: L("betonquest.v2.condition.party.optional.any.name"), key: 'any', type: 'string[,]', placeholder: 'e.g. some_condition_1', tooltip: L("betonquest.v2.condition.party.optional.any.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.condition.party.optional.count.name"), key: 'count', type: 'int', placeholder: '0', tooltip: L("betonquest.v2.condition.party.optional.count.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        value: 'permission',
        display: L("betonquest.v2.condition.permission.display"),
        description: L("betonquest.v2.condition.permission.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.permission.mandatory.permissionNode.name"), type: 'string', defaultValue: 'minecraft.command.op', placeholder: 'e.g. essentials.tpa', tooltip: L("betonquest.v2.condition.permission.mandatory.permissionNode.tooltip"), config: { allowedPatterns: [/^[a-zA-Z0-9\.!_-]*$/] } },
            ]
        }
    },
    {
        value: 'point',
        display: L("betonquest.v2.condition.point.display"),
        description: L("betonquest.v2.condition.point.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.point.mandatory.name.name"), type: 'string', defaultValue: 'a_point_1', placeholder: 'e.g. a_point_1', tooltip: L("betonquest.v2.condition.point.mandatory.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.condition.point.mandatory.point.name"), type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.condition.point.optional.equal.name"), key: 'equal', type: 'boolean', tooltip: L("betonquest.v2.condition.point.optional.equal.tooltip") },
            ]
        }
    },
    {
        value: 'ride',
        display: L("betonquest.v2.condition.ride.display"),
        description: L("betonquest.v2.condition.ride.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: L("betonquest.v2.condition.ride.mandatory.type.name"), type: 'string', defaultValue: 'any', tooltip: L("betonquest.v2.condition.ride.mandatory.type.tooltip") },
            ]
        }
    },
    {
        // TODO: Custom chance input, or seprated standalone editor
        value: 'random',
        display: L("betonquest.v2.condition.random.display"),
        description: L("betonquest.v2.condition.random.description"),
        argumentsPattern: {
            mandatory: [
                // TODO: Custom editor with variables support
                { jsx: Input, name: L("betonquest.v2.condition.random.mandatory.probability.name"), type: 'string', defaultValue: '0-100', placeholder: 'e.g. 12-100', tooltip: L("betonquest.v2.condition.random.mandatory.probability.tooltip"), config: { allowedPatterns: [/^[0-9-]*$/] } },
            ]
        }
    },
    {
        value: 'rating',
        display: L("betonquest.v2.condition.rating.display"),
        description: L("betonquest.v2.condition.rating.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.condition.rating.mandatory.amount.name"), type: 'int', defaultValue: 0, tooltip: L("betonquest.v2.condition.rating.mandatory.amount.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // TODO: Custom time range input, or seprated standalone editor
        value: 'realtime',
        display: L("betonquest.v2.condition.realtime.display"),
        description: L("betonquest.v2.condition.realtime.description"),
        argumentsPattern: {
            mandatory: [
                // TODO: Custom editor with variables support
                { jsx: Input, name: L("betonquest.v2.condition.realtime.mandatory.timeRange.name"), type: 'string', defaultValue: '0:00-23:59', placeholder: 'e.g. 8:00-13:30', tooltip: L("betonquest.v2.condition.realtime.mandatory.timeRange.tooltip"), config: { allowedPatterns: [/^[0-9:-]*$/] } },
            ]
        }
    },
    {
        value: 'score',
        display: L("betonquest.v2.condition.score.display"),
        description: L("betonquest.v2.condition.score.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.score.mandatory.objectiveName.name"), type: 'string', defaultValue: 'an_objective_1', placeholder: 'e.g. objective_wood', tooltip: L("betonquest.v2.condition.score.mandatory.objectiveName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.condition.score.mandatory.score.name"), type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        value: 'sneak',
        display: L("betonquest.v2.condition.sneak.display"),
        description: L("betonquest.v2.condition.sneak.description"),
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        value: 'stage',
        display: L("betonquest.v2.condition.stage.display"),
        description: L("betonquest.v2.condition.stage.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.stage.mandatory.objectiveName.name"), type: 'string', defaultValue: ['an_objective_1'], placeholder: 'e.g. an_objective_1', tooltip: L("betonquest.v2.condition.stage.mandatory.objectiveName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                {
                    jsx: Select, name: L("betonquest.v2.condition.stage.mandatory.compare.name"), type: 'string', defaultValue: '=', placeholder: 'e.g. =', config: {
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
                { jsx: Input, name: L("betonquest.v2.condition.stage.mandatory.stageName.name"), type: 'string', defaultValue: ['some_stage_1'], placeholder: 'e.g. stage_1', tooltip: L("betonquest.v2.condition.stage.mandatory.stageName.tooltip"), config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
            ]
        }
    },
    {
        value: 'tag',
        display: L("betonquest.v2.condition.tag.display"),
        description: L("betonquest.v2.condition.tag.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.tag.mandatory.tag.name"), type: 'string', defaultValue: 'a_tag_1', placeholder: 'e.g. a_tag_1', tooltip: L("betonquest.v2.condition.tag.mandatory.tag.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        value: 'testforblock',
        display: L("betonquest.v2.condition.testforblock.display"),
        description: L("betonquest.v2.condition.testforblock.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.condition.testforblock.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: L("betonquest.v2.condition.testforblock.mandatory.location.tooltip"), allowVariable: true },
                { jsx: BlockSelector, name: L("betonquest.v2.condition.testforblock.mandatory.typeOfBlock.name"), type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: L("betonquest.v2.condition.testforblock.mandatory.typeOfBlock.tooltip") },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.condition.testforblock.optional.exactMatch.name"), key: 'exactMatch', type: 'boolean', tooltip: L("betonquest.v2.condition.testforblock.optional.exactMatch.tooltip") },
            ]
        }
    },
    {
        value: 'time',
        display: L("betonquest.v2.condition.time.display"),
        description: L("betonquest.v2.condition.time.description"),
        argumentsPattern: {
            mandatory: [
                // TODO: Custom editor
                { jsx: Input, name: L("betonquest.v2.condition.time.mandatory.timeRange.name"), type: 'string', defaultValue: '0-23', placeholder: 'e.g. 2-16', tooltip: L("betonquest.v2.condition.time.mandatory.timeRange.tooltip"), config: { allowedPatterns: [/^[0-9-]*$/] } },
            ]
        }
    },
    {
        // TODO: Custom standalone editor for RegEx format checking
        value: 'variable',
        display: L("betonquest.v2.condition.variable.display"),
        description: L("betonquest.v2.condition.variable.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Variable, name: L("betonquest.v2.condition.variable.mandatory.variable.name"), type: 'string', defaultValue: '%%', placeholder: 'e.g. itemdurability.HAND', tooltip: L("betonquest.v2.condition.variable.mandatory.variable.tooltip") },
                { jsx: Input, name: L("betonquest.v2.condition.variable.mandatory.regEx.name"), type: 'string', defaultValue: 'some value', placeholder: 'e.g. 16', tooltip: L("betonquest.v2.condition.variable.mandatory.regEx.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.condition.variable.optional.forceSync.name"), key: 'forceSync', type: 'boolean', tooltip: L("betonquest.v2.condition.variable.optional.forceSync.tooltip") },
            ]
        }
    },
    {
        value: 'weather',
        display: L("betonquest.v2.condition.weather.display"),
        description: L("betonquest.v2.condition.weather.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.condition.weather.mandatory.type.name"), type: 'string', defaultValue: 'sun', placeholder: 'e.g. sun', config: {
                        options: [
                            {
                                label: L("betonquest.v2.condition.weather.mandatory.type.option.sun"), // TODO: i18n
                                value: 'sun'
                            },
                            {
                                label: L("betonquest.v2.condition.weather.mandatory.type.option.rain"), // TODO: i18n
                                value: 'rain'
                            },
                            {
                                label: L("betonquest.v2.condition.weather.mandatory.type.option.storm"), // TODO: i18n
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
        display: L("betonquest.v2.condition.world.display"),
        description: L("betonquest.v2.condition.world.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.condition.world.mandatory.world.name"), type: 'string', defaultValue: 'world', placeholder: 'e.g. world_the_end', tooltip: L("betonquest.v2.condition.world.mandatory.world.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
];


export default function (props: ListElementEditorProps<Condition>) {
    return (
        <CommonEditor<Condition> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}