import { DefaultOptionType } from "antd/es/select";

import L from "../../i18n/i18n";
import { ArgumentType, ArgumentsPatternOptional } from "../Arguments";
import Objective from "../Objective";
import { ElementKind } from "./Element";

import BaseLocation from "../../ui/Input/BaseLocation";
import Biome from "../../ui/Input/Biome";
import BlockSelector from "../../ui/Input/BlockSelector";
import Checkbox from "../../ui/Input/Checkbox";
import DyeColor from "../../ui/Input/DyeColor";
import EnchantmentList from "../../ui/Input/EnchantmentList";
import EntityType from "../../ui/Input/EntityType";
import EntityTypeList from "../../ui/Input/EntityTypeList";
import EntityTypeListWithAmount from "../../ui/Input/EntityTypeListWithAmount";
import Input from "../../ui/Input/Input";
import InputList from "../../ui/Input/InputList";
import ItemList from "../../ui/Input/ItemList";
import Number from "../../ui/Input/Number";
import PotionEffectType from "../../ui/Input/PotionEffectType";
import PotionEffectTypeList from "../../ui/Input/PotionEffectTypeList";
import Select from "../../ui/Input/Select";
import TextArea from "../../ui/Input/TextArea";
import TextAreaList from "../../ui/Input/TextAreaList";
import Variable from "../../ui/Input/Variable";

