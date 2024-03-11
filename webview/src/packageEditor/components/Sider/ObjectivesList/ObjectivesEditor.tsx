import { DefaultOptionType } from "antd/es/select";

import L from "betonquest-utils/i18n/i18n";
import Objective from "betonquest-utils/betonquest/Objective";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

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
    { jsx: InputList, name: L("betonquest.v1.objective.*.optional.conditions.name"), key: 'conditions', type: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.*.optional.conditions.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
    { jsx: InputList, name: L("betonquest.v1.objective.*.optional.events.name"), key: 'events', type: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.*.optional.events.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
];

// All kinds
const kinds: Kind<Objective>[] = ([
    {
        value: '*',
        display: L("betonquest.v2.objective.*.display"),
        description: undefined,
        editorBody: Default,
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: L("betonquest.v2.objective.*.mandatory.value.name"), type: '*', defaultValue: '' },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/ActionObjective.java
        value: 'action',
        display: L("betonquest.v2.objective.action.display"),
        description: L("betonquest.v2.objective.action.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.objective.action.mandatory.action.name"), type: 'string', defaultValue: 'any', placeholder: 'e.g. any', tooltip: L("betonquest.v2.objective.action.mandatory.action.tooltip"), config: {
                        options: [
                            { label: 'Any', value: 'any' },
                            { label: 'Right', value: 'right' },
                            { label: 'Left', value: 'left' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: BlockSelector, name: L("betonquest.v2.objective.action.mandatory.block.name"), type: 'string', defaultValue: 'any', placeholder: 'e.g. AIR', tooltip: L("betonquest.v2.objective.action.mandatory.block.tooltip") },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.objective.action.optional.exactMatch.name"), key: 'exactMatch', type: 'boolean', tooltip: L("betonquest.v2.objective.action.optional.exactMatch.tooltip") },
                { jsx: BaseLocation, name: L("betonquest.v2.objective.action.optional.loc.name"), key: 'loc', type: 'string', config: { optional: true }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.action.optional.range.name"), key: 'range', type: 'float', placeholder: '1', config: { min: 0, undefinedValue: 0 }, allowVariable: true },
                { jsx: Checkbox, name: L("betonquest.v2.objective.action.optional.cancel.name"), key: 'cancel', type: 'boolean', tooltip: L("betonquest.v2.objective.action.optional.cancel.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/ArrowShootObjective.java
        value: 'arrow',
        display: L("betonquest.v2.objective.arrow.display"),
        description: L("betonquest.v2.objective.arrow.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.objective.arrow.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.arrow.mandatory.precisionRadius.name"), type: 'float', defaultValue: 1.0, tooltip: L("betonquest.v2.objective.arrow.mandatory.precisionRadius.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/BlockObjective.java
        value: 'block',
        display: L("betonquest.v2.objective.block.display"),
        description: L("betonquest.v2.objective.block.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: L("betonquest.v2.objective.block.mandatory.block.name"), type: 'string', defaultValue: 'any', placeholder: 'e.g. AIR', tooltip: L("betonquest.v2.objective.block.mandatory.block.tooltip") },
                { jsx: Number, name: L("betonquest.v2.objective.block.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.block.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.objective.block.optional.exactMatch.name"), key: 'exactMatch', type: 'boolean', tooltip: L("betonquest.v2.objective.block.optional.exactMatch.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.objective.block.optional.noSafety.name"), key: 'noSafety', type: 'boolean', tooltip: L("betonquest.v2.objective.block.optional.noSafety.tooltip") },
                { jsx: Number, name: L("betonquest.v2.objective.block.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.block.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
                // { jsx: OptionalNumber, name: 'Notify', key: 'notify', type: 'int', placeholder: '1', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, setMinToNull: true } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/BreedObjective.java
        value: 'breed',
        display: L("betonquest.v2.objective.breed.display"),
        description: L("betonquest.v2.objective.breed.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: L("betonquest.v2.objective.breed.mandatory.type.name"), type: 'string', defaultValue: 'PIG' },
                { jsx: Number, name: L("betonquest.v2.objective.breed.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.breed.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.breed.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.breed.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/ChestPutObjective.java
        value: 'chestput',
        display: L("betonquest.v2.objective.chestput.display"),
        description: L("betonquest.v2.objective.chestput.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.objective.chestput.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', tooltip: L("betonquest.v2.objective.chestput.mandatory.location.tooltip"), allowVariable: true },
                { jsx: ItemList, name: L("betonquest.v2.objective.chestput.mandatory.itemList.name"), type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.objective.chestput.optional.items-stay.name"), key: 'items-stay', type: 'boolean', tooltip: L("betonquest.v2.objective.chestput.optional.items-stay.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.objective.chestput.optional.multipleaccess.name"), key: 'multipleaccess', type: 'boolean', tooltip: L("betonquest.v2.objective.chestput.optional.multipleaccess.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/BlockObjective.java
        value: 'consume',
        display: L("betonquest.v2.objective.consume.display"),
        description: L("betonquest.v2.objective.consume.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.objective.consume.mandatory.item.name"), type: 'string', defaultValue: 'a_quest_item', tooltip: L("betonquest.v2.objective.consume.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.consume.optional.amount.name"), key: 'amount', type: 'int', tooltip: L("betonquest.v2.objective.consume.optional.amount.tooltip"), placeholder: '1', config: { min: 0, undefinedValue: 0 }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.consume.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.consume.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/CraftingObjective.java
        value: 'craft',
        display: L("betonquest.v2.objective.craft.display"),
        description: L("betonquest.v2.objective.craft.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.objective.craft.mandatory.item.name"), type: 'string', defaultValue: 'a_quest_item', tooltip: L("betonquest.v2.objective.craft.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.objective.craft.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.craft.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.craft.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.craft.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/EnchantObjective.java
        value: 'enchant',
        display: L("betonquest.v2.objective.enchant.display"),
        description: L("betonquest.v2.objective.enchant.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.objective.enchant.mandatory.item.name"), type: 'string', defaultValue: 'a_quest_item', tooltip: L("betonquest.v2.objective.enchant.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: EnchantmentList, name: L("betonquest.v2.objective.enchant.mandatory.enchantmentList.name"), type: '[string:number?][,]', defaultValue: [["", 1]], placeholder: ['e.g. ARROW_DAMAGE', '1'] },
            ],
            optional: [
                {
                    jsx: Select, name: L("betonquest.v2.objective.enchant.optional.requirementMode.name"), key: 'requirementMode', type: 'string', placeholder: 'all', tooltip: L("betonquest.v2.objective.enchant.optional.requirementMode.tooltip"), config: {
                        options: [
                            {
                                label: L("betonquest.v2.objective.enchant.optional.requirementMode.option.all"),
                                value: 'all'
                            },
                            {
                                label: L("betonquest.v2.objective.enchant.optional.requirementMode.option.one"),
                                value: 'one'
                            },
                        ] as DefaultOptionType[],
                        allowClear: true
                    }
                },
                { jsx: Number, name: L("betonquest.v2.objective.enchant.optional.amount.name"), key: 'amount', type: 'int', placeholder: '1', tooltip: L("betonquest.v2.objective.enchant.optional.amount.tooltip"), config: { min: 0, undefinedValue: 0 }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.enchant.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.enchant.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/ExperienceObjective.java
        value: 'experience',
        display: L("betonquest.v2.objective.experience.display"),
        description: L("betonquest.v2.objective.experience.description"),
        // e.g. experience 25 events:reward
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.objective.experience.mandatory.level.name"), type: 'float', defaultValue: 1.0, tooltip: L("betonquest.v2.objective.experience.mandatory.level.tooltip"), config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.experience.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.experience.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/DelayObjective.java
        value: 'delay',
        display: L("betonquest.v2.objective.delay.display"),
        description: L("betonquest.v2.objective.delay.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.objective.delay.mandatory.time.name"), type: 'int', defaultValue: 1.0, tooltip: L("betonquest.v2.objective.delay.mandatory.time.tooltip"), config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                // Bad design. Should use "Select" instead.
                // https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/objectives/DelayObjective.java#L73
                { jsx: Checkbox, name: L("betonquest.v2.objective.delay.optional.minutes.name"), key: 'minutes', type: 'boolean', tooltip: L("betonquest.v2.objective.delay.optional.minutes.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.objective.delay.optional.seconds.name"), key: 'seconds', type: 'boolean', tooltip: L("betonquest.v2.objective.delay.optional.seconds.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.objective.delay.optional.ticks.name"), key: 'ticks', type: 'boolean', tooltip: L("betonquest.v2.objective.delay.optional.ticks.tooltip") },
                { jsx: Number, name: L("betonquest.v2.objective.delay.optional.interval.name"), key: 'interval', type: 'int', placeholder: '200', tooltip: L("betonquest.v2.objective.delay.optional.interval.tooltip"), config: { min: 0, undefinedValue: 0 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/DieObjective.java
        value: 'die',
        display: L("betonquest.v2.objective.die.display"),
        description: L("betonquest.v2.objective.die.description"),
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.objective.die.optional.cancel.name"), key: 'cancel', type: 'boolean', tooltip: L("betonquest.v2.objective.die.optional.cancel.tooltip") },
                { jsx: BaseLocation, name: L("betonquest.v2.objective.die.optional.respawn.name"), key: 'respawn', type: 'string', config: { optional: true }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/FishObjective.java
        value: 'fish',
        display: L("betonquest.v2.objective.fish.display"),
        description: L("betonquest.v2.objective.fish.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: L("betonquest.v2.objective.fish.mandatory.item.name"), type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: L("betonquest.v2.objective.fish.mandatory.item.tooltip") },
                { jsx: Number, name: L("betonquest.v2.objective.fish.mandatory.amount.name"), type: 'int', defaultValue: 1, config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: BaseLocation, name: L("betonquest.v2.objective.fish.optional.hookLocation.name"), key: 'hookLocation', type: 'string', tooltip: L("betonquest.v2.objective.fish.optional.hookLocation.tooltip"), config: { optional: true }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.fish.optional.range.name"), key: 'range', type: 'float', tooltip: L("betonquest.v2.objective.fish.optional.range.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.fish.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.fish.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/EntityInteractObjective.java
        value: 'interact',
        display: L("betonquest.v2.objective.interact.display"),
        description: L("betonquest.v2.objective.interact.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.objective.interact.mandatory.action.name"), type: 'string', defaultValue: 'any', placeholder: 'e.g. any', tooltip: L("betonquest.v2.objective.interact.mandatory.action.tooltip"), config: {
                        options: [
                            { label: 'Any', value: 'any' },
                            { label: 'Right', value: 'right' },
                            { label: 'Left', value: 'left' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: EntityType, name: L("betonquest.v2.objective.interact.mandatory.entityType.name"), type: 'string', defaultValue: 'ZOMBIE' },
                { jsx: Number, name: L("betonquest.v2.objective.interact.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.interact.mandatory.mobs.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.objective.interact.optional.name.name"), key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v2.objective.interact.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: L("betonquest.v2.objective.interact.optional.realname.name"), key: 'realname', type: 'string', placeholder: 'e.g. "Notch"', tooltip: L("betonquest.v2.objective.interact.optional.realname.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.objective.interact.optional.marked.name"), key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v2.objective.interact.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: L("betonquest.v2.objective.interact.optional.cancel.name"), key: 'cancel', type: 'boolean', tooltip: L("betonquest.v2.objective.interact.optional.cancel.tooltip") },
                { jsx: BaseLocation, name: L("betonquest.v2.objective.interact.optional.loc.name"), key: 'loc', type: 'string', tooltip: L("betonquest.v2.objective.interact.optional.loc.tooltip"), config: { optional: true }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.interact.optional.range.name"), key: 'range', type: 'float', tooltip: L("betonquest.v2.objective.interact.optional.range.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.interact.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.interact.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/KillPlayerObjective.java
        value: 'kill',
        display: L("betonquest.v2.objective.kill.display"),
        description: L("betonquest.v2.objective.kill.description"),
        // e.g. kill 5 required:team_B
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.objective.kill.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.kill.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.objective.kill.optional.name.name"), key: 'name', type: 'string', placeholder: 'e.g. "Notch"', tooltip: L("betonquest.v2.objective.kill.optional.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: L("betonquest.v2.objective.kill.optional.required.name"), key: 'required', type: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.kill.optional.required.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.objective.kill.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.kill.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/LocationObjective.java
        value: 'location',
        display: L("betonquest.v2.objective.location.display"),
        description: L("betonquest.v2.objective.location.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.objective.location.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.location.mandatory.radius.name"), type: 'float', defaultValue: 1.0, tooltip: L("betonquest.v2.objective.location.mandatory.radius.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/LoginObjective.java
        value: 'login',
        display: L("betonquest.v2.objective.login.display"),
        description: L("betonquest.v2.objective.login.description"),
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/LogoutObjective.java
        value: 'logout',
        display: L("betonquest.v2.objective.logout.display"),
        description: L("betonquest.v2.objective.logout.description"),
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/PasswordObjective.java
        // TODO: a seprated standalone editor for password preview
        value: 'password',
        display: L("betonquest.v2.objective.password.display"),
        description: L("betonquest.v2.objective.password.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.objective.password.mandatory.password.name"), type: 'string', defaultValue: 'Some Passwords', tooltip: L("betonquest.v2.objective.password.mandatory.password.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.objective.password.optional.ignoreCase.name"), key: 'ignoreCase', type: 'boolean', tooltip: L("betonquest.v2.objective.password.optional.ignoreCase.tooltip") },
                { jsx: Input, name: L("betonquest.v2.objective.password.optional.prefix.name"), key: 'prefix', type: 'string', placeholder: 'e.g. "Secret Password"', tooltip: L("betonquest.v2.objective.password.optional.prefix.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: InputList, name: L("betonquest.v2.objective.password.optional.fail.name"), key: 'fail', type: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.password.optional.fail.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/PickupObjective.java
        value: 'pickup',
        display: L("betonquest.v2.objective.pickup.display"),
        description: L("betonquest.v2.objective.pickup.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.objective.pickup.mandatory.itemList.name"), type: 'string[,]', defaultValue: ["a_quest_item_1"], placeholder: 'e.g. emerald' },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.pickup.optional.amount.name"), key: 'amount', type: 'int', placeholder: '1', tooltip: L("betonquest.v2.objective.pickup.optional.amount.tooltip"), config: { min: 0, undefinedValue: 0 }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.objective.pickup.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.pickup.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/MobKillObjective.java
        value: 'mobkill',
        display: L("betonquest.v2.objective.mobkill.display"),
        description: L("betonquest.v2.objective.mobkill.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: EntityTypeList, name: L("betonquest.v2.objective.mobkill.mandatory.type.name"), type: 'string[,]', defaultValue: ['ZOMBIE'] },
                { jsx: Number, name: L("betonquest.v2.objective.mobkill.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.mobkill.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.objective.mobkill.optional.name.name"), key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v2.objective.mobkill.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: L("betonquest.v2.objective.mobkill.optional.marked.name"), key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v2.objective.mobkill.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.objective.mobkill.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.mobkill.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/BrewObjective.java
        value: 'brew',
        display: L("betonquest.v2.objective.brew.display"),
        description: L("betonquest.v2.objective.brew.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.objective.brew.mandatory.item.name"), type: 'string', defaultValue: 'a_quest_potion', tooltip: L("betonquest.v2.objective.brew.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.objective.brew.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.brew.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.brew.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.brew.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/ShearObjective.java
        value: 'shear',
        display: L("betonquest.v2.objective.shear.display"),
        description: L("betonquest.v2.objective.shear.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.objective.shear.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.shear.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.objective.shear.optional.name.name"), key: 'name', type: 'string', placeholder: 'e.g. "Farmer\'s Sheep"', tooltip: L("betonquest.v2.objective.shear.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: DyeColor, name: L("betonquest.v2.objective.shear.optional.color.name"), key: 'color', type: 'string', placeholder: 'e.g. "black"', config: { allowClear: true } },
                { jsx: Number, name: L("betonquest.v2.objective.shear.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.shear.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/SmeltingObjective.java
        value: 'smelt',
        display: L("betonquest.v2.objective.smelt.display"),
        description: L("betonquest.v2.objective.smelt.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.objective.smelt.mandatory.item.name"), type: 'string', defaultValue: 'a_quest_item', tooltip: L("betonquest.v2.objective.smelt.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v2.objective.smelt.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.smelt.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.smelt.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.smelt.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/StageObjective.java
        value: 'stage',
        display: L("betonquest.v2.objective.stage.display"),
        description: L("betonquest.v2.objective.stage.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.objective.stage.mandatory.stageList.name"), type: 'string[,]', defaultValue: ['some_stage_1'], placeholder: 'e.g. stage_1', tooltip: L("betonquest.v2.objective.stage.mandatory.stageList.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.objective.stage.optional.preventCompletion.name"), key: 'preventCompletion', type: 'boolean', tooltip: L("betonquest.v2.objective.stage.optional.preventCompletion.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/StepObjective.java
        value: 'step',
        display: L("betonquest.v2.objective.step.display"),
        description: L("betonquest.v2.objective.step.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.objective.step.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/TameObjective.java
        value: 'tame',
        display: L("betonquest.v2.objective.tame.display"),
        description: L("betonquest.v2.objective.tame.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: L("betonquest.v2.objective.tame.mandatory.type.name"), type: 'string', defaultValue: 'WOLF' },
                { jsx: Number, name: L("betonquest.v2.objective.tame.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.tame.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.tame.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.tame.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/JumpObjective.java
        value: 'jump',
        display: L("betonquest.v2.objective.jump.display"),
        description: L("betonquest.v2.objective.jump.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.objective.jump.mandatory.amount.name"), type: 'int', defaultValue: 1, tooltip: L("betonquest.v2.objective.jump.mandatory.amount.tooltip"), config: { min: 1 }, allowVariable: true },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.objective.jump.optional.notify.name"), key: 'notify', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.jump.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/RideObjective.java
        value: 'ride',
        display: L("betonquest.v2.objective.ride.display"),
        description: L("betonquest.v2.objective.ride.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: L("betonquest.v2.objective.ride.mandatory.type.name"), type: 'string', defaultValue: 'any', tooltip: L("betonquest.v2.objective.ride.mandatory.type.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/CommandObjective.java
        value: 'command',
        display: L("betonquest.v2.objective.command.display"),
        description: L("betonquest.v2.objective.command.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.objective.command.mandatory.command.name"), type: 'string', defaultValue: '/spawn', tooltip: L("betonquest.v2.objective.command.mandatory.command.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.objective.command.optional.ignoreCase.name"), key: 'ignoreCase', type: 'boolean', tooltip: L("betonquest.v2.objective.command.optional.ignoreCase.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.objective.command.optional.exact.name"), key: 'exact', type: 'boolean', tooltip: L("betonquest.v2.objective.command.optional.exact.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.objective.command.optional.cancel.name"), key: 'cancel', type: 'boolean', tooltip: L("betonquest.v2.objective.command.optional.cancel.tooltip") },
                { jsx: InputList, name: L("betonquest.v2.objective.command.optional.failEvents.name"), key: 'failEvents', type: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v2.objective.command.optional.failEvents.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/objectives/EquipItemObjective.java
        value: 'equip',
        display: L("betonquest.v2.objective.equip.display"),
        description: L("betonquest.v2.objective.equip.description"),
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.objective.equip.mandatory.slot.name"), type: 'string', defaultValue: 'HEAD', placeholder: 'e.g. HEAD', config: {
                        options: [
                            { label: 'Head', value: 'HEAD' },
                            { label: 'Chest', value: 'CHEST' },
                            { label: 'Legs', value: 'LEGS' },
                            { label: 'Feet', value: 'FEET' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Input, name: L("betonquest.v2.objective.equip.mandatory.item.name"), type: 'string', defaultValue: 'a_quest_item', tooltip: L("betonquest.v2.objective.equip.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/VariableEvent.java
        value: 'variable',
        display: L("betonquest.v2.objective.variable.display"),
        description: L("betonquest.v2.objective.variable.description"),
        // e.g. variable no-chat
        argumentsPattern: {
            mandatory: [],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.objective.variable.optional.no-chat.name"), key: 'no-chat', type: 'boolean', tooltip: L("betonquest.v2.objective.variable.optional.no-chat.tooltip") },
            ]
        }
    },
] as Kind<Objective>[]).map(kind => {
    if (kind.argumentsPattern.optional) {
        kind.argumentsPattern.optional.push(...defaultOptionalArguments);
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