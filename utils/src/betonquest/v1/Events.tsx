import { DefaultOptionType } from "antd/es/select";

import L from "../../i18n/i18n";
import { ArgumentType } from "../Arguments";
import Event from "../Event";
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

export class Kinds {
    private static kinds: ElementKind<Event>[] = [];
    private static currentLocale = global.locale;
    static get() {
        if (this.kinds.length < 1 || global.locale !== this.currentLocale) {
            this.updateKinds();
        }
        return this.kinds;
    }
    static updateKinds() {
        this.kinds = [
            {
                value: '*',
                display: L("betonquest.v1.event.*.display"),
                description: undefined,
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextArea, name: L("betonquest.v1.event.*.mandatory.value.name"), type: ArgumentType.any, format: '*', defaultValue: '' },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/CancelEvent.java
                value: 'cancel',
                display: L("betonquest.v1.event.cancel.display"),
                description: L("betonquest.v1.event.cancel.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.cancel.mandatory.canceler.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_canceler_name_1', tooltip: L("betonquest.v1.event.cancel.mandatory.canceler.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ChatEvent.java
                value: 'chat',
                display: L("betonquest.v1.event.chat.display"),
                description: L("betonquest.v1.event.chat.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v1.event.chat.mandatory.messages.name"), type: ArgumentType.unknown, format: 'string[|]', defaultValue: [''] },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ChestClearEvent.java
                value: 'chestclear',
                display: L("betonquest.v1.event.chestclear.display"),
                description: L("betonquest.v1.event.chestclear.description"),
                // e.g. chestclear 100;200;300;world
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v1.event.chestclear.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ChestGiveEvent.java
                value: 'chestgive',
                display: L("betonquest.v1.event.chestgive.display"),
                description: L("betonquest.v1.event.chestgive.description"),
                // e.g. chestgive 100;200;300;world emerald:5,sword
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v1.event.chestgive.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                        { jsx: ItemList, name: L("betonquest.v1.event.chestgive.mandatory.itemList.name"), type: ArgumentType.unknown, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ChestTakeEvent.java
                value: 'chesttake',
                display: L("betonquest.v1.event.chesttake.display"),
                description: L("betonquest.v1.event.chesttake.description"),
                // e.g. chesttake 100;200;300;world emerald:5,sword
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v1.event.chesttake.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                        { jsx: ItemList, name: L("betonquest.v1.event.chesttake.mandatory.itemList.name"), type: ArgumentType.unknown, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ClearEvent.java
                value: 'clear',
                display: L("betonquest.v1.event.clear.display"),
                description: L("betonquest.v1.event.clear.description"),
                // e.g. clear ZOMBIE,CREEPER 100;200;300;world 10 name:Monster
                argumentsPatterns: {
                    mandatory: [
                        { jsx: EntityTypeList, name: L("betonquest.v1.event.clear.mandatory.entityType.name"), type: ArgumentType.unknown, format: 'string[,]', defaultValue: ['ZOMBIE'], placeholder: 'e.g. ZOMBIE' },
                        { jsx: BaseLocation, name: L("betonquest.v1.event.clear.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        { jsx: Number, name: L("betonquest.v1.event.clear.mandatory.radius.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 0.0, config: { min: 0 }, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Input, name: L("betonquest.v1.event.clear.optional.name.name"), type: ArgumentType.unknown, key: 'name', format: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v1.event.clear.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.clear.optional.marked.name"), type: ArgumentType.unknown, key: 'marked', format: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v1.event.clear.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Checkbox, name: L("betonquest.v1.event.clear.optional.kill.name"), type: ArgumentType.unknown, key: 'kill', format: 'boolean', tooltip: L("betonquest.v1.event.clear.optional.kill.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/CompassEvent.java
                value: 'compass',
                display: L("betonquest.v1.event.compass.display"),
                description: L("betonquest.v1.event.compass.description"),
                // e.g. compass add beton
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v1.event.compass.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.compass.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v1.event.compass.mandatory.action.option.del"),
                                        value: 'del'
                                    },
                                    {
                                        label: L("betonquest.v1.event.compass.mandatory.action.option.set"),
                                        value: 'set'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Input, name: L("betonquest.v1.event.compass.mandatory.compass.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_compass_1', placeholder: 'e.g. some_compass', tooltip: L("betonquest.v1.event.compass.mandatory.compass.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/CommandEvent.java
                value: 'command',
                display: L("betonquest.v1.event.command.display"),
                description: L("betonquest.v1.event.command.description"),
                // e.g. command kill %player%|ban %player%
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v1.event.command.mandatory.commands.name"), type: ArgumentType.unknown, format: 'string[|]', defaultValue: [''], placeholder: 'e.g. kill %player%', tooltip: L("betonquest.v1.event.command.mandatory.commands.tooltip") },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ConversationEvent.java
                value: 'conversation',
                display: L("betonquest.v1.event.conversation.display"),
                description: L("betonquest.v1.event.conversation.description"),
                // e.g. conversation village_smith
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.conversation.mandatory.conversationName.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_conversation_id_1', placeholder: 'e.g. village_smith', tooltip: L("betonquest.v1.event.conversation.mandatory.conversationName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/DamageEvent.java
                value: 'damage',
                display: L("betonquest.v1.event.damage.display"),
                description: L("betonquest.v1.event.damage.description"),
                // e.g. damage 20
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v1.event.damage.mandatory.amount.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 0, tooltip: L("betonquest.v1.event.damage.mandatory.amount.tooltip"), allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/DeletePointEvent.java
                value: 'deletepoint',
                display: L("betonquest.v1.event.deletepoint.display"),
                description: L("betonquest.v1.event.deletepoint.description"),
                // e.g. deletepoint npc_attitude
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.deletepoint.mandatory.pointCategory.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. npc_attitude', tooltip: L("betonquest.v1.event.deletepoint.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/DoorEvent.java
                value: 'door',
                display: L("betonquest.v1.event.door.display"),
                description: L("betonquest.v1.event.door.description"),
                // e.g. door 100;200;300;world off
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v1.event.door.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        {
                            jsx: Select, name: L("betonquest.v1.event.door.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'toggle', placeholder: 'e.g. toggle', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.door.mandatory.action.option.toggle"),
                                        value: 'toggle'
                                    },
                                    {
                                        label: L("betonquest.v1.event.door.mandatory.action.option.on"),
                                        value: 'on'
                                    },
                                    {
                                        label: L("betonquest.v1.event.door.mandatory.action.option.off"),
                                        value: 'off'
                                    }
                                ] as DefaultOptionType[]
                            }
                        },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/DelEffectEvent.java
                value: 'deleffect',
                display: L("betonquest.v1.event.deleffect.display"),
                description: L("betonquest.v1.event.deleffect.description"),
                // e.g. deleffect ABSORPTION,BLINDNESS
                argumentsPatterns: {
                    mandatory: [
                        { jsx: PotionEffectTypeList, name: L("betonquest.v1.event.deleffect.mandatory.effects.name"), type: ArgumentType.unknown, format: 'string[,]', placeholder: 'any', defaultValue: ['any'], tooltip: L("betonquest.v1.event.deleffect.mandatory.effects.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/EffectEvent.java
                value: 'effect',
                display: L("betonquest.v1.event.effect.display"),
                description: L("betonquest.v1.event.effect.description"),
                // e.g. effect BLINDNESS 30 1 ambient icon
                argumentsPatterns: {
                    mandatory: [
                        { jsx: PotionEffectType, name: L("betonquest.v1.event.effect.mandatory.effect.name"), type: ArgumentType.unknown, format: 'string[,]', defaultValue: ['SPEED'], tooltip: L("betonquest.v1.event.effect.mandatory.effect.tooltip") },
                        { jsx: Number, name: L("betonquest.v1.event.effect.mandatory.duration.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 0.0, tooltip: L("betonquest.v1.event.effect.mandatory.duration.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: Number, name: L("betonquest.v1.event.effect.mandatory.level.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 0, tooltip: L("betonquest.v1.event.effect.mandatory.level.tooltip"), config: { min: 0 }, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v1.event.effect.optional.ambient.name"), type: ArgumentType.unknown, key: 'ambient', format: 'boolean', tooltip: L("betonquest.v1.event.effect.optional.ambient.tooltip") },
                        { jsx: Checkbox, name: L("betonquest.v1.event.effect.optional.hidden.name"), type: ArgumentType.unknown, key: 'hidden', format: 'boolean', tooltip: L("betonquest.v1.event.effect.optional.hidden.tooltip") },
                        { jsx: Checkbox, name: L("betonquest.v1.event.effect.optional.noicon.name"), type: ArgumentType.unknown, key: 'noicon', format: 'boolean', tooltip: L("betonquest.v1.event.effect.optional.noicon.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ExplosionEvent.java
                value: 'explosion',
                display: L("betonquest.v1.event.explosion.display"),
                description: L("betonquest.v1.event.explosion.description"),
                // e.g. explosion 0 1 4 100;64;-100;survival
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v1.event.explosion.mandatory.withFire.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0', placeholder: 'e.g. 0', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.explosion.mandatory.withFire.option.0"),
                                        value: '0'
                                    },
                                    {
                                        label: L("betonquest.v1.event.explosion.mandatory.withFire.option.1"),
                                        value: '1'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        {
                            jsx: Select, name: L("betonquest.v1.event.explosion.mandatory.destroyBlocks.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0', placeholder: 'e.g. 0', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.explosion.mandatory.destroyBlocks.option.0"),
                                        value: '0'
                                    },
                                    {
                                        label: L("betonquest.v1.event.explosion.mandatory.destroyBlocks.option.1"),
                                        value: '1'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Number, name: L("betonquest.v1.event.explosion.mandatory.powerLevel.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 0, tooltip: L("betonquest.v1.event.explosion.mandatory.powerLevel.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: BaseLocation, name: L("betonquest.v1.event.explosion.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                    ]
                }
            },
            // TODO: New optional data type: select
            // TODO: ... Or a seprated standalone editor
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/FolderEvent.java
                value: 'folder',
                display: L("betonquest.v1.event.folder.display"),
                description: L("betonquest.v1.event.folder.description"),
                // e.g. folder event1,event2,event3 delay:5 period:1
                argumentsPatterns: {
                    mandatory: [
                        { jsx: InputList, name: L("betonquest.v1.event.folder.mandatory.eventNames.name"), type: ArgumentType.eventIdList, format: 'string[,]', defaultValue: ['an_event_1'], placeholder: 'e.g. event1', tooltip: L("betonquest.v1.event.folder.mandatory.eventNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                    optional: [
                        { jsx: Number, name: L("betonquest.v1.event.folder.optional.delay.name"), type: ArgumentType.unknown, key: 'delay', format: 'float', placeholder: L("(none)"), tooltip: L("betonquest.v1.event.folder.optional.delay.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: Number, name: L("betonquest.v1.event.folder.optional.period.name"), type: ArgumentType.unknown, key: 'period', format: 'float', placeholder: L("(none)"), tooltip: L("betonquest.v1.event.folder.optional.period.tooltip"), config: { min: 0 }, allowVariable: true },
                        // {
                        //     jsx: Select, name: 'Duration Unit', key: 'minutes', type: 'select', placeholder: 'Seconds', config: {
                        //         options: [
                        //             {
                        //                 label: 'Minutes',
                        //                 value: 'minutes'
                        //             },
                        //             {
                        //                 label: 'Ticks',
                        //                 value: 'ticks'
                        //             },
                        //         ] as DefaultOptionType[],
                        //         allowClear: true
                        //     }
                        // },
                        { jsx: Checkbox, name: L("betonquest.v1.event.folder.optional.minutes.name"), type: ArgumentType.unknown, key: 'minutes', format: 'boolean', tooltip: L("betonquest.v1.event.folder.optional.minutes.tooltip") },
                        { jsx: Checkbox, name: L("betonquest.v1.event.folder.optional.ticks.name"), type: ArgumentType.unknown, key: 'ticks', format: 'boolean', tooltip: L("betonquest.v1.event.folder.optional.ticks.tooltip") },
                        { jsx: Number, name: L("betonquest.v1.event.folder.optional.random.name"), type: ArgumentType.unknown, key: 'random', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v1.event.folder.optional.random.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: Checkbox, name: L("betonquest.v1.event.folder.optional.cancelOnLogout.name"), type: ArgumentType.unknown, key: 'cancelOnLogout', format: 'boolean', tooltip: L("betonquest.v1.event.folder.optional.cancelOnLogout.tooltip") },
                    ],
                },
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GiveEvent.java
                value: 'give',
                display: L("betonquest.v1.event.give.display"),
                description: L("betonquest.v1.event.give.description"),
                // e.g. emerald:5,emerald_block:9,important_sign notify
                argumentsPatterns: {
                    mandatory: [
                        { jsx: ItemList, name: L("betonquest.v1.event.give.mandatory.itemList.name"), type: ArgumentType.unknown, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v1.event.give.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'boolean', tooltip: L("betonquest.v1.event.give.optional.notify.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GiveJournalEvent.java
                value: 'givejournal',
                display: L("betonquest.v1.event.givejournal.display"),
                description: L("betonquest.v1.event.givejournal.description"),
                // e.g. givejournal
                argumentsPatterns: {
                    mandatory: []
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GlobalPointEvent.java
                value: 'globalpoint',
                display: L("betonquest.v1.event.globalpoint.display"),
                description: L("betonquest.v1.event.globalpoint.description"),
                // e.g. global_knownusers 1
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.globalpoint.mandatory.pointCategory.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. bonus', tooltip: L("betonquest.v1.event.globalpoint.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: custom standalone editor
                        { jsx: Input, name: L("betonquest.v1.event.globalpoint.mandatory.amount.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0', placeholder: 'e.g. *12', tooltip: L("betonquest.v1.event.globalpoint.mandatory.amount.tooltip") },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v1.event.globalpoint.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'boolean', tooltip: L("betonquest.v1.event.globalpoint.optional.notify.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GlobalTagEvent.java
                value: 'globaltag',
                display: L("betonquest.v1.event.globaltag.display"),
                description: L("betonquest.v1.event.globaltag.description"),
                // e.g. globaltag add global_areNPCsAgressive
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v1.event.globaltag.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.globaltag.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v1.event.globaltag.mandatory.action.option.del"),
                                        value: 'del'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Input, name: L("betonquest.v1.event.globaltag.mandatory.tagName.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_global_tag_id_1', placeholder: 'e.g. reward_claimed', tooltip: L("betonquest.v1.event.globaltag.mandatory.tagName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/IfElseEvent.java
                value: 'if',
                display: L("betonquest.v1.event.if.display"),
                description: L("betonquest.v1.event.if.description"),
                // e.g. if sun rain else sun
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.if.mandatory.conditionName.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_positve_condition_1', config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.if.mandatory.positiveEventName.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_positive_event_1', config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: () => <>{L("betonquest.v1.event.if.mandatory.else.name")}</>, name: '', type: ArgumentType.unknown, format: 'string', defaultValue: 'else' },
                        { jsx: Input, name: L("betonquest.v1.event.if.mandatory.negativeEventName.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_negative_event_1', config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/JournalEvent.java
                value: 'journal',
                display: L("betonquest.v1.event.journal.display"),
                description: L("betonquest.v1.event.journal.description"),
                // e.g. journal delete quest_available
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v1.event.journal.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.journal.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v1.event.journal.mandatory.action.option.delete"),
                                        value: 'delete'
                                    },
                                    {
                                        label: L("betonquest.v1.event.journal.mandatory.action.option.update"),
                                        value: 'update'
                                    }
                                ] as DefaultOptionType[]
                            }
                        },
                        // TODO: New optional data type: string
                        // TODO: ... Or a seprated standalone editor
                        { jsx: Input, name: L("betonquest.v1.event.journal.mandatory.journalName.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '', placeholder: 'e.g. a_journal_id_1', tooltip: L("betonquest.v1.event.journal.mandatory.journalName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/KillEvent.java
                value: 'kill',
                display: L("betonquest.v1.event.kill.display"),
                description: L("betonquest.v1.event.kill.description"),
                argumentsPatterns: {
                    mandatory: []
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/KillMobEvent.java
                value: 'killmob',
                display: L("betonquest.v1.event.killmob.display"),
                description: L("betonquest.v1.event.killmob.description"),
                // editorBody: KillMob,
                // e.g. killmob ZOMBIE 100;200;300;world 40 name:Bolec marked:quest_mob
                argumentsPatterns: {
                    mandatory: [
                        { jsx: EntityType, name: L("betonquest.v1.event.killmob.mandatory.entityType.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                        { jsx: BaseLocation, name: L("betonquest.v1.event.killmob.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        { jsx: Number, name: L("betonquest.v1.event.killmob.mandatory.radius.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 0.0, config: { min: 0 }, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Input, name: L("betonquest.v1.event.killmob.optional.name.name"), type: ArgumentType.unknown, key: 'name', format: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v1.event.killmob.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.killmob.optional.marked.name"), type: ArgumentType.unknown, key: 'marked', format: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v1.event.killmob.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } }
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/LanguageEvent.java
                value: 'language',
                display: L("betonquest.v1.event.language.display"),
                description: L("betonquest.v1.event.language.description"),
                // e.g. language en
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.language.mandatory.languageID.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'en', placeholder: 'e.g. en', config: { allowedPatterns: [/^[a-zA-Z_-]*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/LeverEvent.java
                value: 'lever',
                display: L("betonquest.v1.event.lever.display"),
                description: L("betonquest.v1.event.lever.description"),
                // e.g. lever 100;200;300;world toggle
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v1.event.lever.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        {
                            jsx: Select, name: L("betonquest.v1.event.lever.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'toggle', placeholder: 'e.g. toggle', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.lever.mandatory.action.option.toggle"),
                                        value: 'toggle'
                                    },
                                    {
                                        label: L("betonquest.v1.event.lever.mandatory.action.option.on"),
                                        value: 'on'
                                    },
                                    {
                                        label: L("betonquest.v1.event.lever.mandatory.action.option.off"),
                                        value: 'off'
                                    }
                                ] as DefaultOptionType[]
                            }
                        },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/LightningEvent.java
                value: 'lightning',
                display: L("betonquest.v1.event.lightning.display"),
                description: L("betonquest.v1.event.lightning.description"),
                // e.g. lightning 200;65;100;survival
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v1.event.lightning.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/NotifyEvent.java
                value: 'notify',
                display: L("betonquest.v1.event.notify.display"),
                description: L("betonquest.v1.event.notify.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextArea, name: L("betonquest.v1.event.notify.mandatory.message.name"), type: ArgumentType.unknown, format: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
                    ],
                    optional: [
                        { jsx: InputList, name: L("betonquest.v1.event.notify.optional.category.name"), type: ArgumentType.unknown, key: 'category', format: 'string[,]', placeholder: 'e.g. info', tooltip: L("betonquest.v1.event.notify.optional.category.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.notify.optional.io.name"), type: ArgumentType.unknown, key: 'io', format: 'string', placeholder: 'e.g. bossbar', tooltip: L("betonquest.v1.event.notify.optional.io.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: Seprated standalone body. https://betonquest.org/1.12/User-Documentation/Events-List/#notification-notify
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/NotifyAllEvent.java
                value: 'notifyall',
                display: L("betonquest.v1.event.notifyall.display"),
                description: L("betonquest.v1.event.notifyall.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextArea, name: L("betonquest.v1.event.notifyall.mandatory.message.name"), type: ArgumentType.unknown, format: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
                    ],
                    optional: [
                        { jsx: InputList, name: L("betonquest.v1.event.notifyall.optional.category.name"), type: ArgumentType.unknown, key: 'category', format: 'string[,]', placeholder: 'e.g. info', tooltip: L("betonquest.v1.event.notifyall.optional.category.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.notifyall.optional.io.name"), type: ArgumentType.unknown, key: 'io', format: 'string', placeholder: 'e.g. bossbar', tooltip: L("betonquest.v1.event.notifyall.optional.io.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: Seprated standalone body. https://betonquest.org/1.12/User-Documentation/Events-List/#broadcast-notifyall
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ObjectiveEvent.java
                value: 'objective',
                display: L("betonquest.v1.event.objective.display"),
                description: L("betonquest.v1.event.objective.description"),
                // e.g. objective complete killTheDragon
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v1.event.objective.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.objective.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v1.event.objective.mandatory.action.option.remove"),
                                        value: 'remove'
                                    },
                                    {
                                        label: L("betonquest.v1.event.objective.mandatory.action.option.complete"),
                                        value: 'complete'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: InputList, name: L("betonquest.v1.event.objective.mandatory.objectiveNames.name"), type: ArgumentType.unknown, format: 'string[,]', defaultValue: ['an_objective_1'], config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/OpSudoEvent.java
                value: 'opsudo',
                display: L("betonquest.v1.event.opsudo.display"),
                description: L("betonquest.v1.event.opsudo.description"),
                // e.g. opsudo spawn
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v1.event.opsudo.mandatory.commands.name"), type: ArgumentType.unknown, format: 'string[|]', defaultValue: [''] },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/PartyEvent.java
                value: 'party',
                display: L("betonquest.v1.event.party.display"),
                description: L("betonquest.v1.event.party.description"),
                // e.g. party 10 has_tag1,!has_tag2 give_special_reward
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v1.event.party.mandatory.distance.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 0.0, tooltip: L("betonquest.v1.event.party.mandatory.distance.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: InputList, name: L("betonquest.v1.event.party.mandatory.conditionNames.name"), type: ArgumentType.unknown, format: 'string[,]', placeholder: L("(none)"), defaultValue: ['a_condition_1'], tooltip: L("betonquest.v1.event.party.mandatory.conditionNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: InputList, name: L("betonquest.v1.event.party.mandatory.eventNames.name"), type: ArgumentType.unknown, format: 'string[,]', placeholder: 'any', defaultValue: ['an_event_1'], tooltip: L("betonquest.v1.event.party.mandatory.eventNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            // TODO: variable support
            // TODO: Seprated standalone Editor
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/PickRandomEvent.java
                value: 'pickrandom',
                display: L("betonquest.v1.event.pickrandom.display"),
                description: L("betonquest.v1.event.pickrandom.description"),
                // e.g. pickrandom %point.factionXP.amount%%event1,0.5%event2,79%event3,1%event4 amount:3
                argumentsPatterns: {
                    mandatory: [
                        { jsx: InputList, name: L("betonquest.v1.event.pickrandom.mandatory.conditions.name"), type: ArgumentType.unknown, format: 'string[,]', placeholder: 'e.g. 12.3%event1', defaultValue: ['a_condition_1'], tooltip: L("betonquest.v1.event.pickrandom.mandatory.conditions.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                    optional: [
                        { jsx: Number, name: L("betonquest.v1.event.pickrandom.optional.amount.name"), type: ArgumentType.unknown, key: 'amount', format: 'int', placeholder: '1', tooltip: L("betonquest.v1.event.pickrandom.optional.amount.tooltip"), config: { min: 0 } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/PointEvent.java
                value: 'point',
                display: L("betonquest.v1.event.point.display"),
                description: L("betonquest.v1.event.point.description"),
                // e.g. point points 1.25 notify
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.point.mandatory.pointCategory.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. bonus', tooltip: L("betonquest.v1.event.point.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: custom standalone editor
                        { jsx: Input, name: L("betonquest.v1.event.point.mandatory.amount.name"), type: ArgumentType.unknown, format: 'float', defaultValue: '0', placeholder: 'e.g. *12', tooltip: L("betonquest.v1.event.point.mandatory.amount.tooltip") },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v1.event.point.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'boolean', tooltip: L("betonquest.v1.event.point.optional.notify.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/RunEvent.java
                value: 'run',
                display: L("betonquest.v1.event.run.display"),
                description: L("betonquest.v1.event.run.description"),
                // e.g. run ^tag add beton ^give emerald:5 ^entry add beton ^kill
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v1.event.run.mandatory.eventInstruction.name"), type: ArgumentType.unknown, format: 'string[^]', defaultValue: [''], placeholder: 'e.g. give item:1', tooltip: L("betonquest.v1.event.run.mandatory.eventInstruction.tooltip") },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ScoreboardEvent.java
                value: 'score',
                display: L("betonquest.v1.event.score.display"),
                description: L("betonquest.v1.event.score.description"),
                // e.g. score kill 1.2
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.score.mandatory.name.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '*', placeholder: 'e.g. Quest_Points', tooltip: L("betonquest.v1.event.score.mandatory.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: custom standalone editor
                        { jsx: Input, name: L("betonquest.v1.event.score.mandatory.amount.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0', placeholder: 'e.g. *12', tooltip: L("betonquest.v1.event.score.mandatory.amount.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/SetBlockEvent.java
                value: 'setblock',
                display: L("betonquest.v1.event.setblock.display"),
                description: L("betonquest.v1.event.setblock.description"),
                // e.g. setblock SAND 100;200;300;world ignorePhysics
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BlockSelector, name: L("betonquest.v1.event.setblock.mandatory.blockSelector.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: L("betonquest.v1.event.setblock.mandatory.blockSelector.tooltip") },
                        { jsx: BaseLocation, name: L("betonquest.v1.event.setblock.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v1.event.setblock.optional.ignorePhysics.name"), type: ArgumentType.unknown, key: 'ignorePhysics', format: 'boolean', tooltip: L("betonquest.v1.event.setblock.optional.ignorePhysics.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/SpawnMobEvent.java
                value: 'spawn',
                display: L("betonquest.v1.event.spawn.display"),
                description: L("betonquest.v1.event.spawn.description"),
                // e.g. spawn 100;200;300;world ZOMBIE name:Bolec 1 h:blue_hat c:red_vest drops:emerald:10,bread:2
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v1.event.spawn.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        { jsx: EntityType, name: L("betonquest.v1.event.spawn.mandatory.entityType.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                        { jsx: Number, name: L("betonquest.v1.event.spawn.mandatory.amount.name"), type: ArgumentType.unknown, format: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Input, name: L("betonquest.v1.event.spawn.optional.name.name"), type: ArgumentType.unknown, key: 'name', format: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v1.event.spawn.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.spawn.optional.marked.name"), type: ArgumentType.unknown, key: 'marked', format: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v1.event.spawn.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.spawn.optional.h.name"), type: ArgumentType.unknown, key: 'h', format: 'string', placeholder: 'e.g. blue_hat', tooltip: L("betonquest.v1.event.spawn.optional.h.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.spawn.optional.c.name"), type: ArgumentType.unknown, key: 'c', format: 'string', placeholder: 'e.g. red_vest', tooltip: L("betonquest.v1.event.spawn.optional.c.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.spawn.optional.l.name"), type: ArgumentType.unknown, key: 'l', format: 'string', placeholder: 'e.g. yellow_leggings', tooltip: L("betonquest.v1.event.spawn.optional.l.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.spawn.optional.b.name"), type: ArgumentType.unknown, key: 'b', format: 'string', placeholder: 'e.g. purple_boots', tooltip: L("betonquest.v1.event.spawn.optional.b.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.spawn.optional.m.name"), type: ArgumentType.unknown, key: 'm', format: 'string', placeholder: 'e.g. wooden_sword', tooltip: L("betonquest.v1.event.spawn.optional.m.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.spawn.optional.o.name"), type: ArgumentType.unknown, key: 'o', format: 'string', placeholder: 'e.g. wooden_shield', tooltip: L("betonquest.v1.event.spawn.optional.o.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: InputList, name: L("betonquest.v1.event.spawn.optional.drops.name"), type: ArgumentType.unknown, key: 'drops', format: 'string[,]', placeholder: 'e.g. diamond', tooltip: L("betonquest.v1.event.spawn.optional.drops.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/SudoEvent.java
                value: 'sudo',
                display: L("betonquest.v1.event.sudo.display"),
                description: L("betonquest.v1.event.sudo.description"),
                // e.g. sudo spawn
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v1.event.sudo.mandatory.commands.name"), type: ArgumentType.unknown, format: 'string[|]', defaultValue: [''] },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GlobalTagEvent.java
                value: 'tag',
                display: L("betonquest.v1.event.tag.display"),
                description: L("betonquest.v1.event.tag.description"),
                // e.g. tag add quest_started,new_entry
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v1.event.tag.mandatory.action.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.tag.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v1.event.tag.mandatory.action.option.delete"),
                                        value: 'delete'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: InputList, name: L("betonquest.v1.event.tag.mandatory.tagNames.name"), type: ArgumentType.unknown, format: 'string[,]', defaultValue: ['a_tag_1'], config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/TakeEvent.java
                value: 'take',
                display: L("betonquest.v1.event.take.display"),
                description: L("betonquest.v1.event.take.description"),
                // e.g. take emerald:120,sword invOrder:Armor,Offhand,Inventory,Backpack
                argumentsPatterns: {
                    mandatory: [
                        { jsx: ItemList, name: L("betonquest.v1.event.take.mandatory.itemList.name"), type: ArgumentType.unknown, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', 'all'] },
                    ],
                    optional: [
                        // TODO: Picker input
                        { jsx: InputList, name: L("betonquest.v1.event.take.optional.invOrder.name"), type: ArgumentType.unknown, key: 'invOrder', format: 'string[,]', placeholder: 'e.g. Backpack', tooltip: L("betonquest.v1.event.take.optional.invOrder.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Checkbox, name: L("betonquest.v1.event.take.optional.notify.name"), type: ArgumentType.unknown, key: 'notify', format: 'boolean', tooltip: L("betonquest.v1.event.take.optional.notify.tooltip") },
                    ]
                }
            },
            // TODO: New optional data type: +-float
            // TODO: ... Or a seprated standalone editor
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/TimeEvent.java
                value: 'time',
                display: L("betonquest.v1.event.time.display"),
                description: L("betonquest.v1.event.time.description"),
                // e.g. time -12 world:rpgworld
                argumentsPatterns: {
                    mandatory: [
                        // {
                        //     jsx: Select, name: 'Action', type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                        //         options: [
                        //             {
                        //                 label: 'Set =',
                        //                 value: ''
                        //             },
                        //             {
                        //                 label: 'Add +',
                        //                 value: '+'
                        //             }
                        //         ] as DefaultOptionType[]
                        //     }
                        // },
                        // { jsx: NumberWithModifier, name: 'Hours', type: 'float', defaultValue: 0.0, config: { min: 0, modifiers: ['', '+'] }, allowVariable: true },
                        { jsx: Input, name: L("betonquest.v1.event.time.mandatory.hours.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '+0', placeholder: 'e.g. +1.25', tooltip: L("betonquest.v1.event.time.mandatory.hours.tooltip"), config: { allowedPatterns: [/^[\+\-]?\d*\.?\d*$/] } },
                    ],
                    optional: [
                        { jsx: Input, name: L("betonquest.v1.event.time.optional.world.name"), type: ArgumentType.unknown, key: 'world', format: 'string', placeholder: '(current)', tooltip: L("betonquest.v1.event.time.optional.world.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/TeleportEvent.java
                value: 'teleport',
                display: L("betonquest.v1.event.teleport.display"),
                description: L("betonquest.v1.event.teleport.description"),
                // e.g. teleport 123;32;-789;world_the_nether;180;45
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v1.event.teleport.mandatory.location.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/VariableEvent.java
                value: 'variable',
                display: L("betonquest.v1.event.variable.display"),
                description: L("betonquest.v1.event.variable.description"),
                // e.g. variable CustomVariable MyFirstVariable Goodbye!
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v1.event.variable.mandatory.variableObjectiveName.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_variable_objective_1', tooltip: L("betonquest.v1.event.variable.mandatory.variableObjectiveName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v1.event.variable.mandatory.variableName.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'a_variable_name_1', tooltip: '', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                        { jsx: Input, name: L("betonquest.v1.event.variable.mandatory.value.name"), type: ArgumentType.unknown, format: 'string', defaultValue: '""', tooltip: L("betonquest.v1.event.variable.mandatory.value.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] }, allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/WeatherEvent.java
                value: 'weather',
                display: L("betonquest.v1.event.weather.display"),
                description: L("betonquest.v1.event.weather.description"),
                // e.g. weather rain
                // e.g. weather storm
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v1.event.weather.mandatory.type.name"), type: ArgumentType.unknown, format: 'string', defaultValue: 'sun', placeholder: 'e.g. sun', config: {
                                options: [
                                    {
                                        label: L("betonquest.v1.event.weather.mandatory.type.option.sun"),
                                        value: 'sun'
                                    },
                                    {
                                        label: L("betonquest.v1.event.weather.mandatory.type.option.rain"),
                                        value: 'rain'
                                    },
                                    {
                                        label: L("betonquest.v1.event.weather.mandatory.type.option.storm"),
                                        value: 'storm'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ExperienceEvent.java
                value: 'experience',
                display: L("betonquest.v1.event.experience.display"),
                description: L("betonquest.v1.event.experience.description"),
                // e.g. experience -2 action:addLevel
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v1.event.experience.mandatory.amount.name"), type: ArgumentType.unknown, format: 'float', defaultValue: 0, tooltip: L("betonquest.v1.event.experience.mandatory.amount.tooltip"), allowVariable: true },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v1.event.experience.optional.level.name"), type: ArgumentType.unknown, key: 'level', format: 'boolean', tooltip: L("betonquest.v1.event.experience.optional.level.tooltip") },
                    ]
                }
            },
        ];
    }
}