// Default optional arguments for every kind
const defaultOptionalArguments: ArgumentsPatternOptional[] = [
    { jsx: InputList, name: L("betonquest.v1.objective.*.optional.conditions.name"), type: ArgumentType.conditionIdList, key: 'conditions', format: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.*.optional.conditions.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
    { jsx: InputList, name: L("betonquest.v1.objective.*.optional.events.name"), type: ArgumentType.eventID, key: 'events', format: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.*.optional.events.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
];

export const kinds: ElementKind<Objective>[] = ([
    {
        value: '*',
        display: L("betonquest.v1.objective.*.display"),
        description: undefined,
        argumentsPatterns: {
            mandatory: [
                { jsx: TextArea, name: L("betonquest.v1.objective.*.mandatory.value.name"), type: ArgumentType.any, format: '*', defaultValue: '' },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ActionObjective.java
        value: 'action',
        display: L("betonquest.v1.objective.action.display"),
        description: L("betonquest.v1.objective.action.description"),
        // e.g. action right DOOR conditions:holding_key loc:100;200;300;world range:5
        // e.g. action any any conditions:holding_magicWand events:fireSpell #Custom click listener for a wand
        argumentsPatterns: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v1.objective.action.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'any', placeholder: 'e.g. any', tooltip: L("betonquest.v1.objective.action.mandatory.action.tooltip"), config: {
                        options: [
                            { label: 'Any', value: 'any' },
                            { label: 'Right', value: 'right' },
                            { label: 'Left', value: 'left' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: BlockSelector, name: L("betonquest.v1.objective.action.mandatory.block.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'any', placeholder: 'e.g. AIR', tooltip: L("betonquest.v1.objective.action.mandatory.block.tooltip") },
            ],
            optional: [
                { jsx: BaseLocation, name: L("betonquest.v1.objective.action.optional.loc.name"), type: ArgumentType.unknown, key: 'loc', format: 'string', config: { optional: true }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v1.objective.action.optional.range.name"), type: ArgumentType.unknown, key: 'range', format: 'float', placeholder: '1', config: { min: 0, undefinedValue: 0 }, allowVariable: true },
                { jsx: Checkbox, name: L("betonquest.v1.objective.action.optional.exactMatch.name"), type: ArgumentType.unknown, key: 'exactMatch', format: 'boolean', tooltip: L("betonquest.v1.objective.action.optional.exactMatch.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v1.objective.action.optional.cancel.name"), type: ArgumentType.unknown, key: 'cancel', format: 'boolean', tooltip: L("betonquest.v1.objective.action.optional.cancel.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ArrowShootObjective.java
        value: 'arrow',
        display: L("betonquest.v1.objective.arrow.display"),
        description: L("betonquest.v1.objective.arrow.description"),
        // e.g. arrow 100.5;200.5;300.5;world 1.1 events:reward conditions:correct_player_position
        argumentsPatterns: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v1.objective.arrow.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: L("betonquest.v1.objective.arrow.mandatory.precisionRadius.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 1.0, tooltip: L("betonquest.v1.objective.arrow.mandatory.precisionRadius.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/BlockObjective.java
        value: 'block',
        display: L("betonquest.v1.objective.block.display"),
        description: L("betonquest.v1.objective.block.description"),
        // e.g. block LOG -16 events:reward notify:5
        argumentsPatterns: {
            mandatory: [
                { jsx: BlockSelector, name: L("betonquest.v1.objective.block.mandatory.block.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'any', placeholder: 'e.g. AIR', tooltip: L("betonquest.v1.objective.block.mandatory.block.tooltip") },
                { jsx: Number, name: L("betonquest.v1.objective.block.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.block.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v1.objective.block.optional.exactMatch.name"), type: ArgumentType.unknown, key: 'exactMatch', format: 'boolean', tooltip: L("betonquest.v1.objective.block.optional.exactMatch.tooltip") },
                { jsx: Number, name: L("betonquest.v1.objective.block.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.block.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
                // { jsx: OptionalNumber, name: 'Notify', key: 'notify', type: 'int', placeholder: '1', tooltip: 'Displays messages to the player each time they progress the objective, with interval', config: { min: 0, setMinToNull: true } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/BreedObjective.java
        value: 'breed',
        display: L("betonquest.v1.objective.breed.display"),
        description: L("betonquest.v1.objective.breed.description"),
        // e.g. breed cow 10 notify:2 events:reward
        argumentsPatterns: {
            mandatory: [
                { jsx: EntityType, name: L("betonquest.v1.objective.breed.mandatory.type.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'PIG' },
                { jsx: Number, name: L("betonquest.v1.objective.breed.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.breed.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v1.objective.breed.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'boolean', tooltip: L("betonquest.v1.objective.breed.optional.notify.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ChestPutObjective.java
        value: 'chestput',
        display: L("betonquest.v1.objective.chestput.display"),
        description: L("betonquest.v1.objective.chestput.description"),
        // e.g. chestput 100;200;300;world emerald:5,sword events:tag,message
        argumentsPatterns: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v1.objective.chestput.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', tooltip: L("betonquest.v1.objective.chestput.mandatory.location.tooltip"), allowVariable: true },
                { jsx: ItemList, name: L("betonquest.v1.objective.chestput.mandatory.itemList.name"), type: ArgumentType.unknown, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v1.objective.chestput.optional.items-stay.name"), type: ArgumentType.unknown, key: 'items-stay', format: 'boolean', tooltip: L("betonquest.v1.objective.chestput.optional.items-stay.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ConsumeObjective.java
        value: 'consume',
        display: L("betonquest.v1.objective.consume.display"),
        description: L("betonquest.v1.objective.consume.description"),
        // e.g. consume tawny_owl events:faster_endurance_regen
        argumentsPatterns: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v1.objective.consume.mandatory.item.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_quest_item', tooltip: L("betonquest.v1.objective.consume.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/CraftingObjective.java
        value: 'craft',
        display: L("betonquest.v1.objective.craft.display"),
        description: L("betonquest.v1.objective.craft.description"),
        // e.g. craft saddle 5 events:reward
        argumentsPatterns: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v1.objective.craft.mandatory.item.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_quest_item', tooltip: L("betonquest.v1.objective.craft.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v1.objective.craft.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.craft.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v1.objective.craft.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.craft.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/EnchantObjective.java
        value: 'enchant',
        display: L("betonquest.v1.objective.enchant.display"),
        description: L("betonquest.v1.objective.enchant.description"),
        // e.g. enchant sword damage_all:1,knockback:1 events:reward
        argumentsPatterns: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v1.objective.enchant.mandatory.item.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_quest_item', tooltip: L("betonquest.v1.objective.enchant.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: EnchantmentList, name: L("betonquest.v1.objective.enchant.mandatory.enchantmentList.name"), type: ArgumentType.unknown, format: '[string:number?][,]', defaultValue: [["", 1]], placeholder: ['e.g. ARROW_DAMAGE', '1'] },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ExperienceObjective.java
        value: 'experience',
        display: L("betonquest.v1.objective.experience.display"),
        description: L("betonquest.v1.objective.experience.description"),
        // e.g. experience 25 level events:reward
        argumentsPatterns: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v1.objective.experience.mandatory.experience.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.experience.mandatory.experience.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v1.objective.experience.optional.level.name"), type: ArgumentType.unknown, key: 'level', format: 'boolean', tooltip: L("betonquest.v1.objective.experience.optional.level.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/DelayObjective.java
        value: 'delay',
        display: L("betonquest.v1.objective.delay.display"),
        description: L("betonquest.v1.objective.delay.description"),
        // e.g. delay 1000 ticks interval:5 events:event1,event2
        argumentsPatterns: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v1.objective.delay.mandatory.time.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1.0, tooltip: L("betonquest.v1.objective.delay.mandatory.time.tooltip"), config: { min: 0 } },
            ],
            optional: [
                // TODO: Bad design. Should use "Select" instead.
                // https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/objectives/DelayObjective.java#L73
                { jsx: Checkbox, name: L("betonquest.v1.objective.delay.optional.ticks.name"), type: ArgumentType.unknown, key: 'ticks', format: 'boolean', tooltip: L("betonquest.v1.objective.delay.optional.ticks.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v1.objective.delay.optional.seconds.name"), type: ArgumentType.unknown, key: 'seconds', format: 'boolean', tooltip: L("betonquest.v1.objective.delay.optional.seconds.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v1.objective.delay.optional.minutes.name"), type: ArgumentType.unknown, key: 'minutes', format: 'boolean', tooltip: L("betonquest.v1.objective.delay.optional.minutes.tooltip") },
                { jsx: Number, name: L("betonquest.v1.objective.delay.optional.interval.name"), type: ArgumentType.unknown, key: 'interval', format: 'int', placeholder: '200', tooltip: L("betonquest.v1.objective.delay.optional.interval.tooltip"), config: { min: 0, undefinedValue: 0 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/DieObjective.java
        value: 'die',
        display: L("betonquest.v1.objective.die.display"),
        description: L("betonquest.v1.objective.die.description"),
        // e.g. die cancel respawn:100;200;300;world;90;0 events:teleport
        argumentsPatterns: {
            mandatory: [],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v1.objective.die.optional.cancel.name"), type: ArgumentType.unknown, key: 'cancel', format: 'boolean', tooltip: L("betonquest.v1.objective.die.optional.cancel.tooltip") },
                { jsx: BaseLocation, name: L("betonquest.v1.objective.die.optional.respawn.name"), type: ArgumentType.unknown, key: 'respawn', format: 'string', config: { optional: true }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/FishObjective.java
        value: 'fish',
        display: L("betonquest.v1.objective.fish.display"),
        description: L("betonquest.v1.objective.fish.description"),
        // e.g. fish SALMON 5 notify events:tag_fish_caught
        argumentsPatterns: {
            mandatory: [
                { jsx: BlockSelector, name: L("betonquest.v1.objective.fish.mandatory.item.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: L("betonquest.v1.objective.fish.mandatory.item.tooltip") },
                { jsx: Number, name: L("betonquest.v1.objective.fish.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v1.objective.fish.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.fish.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/EntityInteractObjective.java
        value: 'interact',
        display: L("betonquest.v1.objective.interact.display"),
        description: L("betonquest.v1.objective.interact.description"),
        // e.g. interact right creeper 1 marked:sick condition:syringeInHand cancel
        argumentsPatterns: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v1.objective.interact.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'any', placeholder: 'e.g. any', tooltip: L("betonquest.v1.objective.interact.mandatory.action.tooltip"), config: {
                        options: [
                            { label: 'Any', value: 'any' },
                            { label: 'Right', value: 'right' },
                            { label: 'Left', value: 'left' },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: EntityType, name: L("betonquest.v1.objective.interact.mandatory.entityType.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'ZOMBIE' },
                { jsx: Number, name: L("betonquest.v1.objective.interact.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.interact.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v1.objective.interact.optional.name.name"), type: ArgumentType.unknown, key: 'name', format: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v1.objective.interact.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: L("betonquest.v1.objective.interact.optional.realname.name"), type: ArgumentType.unknown, key: 'realname', format: 'string', placeholder: 'e.g. "Notch"', tooltip: L("betonquest.v1.objective.interact.optional.realname.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v1.objective.interact.optional.marked.name"), type: ArgumentType.unknown, key: 'marked', format: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v1.objective.interact.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: L("betonquest.v1.objective.interact.optional.cancel.name"), type: ArgumentType.unknown, key: 'cancel', format: 'boolean', tooltip: L("betonquest.v1.objective.interact.optional.cancel.tooltip") },
                { jsx: BaseLocation, name: L("betonquest.v1.objective.interact.optional.loc.name"), type: ArgumentType.unknown, key: 'loc', format: 'string', tooltip: L("betonquest.v1.objective.interact.optional.loc.tooltip"), config: { optional: true }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v1.objective.interact.optional.range.name"), type: ArgumentType.unknown, key: 'range', format: 'float', tooltip: L("betonquest.v1.objective.interact.optional.range.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v1.objective.interact.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.interact.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/KillPlayerObjective.java
        value: 'kill',
        display: L("betonquest.v1.objective.kill.display"),
        description: L("betonquest.v1.objective.kill.description"),
        // e.g. kill 5 required:team_B
        argumentsPatterns: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v1.objective.kill.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.kill.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v1.objective.kill.optional.name.name"), type: ArgumentType.unknown, key: 'name', format: 'string', placeholder: 'e.g. "Notch"', tooltip: L("betonquest.v1.objective.kill.optional.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: L("betonquest.v1.objective.kill.optional.required.name"), type: ArgumentType.unknown, key: 'required', format: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.kill.optional.required.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v1.objective.kill.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.kill.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/LocationObjective.java
        value: 'location',
        display: L("betonquest.v1.objective.location.display"),
        description: L("betonquest.v1.objective.location.description"),
        // e.g. location 100;200;300;world 5 condition:test1,!test2 events:test1,test2
        argumentsPatterns: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v1.objective.location.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: Number, name: L("betonquest.v1.objective.location.mandatory.radius.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 1.0, tooltip: L("betonquest.v1.objective.location.mandatory.radius.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/LoginObjective.java
        value: 'login',
        display: L("betonquest.v1.objective.login.display"),
        description: L("betonquest.v1.objective.login.description"),
        // e.g. login events:welcome_message
        argumentsPatterns: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/LogoutObjective.java
        value: 'logout',
        display: L("betonquest.v1.objective.logout.display"),
        description: L("betonquest.v1.objective.logout.description"),
        // e.g. logout events:delete_objective
        argumentsPatterns: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/PasswordObjective.java
        // TODO: a seprated standalone editor for password preview
        value: 'password',
        display: L("betonquest.v1.objective.password.display"),
        description: `<div>The player has to write a certain password in chat.</div><div>This is what the player has to type in chat:</div><div><Tooltip title="Prefix (If specified)"><u>Solution:</u></Tooltip> <Tooltip title="Password"><u>The Cake is a lie!</u></Tooltip></div>`,
        // e.g. password beton ignoreCase prefix:secret fail:failEvent1,failEvent2 events:message,reward
        argumentsPatterns: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v1.objective.password.mandatory.password.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'Some Passwords', tooltip: L("betonquest.v1.objective.password.mandatory.password.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v1.objective.password.optional.ignoreCase.name"), type: ArgumentType.unknown, key: 'ignoreCase', format: 'boolean', tooltip: L("betonquest.v1.objective.password.optional.ignoreCase.tooltip") },
                { jsx: Input, name: L("betonquest.v1.objective.password.optional.prefix.name"), type: ArgumentType.unknown, key: 'prefix', format: 'string', placeholder: 'e.g. "Secret Password"', tooltip: L("betonquest.v1.objective.password.optional.prefix.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: InputList, name: L("betonquest.v1.objective.password.optional.fail.name"), type: ArgumentType.unknown, key: 'fail', format: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.password.optional.fail.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/PickupObjective.java
        value: 'pickup',
        display: L("betonquest.v1.objective.pickup.display"),
        description: L("betonquest.v1.objective.pickup.description"),
        // e.g. pickup emerald amount:3 events:reward notify
        // e.g. pickup emerald,diamond amount:6 events:reward notify
        argumentsPatterns: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v1.objective.pickup.mandatory.itemList.name"), type: ArgumentType.unknown, format: 'string[,]', defaultValue: ["a_quest_item_1"], placeholder: 'e.g. emerald' },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v1.objective.pickup.optional.amount.name"), type: ArgumentType.unknown, key: 'amount', format: 'int', placeholder: '1', tooltip: L("betonquest.v1.objective.pickup.optional.amount.tooltip"), config: { min: 0, undefinedValue: 0 } },
                { jsx: Checkbox, name: L("betonquest.v1.objective.pickup.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'boolean', tooltip: L("betonquest.v1.objective.pickup.optional.notify.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/MobKillObjective.java
        value: 'mobkill',
        display: L("betonquest.v1.objective.mobkill.display"),
        description: L("betonquest.v1.objective.mobkill.description"),
        // e.g. mobkill ZOMBIE 5 name:Uber_Zombie conditions:night
        argumentsPatterns: {
            mandatory: [
                { jsx: EntityTypeList, name: L("betonquest.v1.objective.mobkill.mandatory.type.name"), type: ArgumentType.unknown, format: 'string[,]', defaultValue: ['ZOMBIE'] },
                { jsx: Number, name: L("betonquest.v1.objective.mobkill.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.mobkill.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v1.objective.mobkill.optional.name.name"), type: ArgumentType.unknown, key: 'name', format: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v1.objective.mobkill.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: L("betonquest.v1.objective.mobkill.optional.marked.name"), type: ArgumentType.unknown, key: 'marked', format: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v1.objective.mobkill.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v1.objective.mobkill.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.mobkill.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/FishObjective.java
        value: 'brew',
        display: L("betonquest.v1.objective.brew.display"),
        description: L("betonquest.v1.objective.brew.description"),
        // e.g. brew weird_concoction 4 event:add_tag
        argumentsPatterns: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v1.objective.brew.mandatory.item.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_quest_potion', tooltip: L("betonquest.v1.objective.brew.mandatory.item.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Number, name: L("betonquest.v1.objective.brew.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.brew.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v1.objective.brew.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.brew.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/ShearObjective.java
        value: 'shear',
        display: L("betonquest.v1.objective.shear.display"),
        description: L("betonquest.v1.objective.shear.description"),
        // e.g. shear 1 name:Bob color:black
        // e.g. shear 1 name:jeb\_
        argumentsPatterns: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v1.objective.shear.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.shear.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v1.objective.shear.optional.name.name"), type: ArgumentType.unknown, key: 'name', format: 'string', placeholder: 'e.g. "Farmer\'s Sheep"', tooltip: L("betonquest.v1.objective.shear.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: DyeColor, name: L("betonquest.v1.objective.shear.optional.color.name"), type: ArgumentType.unknown, key: 'color', format: 'string', placeholder: 'e.g. "black"', config: { allowClear: true } },
                { jsx: Number, name: L("betonquest.v1.objective.shear.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.shear.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/SmeltingObjective.java
        value: 'smelt',
        display: L("betonquest.v1.objective.smelt.display"),
        description: L("betonquest.v1.objective.smelt.description"),
        // e.g. smelt IRON_INGOT 5 events:reward
        argumentsPatterns: {
            mandatory: [
                { jsx: BlockSelector, name: L("betonquest.v1.objective.smelt.mandatory.item.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: L("betonquest.v1.objective.smelt.mandatory.item.tooltip") },
                { jsx: Number, name: L("betonquest.v1.objective.smelt.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.smelt.mandatory.amount.tooltip"), config: { min: 1 } },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v1.objective.smelt.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.objective.smelt.optional.notify.tooltip"), config: { min: 0, undefinedValue: 0, nullValue: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/StepObjective.java
        value: 'step',
        display: L("betonquest.v1.objective.step.display"),
        description: L("betonquest.v1.objective.step.description"),
        // e.g. step 100;200;300;world events:done
        argumentsPatterns: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v1.objective.step.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/TameObjective.java
        value: 'tame',
        display: L("betonquest.v1.objective.tame.display"),
        description: L("betonquest.v1.objective.tame.description"),
        // tame WOLF 2 events:wolfs_tamed
        argumentsPatterns: {
            mandatory: [
                { jsx: EntityType, name: L("betonquest.v1.objective.tame.mandatory.type.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'WOLF' },
                { jsx: Number, name: L("betonquest.v1.objective.tame.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.tame.mandatory.amount.tooltip"), config: { min: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/JumpObjective.java
        value: 'jump',
        display: L("betonquest.v1.objective.jump.display"),
        description: `<div>The player must jump.</div><div>This feature requires <a href="https://papermc.io/" target="_blank">Paper</a>.</div>`,
        // e.g. jump 15 events:legExerciseDone
        argumentsPatterns: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v1.objective.jump.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 1, tooltip: L("betonquest.v1.objective.jump.mandatory.amount.tooltip"), config: { min: 1 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/VehicleObjective.java
        value: 'riding',
        display: L("betonquest.v1.objective.riding.display"),
        description: L("betonquest.v1.objective.riding.description"),
        // e.g. riding horse
        argumentsPatterns: {
            mandatory: [
                { jsx: EntityType, name: L("betonquest.v1.objective.riding.mandatory.type.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'any', tooltip: L("betonquest.v1.objective.riding.mandatory.type.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/objectives/VariableObjective.java
        value: 'variable',
        display: L("betonquest.v1.objective.variable.display"),
        description: `<div>tores custom variables. It also allows the player to set custom variables typed in chat with format "key: value".</div><div>For more details, please refer to the <a href="https://betonquest.org/1.12/User-Documentation/Objectives-List/#variable-variable" target="_blank">documentation</a>.</div>`,
        // e.g. variable
        argumentsPatterns: {
            mandatory: [],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v1.objective.variable.optional.no-chat.name"), type: ArgumentType.unknown, key: 'no-chat', format: 'boolean', tooltip: L("betonquest.v1.objective.variable.optional.no-chat.tooltip") },
            ]
        }
    },
] as ElementKind<Objective>[]).map(kind => {
    if (kind.argumentsPatterns.optional) {
        kind.argumentsPatterns.optional.push(...defaultOptionalArguments);
    } else {
        kind.argumentsPatterns.optional = defaultOptionalArguments;
    }
    return kind;
});
