import { DefaultOptionType } from "antd/es/select";

import L from "../../i18n/i18n";
import { ArgumentType } from "../Arguments";
import Event from "../Event";
import { ElementKind } from "./Element";

import BaseLocation from "../../ui/Input/BaseLocation";
import BaseLocationList from "../../ui/Input/BaseLocationList";
import BlockSelector from "../../ui/Input/BlockSelector";
import Checkbox from "../../ui/Input/Checkbox";
import EntityType from "../../ui/Input/EntityType";
import EntityTypeList from "../../ui/Input/EntityTypeList";
import Input from "../../ui/Input/Input";
import InputList from "../../ui/Input/InputList";
import ItemList from "../../ui/Input/ItemList";
import Number from "../../ui/Input/Number";
import PotionEffectType from "../../ui/Input/PotionEffectType";
import PotionEffectTypeList from "../../ui/Input/PotionEffectTypeList";
import Select from "../../ui/Input/Select";
import TextArea from "../../ui/Input/TextArea";
import TextAreaList from "../../ui/Input/TextAreaList";
import { ArgumentsPatternOptional } from "../Arguments";

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
        this.kinds = ([
            {
                value: '*',
                display: L("betonquest.v2.event.*.display"),
                description: undefined,
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextArea, name: L("betonquest.v2.event.*.mandatory.value.name"), type: ArgumentType.any, format: '*', defaultValue: '' },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/cancel/CancelEventFactory.java
                value: 'cancel',
                display: L("betonquest.v2.event.cancel.display"),
                description: L("betonquest.v2.event.cancel.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.cancel.mandatory.canceler.name"), type: ArgumentType.string, format: 'string', defaultValue: 'a_canceler_name_1', tooltip: L("betonquest.v2.event.cancel.mandatory.canceler.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/burn/BurnEventFactory.java
                value: 'burn',
                display: L("betonquest.v2.event.burn.display"),
                description: L("betonquest.v2.event.burn.description"),
                // e.g. burn duration:4
                // e.g. burn duration:%point.punishment.amount%
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v2.event.burn.mandatory.duration.name"), type: ArgumentType.interger, key: 'duration', format: 'int', defaultValue: 0, tooltip: L("betonquest.v2.event.burn.mandatory.duration.tooltip"), config: { min: 0 }, allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/conversation/CancelConversationEventFactory.java
                value: 'cancelconversation',
                display: L("betonquest.v2.event.cancelconversation.display"),
                description: L("betonquest.v2.event.cancelconversation.description"),
                argumentsPatterns: {
                    mandatory: [],
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chat/ChatEventFactory.java
                value: 'chat',
                display: L("betonquest.v2.event.chat.display"),
                description: L("betonquest.v2.event.chat.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v2.event.chat.mandatory.messages.name"), type: ArgumentType.stringList, format: 'string[|]', defaultValue: [''] },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chest/ChestClearEventFactory.java
                value: 'chestclear',
                display: L("betonquest.v2.event.chestclear.display"),
                description: L("betonquest.v2.event.chestclear.description"),
                // e.g. chestclear 100;200;300;world
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.chestclear.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chest/ChestGiveEventFactory.java
                value: 'chestgive',
                display: L("betonquest.v2.event.chestgive.display"),
                description: L("betonquest.v2.event.chestgive.description"),
                // e.g. chestgive 100;200;300;world emerald:5,sword
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.chestgive.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                        { jsx: ItemList, name: L("betonquest.v2.event.chestgive.mandatory.itemList.name"), type: ArgumentType.itemIdListWithAmount, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chest/ChestTakeEventFactory.java
                value: 'chesttake',
                display: L("betonquest.v2.event.chesttake.display"),
                description: L("betonquest.v2.event.chesttake.description"),
                // e.g. chesttake 100;200;300;world emerald:5,sword
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.chesttake.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                        { jsx: ItemList, name: L("betonquest.v2.event.chesttake.mandatory.itemList.name"), type: ArgumentType.itemIdListWithAmount, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/CompassEvent.java
                value: 'compass',
                display: L("betonquest.v2.event.compass.display"),
                description: L("betonquest.v2.event.compass.description"),
                // e.g. compass add beton
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.compass.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.compass.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v2.event.compass.mandatory.action.option.del"),
                                        value: 'del'
                                    },
                                    {
                                        label: L("betonquest.v2.event.compass.mandatory.action.option.set"),
                                        value: 'set'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Input, name: L("betonquest.v2.event.compass.mandatory.compass.name"), type: ArgumentType.string, format: 'string', defaultValue: 'a_compass_1', placeholder: 'e.g. some_compass', tooltip: L("betonquest.v2.event.compass.mandatory.compass.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/CommandEventFactory.java
                value: 'command',
                display: L("betonquest.v2.event.command.display"),
                description: L("betonquest.v2.event.command.description"),
                // e.g. command kill %player%|ban %player%
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v2.event.command.mandatory.commands.name"), type: ArgumentType.string, format: 'string[|]', defaultValue: [''], placeholder: 'e.g. kill %player%', tooltip: L("betonquest.v2.event.command.mandatory.commands.tooltip") },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/conversation/ConversationEventFactory.java
                value: 'conversation',
                display: L("betonquest.v2.event.conversation.display"),
                description: L("betonquest.v2.event.conversation.description"),
                // e.g. conversation tutorial option:explain_world
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.conversation.mandatory.conversationName.name"), type: ArgumentType.conversationID, format: 'string', defaultValue: 'a_conversation_id_1', placeholder: 'e.g. village_smith', tooltip: L("betonquest.v2.event.conversation.mandatory.conversationName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                    optional: [
                        { jsx: Input, name: L("betonquest.v2.event.conversation.optional.option.name"), type: ArgumentType.conversationOptionID, key: 'option', format: 'string', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.conversation.optional.option.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/damage/DamageEventFactory.java
                value: 'damage',
                display: L("betonquest.v2.event.damage.display"),
                description: L("betonquest.v2.event.damage.description"),
                // e.g. damage 20
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v2.event.damage.mandatory.amount.name"), type: ArgumentType.float, format: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.damage.mandatory.amount.tooltip"), allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/DeletePointEventFactory.java
                value: 'deletepoint',
                display: L("betonquest.v2.event.deletepoint.display"),
                description: L("betonquest.v2.event.deletepoint.description"),
                // e.g. deletepoint npc_attitude
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.deletepoint.mandatory.pointCategory.name"), type: ArgumentType.pointCategory, format: 'string', defaultValue: 'a_point_category_1', placeholder: 'e.g. npc_attitude', tooltip: L("betonquest.v2.event.deletepoint.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/DeleteGlobalPointEventFactory.java
                value: 'deleteglobalpoint',
                display: L("betonquest.v2.event.deleteglobalpoint.display"),
                description: L("betonquest.v2.event.deleteglobalpoint.description"),
                // e.g. deleteglobalpoint bonus
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.deleteglobalpoint.mandatory.pointCategory.name"), type: ArgumentType.globalPointCategory, format: 'string', defaultValue: 'a_global_point_category_1_1', placeholder: 'e.g. bonus', tooltip: L("betonquest.v2.event.deleteglobalpoint.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/door/DoorEventFactory.java
                value: 'door',
                display: L("betonquest.v2.event.door.display"),
                description: L("betonquest.v2.event.door.description"),
                // e.g. door 100;200;300;world off
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.door.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        {
                            jsx: Select, name: L("betonquest.v2.event.door.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'toggle', placeholder: 'e.g. toggle', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.door.mandatory.action.option.toggle"),
                                        value: 'toggle'
                                    },
                                    {
                                        label: L("betonquest.v2.event.door.mandatory.action.option.on"),
                                        value: 'on'
                                    },
                                    {
                                        label: L("betonquest.v2.event.door.mandatory.action.option.off"),
                                        value: 'off'
                                    }
                                ] as DefaultOptionType[]
                            }
                        },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/drop/DropEventFactory.java
                value: 'drop',
                display: L("betonquest.v2.event.drop.display"),
                description: L("betonquest.v2.event.drop.description"),
                // e.g. drop items:myItem location:%objective.MyQuestVariables.DropLocation%
                argumentsPatterns: {
                    mandatory: [
                        { jsx: ItemList, name: L("betonquest.v2.event.drop.mandatory.items.name"), type: ArgumentType.itemIdListWithAmount, key: 'items', format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                    ],
                    optional: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.drop.optional.location.name"), type: ArgumentType.location, key: 'location', format: 'string', tooltip: L("betonquest.v2.event.drop.optional.location.tooltip"), config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0], optional: true }, allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/effect/DeleteEffectEventFactory.java
                value: 'deleffect',
                display: L("betonquest.v2.event.deleffect.display"),
                description: L("betonquest.v2.event.deleffect.description"),
                // e.g. deleffect ABSORPTION,BLINDNESS
                argumentsPatterns: {
                    mandatory: [
                        { jsx: PotionEffectTypeList, name: L("betonquest.v2.event.deleffect.mandatory.effects.name"), type: ArgumentType.potionEffect, format: 'string[,]', placeholder: 'any', defaultValue: ['any'], tooltip: L("betonquest.v2.event.deleffect.mandatory.effects.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/effect/EffectEventFactory.java
                value: 'effect',
                display: L("betonquest.v2.event.effect.display"),
                description: L("betonquest.v2.event.effect.description"),
                // e.g. effect BLINDNESS 30 1 ambient icon
                argumentsPatterns: {
                    mandatory: [
                        { jsx: PotionEffectType, name: L("betonquest.v2.event.effect.mandatory.effect.name"), type: ArgumentType.potionEffect, format: 'string', defaultValue: 'SPEED', tooltip: L("betonquest.v2.event.effect.mandatory.effect.tooltip") },
                        { jsx: Number, name: L("betonquest.v2.event.effect.mandatory.duration.name"), type: ArgumentType.interger, format: 'int', defaultValue: 0.0, tooltip: L("betonquest.v2.event.effect.mandatory.duration.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: Number, name: L("betonquest.v2.event.effect.mandatory.level.name"), type: ArgumentType.interger, format: 'int', defaultValue: 0, tooltip: L("betonquest.v2.event.effect.mandatory.level.tooltip"), config: { min: 0 }, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v2.event.effect.optional.ambient.name"), type: ArgumentType.constant, key: 'ambient', format: 'boolean', tooltip: L("betonquest.v2.event.effect.optional.ambient.tooltip") },
                        { jsx: Checkbox, name: L("betonquest.v2.event.effect.optional.hidden.name"), type: ArgumentType.constant, key: 'hidden', format: 'boolean', tooltip: L("betonquest.v2.event.effect.optional.hidden.tooltip") },
                        { jsx: Checkbox, name: L("betonquest.v2.event.effect.optional.noicon.name"), type: ArgumentType.constant, key: 'noicon', format: 'boolean', tooltip: L("betonquest.v2.event.effect.optional.noicon.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/experience/ExperienceEventFactory.java
                value: 'experience',
                display: L("betonquest.v2.event.experience.display"),
                description: L("betonquest.v2.event.experience.description"),
                // e.g. experience -2 action:addLevel
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v2.event.experience.mandatory.amount.name"), type: ArgumentType.float, format: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.experience.mandatory.amount.tooltip"), allowVariable: true },
                        {
                            jsx: Select, name: L("betonquest.v2.event.experience.mandatory.action.name"), type: ArgumentType.selection, key: 'action', format: 'string', defaultValue: 'action:addExperience', tooltip: L("betonquest.v2.event.experience.mandatory.action.tooltip"), placeholder: 'e.g. action:addExperience', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.experience.mandatory.action.option.addExperience"),
                                        value: 'addExperience'
                                    },
                                    {
                                        label: L("betonquest.v2.event.experience.mandatory.action.option.setExperienceBar"),
                                        value: 'setExperienceBar'
                                    },
                                    {
                                        label: L("betonquest.v2.event.experience.mandatory.action.option.addLevel"),
                                        value: 'addLevel'
                                    },
                                    {
                                        label: L("betonquest.v2.event.experience.mandatory.action.option.setLevel"),
                                        value: 'setLevel'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                    ],
                    optional: [
                        { jsx: Checkbox, name: <div><s>{L("betonquest.v2.event.experience.optional.level.name")}</s></div>, type: ArgumentType.constant, key: 'level', format: 'boolean', tooltip: L("betonquest.v2.event.experience.optional.level.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/explosion/ExplosionEventFactory.java
                value: 'explosion',
                display: L("betonquest.v2.event.explosion.display"),
                description: L("betonquest.v2.event.explosion.description"),
                // e.g. explosion 0 1 4 100;64;-100;survival
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.explosion.mandatory.withFire.name"), type: ArgumentType.selection, format: 'string', defaultValue: '0', placeholder: 'e.g. 0', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.explosion.mandatory.withFire.option.0"),
                                        value: '0'
                                    },
                                    {
                                        label: L("betonquest.v2.event.explosion.mandatory.withFire.option.1"),
                                        value: '1'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        {
                            jsx: Select, name: L("betonquest.v2.event.explosion.mandatory.destroyBlocks.name"), type: ArgumentType.selection, format: 'string', defaultValue: '0', placeholder: 'e.g. 0', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.explosion.mandatory.destroyBlocks.option.0"),
                                        value: '0'
                                    },
                                    {
                                        label: L("betonquest.v2.event.explosion.mandatory.destroyBlocks.option.1"),
                                        value: '1'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Number, name: L("betonquest.v2.event.explosion.mandatory.powerLevel.name"), type: ArgumentType.float, format: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.explosion.mandatory.powerLevel.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: BaseLocation, name: L("betonquest.v2.event.explosion.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                    ]
                }
            },
            // TODO: New optional data type: select
            // TODO: ... Or a seprated standalone editor
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/FolderEvent.java
                value: 'folder',
                display: L("betonquest.v2.event.folder.display"),
                description: L("betonquest.v2.event.folder.description"),
                // e.g. folder event1,event2,event3 delay:5 period:1
                argumentsPatterns: {
                    mandatory: [
                        { jsx: InputList, name: L("betonquest.v2.event.folder.mandatory.eventNames.name"), type: ArgumentType.eventIdList, format: 'string[,]', defaultValue: ['an_event_1'], placeholder: 'e.g. event1', tooltip: L("betonquest.v2.event.folder.mandatory.eventNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                    optional: [
                        { jsx: Number, name: L("betonquest.v2.event.folder.optional.delay.name"), type: ArgumentType.interger, key: 'delay', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.folder.optional.delay.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: Number, name: L("betonquest.v2.event.folder.optional.period.name"), type: ArgumentType.interger, key: 'period', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.folder.optional.period.tooltip"), config: { min: 0 }, allowVariable: true },
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
                        { jsx: Checkbox, name: L("betonquest.v2.event.folder.optional.minutes.name"), type: ArgumentType.constant, key: 'minutes', format: 'boolean', tooltip: L("betonquest.v2.event.folder.optional.minutes.tooltip") },
                        { jsx: Checkbox, name: L("betonquest.v2.event.folder.optional.ticks.name"), type: ArgumentType.constant, key: 'ticks', format: 'boolean', tooltip: L("betonquest.v2.event.folder.optional.ticks.tooltip") },
                        { jsx: Number, name: L("betonquest.v2.event.folder.optional.random.name"), type: ArgumentType.interger, key: 'random', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.folder.optional.random.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: Checkbox, name: L("betonquest.v2.event.folder.optional.cancelOnLogout.name"), type: ArgumentType.constant, key: 'cancelOnLogout', format: 'boolean', tooltip: L("betonquest.v2.event.folder.optional.cancelOnLogout.tooltip") },
                    ],
                },
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/logic/FirstEventFactory.java
                value: 'first',
                display: L("betonquest.v2.event.first.display"),
                description: L("betonquest.v2.event.first.description", [`
            <ul>
                <li>firstExample: "first event1,event2,event3"</li>
                <li>event1: "point carry boxes 10 action:add condition:firstCondition"</li>
                <li>event2: "point carry boxes 20 action:add condition:secondCondition"</li>
                <li>event3: "point carry boxes 40 action:add condition:thirdCondition"</li>
            </ul>`]),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: InputList, name: L("betonquest.v2.event.first.mandatory.eventNames.name"), type: ArgumentType.eventIdList, format: 'string[,]', defaultValue: ['an_event_1'], config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/give/GiveEventFactory.java
                value: 'give',
                display: L("betonquest.v2.event.give.display"),
                description: L("betonquest.v2.event.give.description"),
                // e.g. emerald:5,emerald_block:9,important_sign notify backpack
                argumentsPatterns: {
                    mandatory: [
                        { jsx: ItemList, name: L("betonquest.v2.event.give.mandatory.itemList.name"), type: ArgumentType.itemIdListWithAmount, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v2.event.give.optional.notify.name"), type: ArgumentType.constant, key: 'notify', format: 'boolean', tooltip: L("betonquest.v2.event.give.optional.notify.tooltip") },
                        { jsx: Checkbox, name: L("betonquest.v2.event.give.optional.backpack.name"), type: ArgumentType.constant, key: 'backpack', format: 'boolean', tooltip: L("betonquest.v2.event.give.optional.backpack.tooltip") }
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/journal/GiveJournalEventFactory.java
                value: 'givejournal',
                display: L("betonquest.v2.event.givejournal.display"),
                description: L("betonquest.v2.event.givejournal.description"),
                // e.g. givejournal
                argumentsPatterns: {
                    mandatory: []
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/GlobalPointEventFactory.java
                value: 'globalpoint',
                display: L("betonquest.v2.event.globalpoint.display"),
                description: L("betonquest.v2.event.globalpoint.description"),
                // e.g. global_knownusers 1 action:add
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.globalpoint.mandatory.pointCategory.name"), type: ArgumentType.globalPointCategory, format: 'string', defaultValue: 'a_point_category_1', placeholder: 'e.g. bonus', tooltip: L("betonquest.v2.event.globalpoint.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: multiplication prefix - '*'
                        { jsx: Number, name: L("betonquest.v2.event.globalpoint.mandatory.amount.name"), type: ArgumentType.float, format: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.globalpoint.mandatory.amount.tooltip"), allowVariable: true },
                        {
                            jsx: Select, name: L("betonquest.v2.event.globalpoint.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'action:add', placeholder: 'e.g. action:add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.globalpoint.mandatory.action.option.action:add"),
                                        value: 'action:add'
                                    },
                                    {
                                        label: L("betonquest.v2.event.globalpoint.mandatory.action.option.action:subtract"),
                                        value: 'action:subtract'
                                    },
                                    {
                                        label: L("betonquest.v2.event.globalpoint.mandatory.action.option.action:set"),
                                        value: 'action:set'
                                    },
                                    {
                                        label: L("betonquest.v2.event.globalpoint.mandatory.action.option.action:multiply"),
                                        value: 'action:multiply'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/tag/TagGlobalEventFactory.java
                value: 'globaltag',
                display: L("betonquest.v2.event.globaltag.display"),
                description: L("betonquest.v2.event.globaltag.description"),
                // e.g. globaltag add global_areNPCsAgressive
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.globaltag.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.globaltag.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v2.event.globaltag.mandatory.action.option.del"),
                                        value: 'del'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Input, name: L("betonquest.v2.event.globaltag.mandatory.tagName.name"), type: ArgumentType.globalTagCategory, format: 'string', defaultValue: 'a_global_tag_id_1', placeholder: 'e.g. reward_claimed', tooltip: L("betonquest.v2.event.globaltag.mandatory.tagName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/hunger/HungerEventFactory.java
                value: 'hunger',
                display: L("betonquest.v2.event.hunger.display"),
                description: L("betonquest.v2.event.hunger.description"),
                // e.g. hunger set 20
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.hunger.mandatory.modification.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'set', placeholder: 'e.g. set', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.hunger.mandatory.modification.option.set"),
                                        value: 'set'
                                    },
                                    {
                                        label: L("betonquest.v2.event.hunger.mandatory.modification.option.give"),
                                        value: 'give'
                                    },
                                    {
                                        label: L("betonquest.v2.event.hunger.mandatory.modification.option.take"),
                                        value: 'take'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Number, name: L("betonquest.v2.event.hunger.mandatory.amount.name"), type: ArgumentType.interger, format: 'int', defaultValue: 0, tooltip: L("betonquest.v2.event.hunger.mandatory.amount.tooltip"), allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/logic/IfElseEventFactory.java
                value: 'if',
                display: L("betonquest.v2.event.if.display"),
                description: L("betonquest.v2.event.if.description"),
                // e.g. if sun rain else sun
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.if.mandatory.conditionName.name"), type: ArgumentType.conditionID, format: 'string', defaultValue: 'a_positve_condition_1', config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.if.mandatory.positiveEventName.name"), type: ArgumentType.eventID, format: 'string', defaultValue: 'a_positive_event_1', config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: () => <>{L("betonquest.v2.event.if.mandatory.else.name")}</>, name: '', type: ArgumentType.constant, format: 'string', defaultValue: 'else' },
                        { jsx: Input, name: L("betonquest.v2.event.if.mandatory.negativeEventName.name"), type: ArgumentType.eventID, format: 'string', defaultValue: 'a_negative_event_1', config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/item/ItemDurabilityEventFactory.java
                value: 'itemdurability',
                display: L("betonquest.v2.event.itemdurability.display"),
                description: L("betonquest.v2.event.itemdurability.description"),
                // e.g. itemdurability CHEST SUBTRACT %randomnumber.whole.15~30% ignoreUnbreakable ignoreEvents
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.itemdurability.mandatory.slot.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'HAND', placeholder: 'e.g. HAND', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.hand"),
                                        value: 'HAND'
                                    },
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.off_hand"),
                                        value: 'OFF_HAND'
                                    },
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.head"),
                                        value: 'HEAD'
                                    },
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.chest"),
                                        value: 'CHEST'
                                    },
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.legs"),
                                        value: 'LEGS'
                                    },
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.feet"),
                                        value: 'FEET'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        {
                            jsx: Select, name: L("betonquest.v2.event.itemdurability.mandatory.operation.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'SET', placeholder: 'e.g. SET', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.operation.option.add"),
                                        value: 'ADD'
                                    },
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.operation.option.subtract"),
                                        value: 'SUBTRACT'
                                    },
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.operation.option.set"),
                                        value: 'SET'
                                    },
                                    {
                                        label: L("betonquest.v2.event.itemdurability.mandatory.operation.option.multiply"),
                                        value: 'MULTIPLY'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Number, name: L("betonquest.v2.event.itemdurability.mandatory.amount.name"), type: ArgumentType.float, format: 'float', defaultValue: 0, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v2.event.itemdurability.optional.ignoreUnbreakable.name"), type: ArgumentType.constant, key: 'ignoreUnbreakable', format: 'boolean', tooltip: L("betonquest.v2.event.itemdurability.optional.ignoreUnbreakable.tooltip") },
                        { jsx: Checkbox, name: L("betonquest.v2.event.itemdurability.optional.ignoreEvents.name"), type: ArgumentType.constant, key: 'ignoreEvents', format: 'boolean', tooltip: L("betonquest.v2.event.itemdurability.optional.ignoreEvents.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/journal/JournalEventFactory.java
                value: 'journal',
                display: L("betonquest.v2.event.journal.display"),
                description: L("betonquest.v2.event.journal.description"),
                // e.g. journal delete quest_available
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.journal.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.journal.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v2.event.journal.mandatory.action.option.delete"),
                                        value: 'delete'
                                    },
                                    {
                                        label: L("betonquest.v2.event.journal.mandatory.action.option.update"),
                                        value: 'update'
                                    }
                                ] as DefaultOptionType[]
                            }
                        },
                        // TODO: New optional data type: string
                        // TODO: ... Or a seprated standalone editor
                        { jsx: Input, name: L("betonquest.v2.event.journal.mandatory.journalName.name"), type: ArgumentType.journalID, format: 'string', defaultValue: '', placeholder: 'e.g. a_journal_id_1', tooltip: L("betonquest.v2.event.journal.mandatory.journalName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/kill/KillEventFactory.java
                value: 'kill',
                display: L("betonquest.v2.event.kill.display"),
                description: L("betonquest.v2.event.kill.description"),
                argumentsPatterns: {
                    mandatory: []
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/language/LanguageEventFactory.java
                value: 'language',
                display: L("betonquest.v2.event.language.display"),
                description: L("betonquest.v2.event.language.description"),
                // e.g. language en
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.language.mandatory.languageID.name"), type: ArgumentType.languageIdList, format: 'string', defaultValue: 'en', placeholder: 'e.g. en', config: { allowedPatterns: [/^[a-zA-Z_-]*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/lever/LeverEventFactory.java
                value: 'lever',
                display: L("betonquest.v2.event.lever.display"),
                description: L("betonquest.v2.event.lever.description"),
                // e.g. lever 100;200;300;world toggle
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.lever.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        {
                            jsx: Select, name: L("betonquest.v2.event.lever.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'toggle', placeholder: 'e.g. toggle', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.lever.mandatory.action.option.toggle"),
                                        value: 'toggle'
                                    },
                                    {
                                        label: L("betonquest.v2.event.lever.mandatory.action.option.on"),
                                        value: 'on'
                                    },
                                    {
                                        label: L("betonquest.v2.event.lever.mandatory.action.option.off"),
                                        value: 'off'
                                    }
                                ] as DefaultOptionType[]
                            }
                        },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/lightning/LightningEventFactory.java
                value: 'lightning',
                display: L("betonquest.v2.event.lightning.display"),
                description: L("betonquest.v2.event.lightning.description"),
                // e.g. lightning 200;65;100;survival noDamage
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.lightning.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v2.event.lightning.optional.noDamage.name"), type: ArgumentType.constant, key: 'noDamage', format: 'boolean', tooltip: L("betonquest.v2.event.lightning.optional.noDamage.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/notify/NotifyEventFactory.java
                value: 'notify',
                display: L("betonquest.v2.event.notify.display"),
                description: L("betonquest.v2.event.notify.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextArea, name: L("betonquest.v2.event.notify.mandatory.message.name"), type: ArgumentType.string, format: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
                    ],
                    optional: [
                        { jsx: InputList, name: L("betonquest.v2.event.notify.optional.category.name"), type: ArgumentType.stringList, key: 'category', format: 'string[,]', placeholder: 'e.g. info', tooltip: L("betonquest.v2.event.notify.optional.category.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.notify.optional.io.name"), type: ArgumentType.string, key: 'io', format: 'string', placeholder: 'e.g. bossbar', tooltip: L("betonquest.v2.event.notify.optional.io.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: Seprated standalone body. https://docs.betonquest.org/2.0-DEV/Documentation/Visual-Effects/Notifications/Notification-IO%27s-%26-Categories/
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/notify/NotifyAllEventFactory.java
                value: 'notifyall',
                display: L("betonquest.v2.event.notifyall.display"),
                description: L("betonquest.v2.event.notifyall.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextArea, name: L("betonquest.v2.event.notifyall.mandatory.message.name"), type: ArgumentType.string, format: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
                    ],
                    optional: [
                        { jsx: InputList, name: L("betonquest.v2.event.notifyall.optional.category.name"), type: ArgumentType.stringList, key: 'category', format: 'string[,]', placeholder: 'e.g. info', tooltip: L("betonquest.v2.event.notifyall.optional.category.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.notifyall.optional.io.name"), type: ArgumentType.string, key: 'io', format: 'string', placeholder: 'e.g. bossbar', tooltip: L("betonquest.v2.event.notifyall.optional.io.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: Seprated standalone body. https://docs.betonquest.org/2.0-DEV/Documentation/Visual-Effects/Notifications/Notification-IO%27s-%26-Categories/
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/log/LogEventFactory.java
                value: 'log',
                display: L("betonquest.v2.event.log.display"),
                description: L("betonquest.v2.event.log.description"),
                // e.g. log level:DEBUG daily quests have been reset
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextArea, name: L("betonquest.v2.event.log.mandatory.message.name"), type: ArgumentType.stringList, format: '*', defaultValue: '', escapeCharacters: [':'] },
                    ],
                    optional: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.log.optional.level.name"), type: ArgumentType.selection, key: 'level', format: 'string', placeholder: 'info', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.log.optional.level.option.debug"),
                                        value: 'debug'
                                    },
                                    {
                                        label: L("betonquest.v2.event.log.optional.level.option.info"),
                                        value: 'info'
                                    },
                                    {
                                        label: L("betonquest.v2.event.log.optional.level.option.warning"),
                                        value: 'warning'
                                    },
                                    {
                                        label: L("betonquest.v2.event.log.optional.level.option.error"),
                                        value: 'error'
                                    },
                                ] as DefaultOptionType[],
                                allowClear: true
                            }
                        },
                    ],
                    keepWhitespaces: true,
                    optionalAtFirst: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/ObjectiveEvent.java
                value: 'objective',
                display: L("betonquest.v2.event.objective.display"),
                description: L("betonquest.v2.event.objective.description"),
                // e.g. objective complete killTheDragon
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.objective.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.objective.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v2.event.objective.mandatory.action.option.remove"),
                                        value: 'remove'
                                    },
                                    {
                                        label: L("betonquest.v2.event.objective.mandatory.action.option.complete"),
                                        value: 'complete'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: InputList, name: L("betonquest.v2.event.objective.mandatory.objectiveNames.name"), type: ArgumentType.objectiveIdList, format: 'string[,]', defaultValue: ['an_objective_1'], config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/OpSudoEventFactory.java
                value: 'opsudo',
                display: L("betonquest.v2.event.opsudo.display"),
                description: L("betonquest.v2.event.opsudo.description"),
                // e.g. opsudo spawn
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v2.event.opsudo.mandatory.commands.name"), type: ArgumentType.stringList, format: 'string[|]', defaultValue: [''] },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/party/PartyEventFactory.java
                value: 'party',
                display: L("betonquest.v2.event.party.display"),
                description: L("betonquest.v2.event.party.description"),
                // e.g. party 10 has_tag1,!has_tag2 give_special_reward amount:3
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v2.event.party.mandatory.distance.name"), type: ArgumentType.float, format: 'float', defaultValue: 0.0, tooltip: L("betonquest.v2.event.party.mandatory.distance.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: InputList, name: L("betonquest.v2.event.party.mandatory.conditionNames.name"), type: ArgumentType.conditionIdList, format: 'string[,]', placeholder: L("(none)"), defaultValue: ['a_condition_1'], tooltip: L("betonquest.v2.event.party.mandatory.conditionNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: InputList, name: L("betonquest.v2.event.party.mandatory.eventNames.name"), type: ArgumentType.eventIdList, format: 'string[,]', placeholder: 'any', defaultValue: ['an_event_1'], tooltip: L("betonquest.v2.event.party.mandatory.eventNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                    optional: [
                        { jsx: Number, name: L("betonquest.v2.event.party.optional.amount.name"), type: ArgumentType.interger, key: 'amount', format: 'int', placeholder: 'everyone', tooltip: L("betonquest.v2.event.party.optional.amount.tooltip"), config: { min: 0 }, allowVariable: true },
                    ]
                }
            },
            // TODO: Seprated standalone Editor
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/random/PickRandomEventFactory.java
                value: 'pickrandom',
                display: L("betonquest.v2.event.pickrandom.display"),
                description: L("betonquest.v2.event.pickrandom.description"),
                // e.g. pickrandom %point.factionXP.amount%%event1,0.5%event2,79%event3,1%event4 amount:3
                argumentsPatterns: {
                    mandatory: [
                        { jsx: InputList, name: L("betonquest.v2.event.pickrandom.mandatory.conditions.name"), type: ArgumentType.stringList, format: 'string[,]', placeholder: 'e.g. 12.3%event1', defaultValue: ['0.0%event1'], tooltip: L("betonquest.v2.event.pickrandom.mandatory.conditions.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                    optional: [
                        { jsx: Number, name: L("betonquest.v2.event.pickrandom.optional.amount.name"), type: ArgumentType.interger, key: 'amount', format: 'int', placeholder: '1', tooltip: L("betonquest.v2.event.pickrandom.optional.amount.tooltip"), config: { min: 0 }, allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/PointEventFactory.java
                value: 'point',
                display: L("betonquest.v2.event.point.display"),
                description: L("betonquest.v2.event.point.description"),
                // e.g. point points 1.25 action:multiply notify
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.point.mandatory.pointCategory.name"), type: ArgumentType.pointCategory, format: 'string', defaultValue: 'a_point_category_1', placeholder: 'e.g. bonus', tooltip: L("betonquest.v2.event.point.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: multiplication prefix - '*'
                        { jsx: Number, name: L("betonquest.v2.event.point.mandatory.amount.name"), type: ArgumentType.float, format: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.point.mandatory.amount.tooltip"), allowVariable: true },
                    ],
                    optional: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.point.optional.action.name"), type: ArgumentType.selection, key: 'action', format: 'string', placeholder: 'e.g. action:add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.point.optional.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v2.event.point.optional.action.option.subtract"),
                                        value: 'subtract'
                                    },
                                    {
                                        label: L("betonquest.v2.event.point.optional.action.option.set"),
                                        value: 'set'
                                    },
                                    {
                                        label: L("betonquest.v2.event.point.optional.action.option.multiply"),
                                        value: 'multiply'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: Checkbox, name: L("betonquest.v2.event.point.optional.notify.name"), type: ArgumentType.constant, key: 'notify', format: 'boolean', tooltip: L("betonquest.v2.event.point.optional.notify.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/entity/RemoveEntityEventFactory.java
                value: 'removeentity',
                display: L("betonquest.v2.event.removeentity.display"),
                description: L("betonquest.v2.event.removeentity.description"),
                // editorBody: KillMob,
                // e.g. removeentity ZOMBIE 100;200;300;world 10 name:Monster kill
                // e.g. removeentity ARROW,SNOWBALL,WOLF,ARMOR_STAND 100;200;300;world 50 marked:minigame
                argumentsPatterns: {
                    mandatory: [
                        { jsx: EntityTypeList, name: L("betonquest.v2.event.removeentity.mandatory.entityType.name"), type: ArgumentType.entityList, format: 'string[,]', defaultValue: ['ZOMBIE'], placeholder: 'e.g. ZOMBIE' },
                        { jsx: BaseLocation, name: L("betonquest.v2.event.removeentity.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        { jsx: Number, name: L("betonquest.v2.event.removeentity.mandatory.radius.name"), type: ArgumentType.float, format: 'float', defaultValue: 0.0, config: { min: 0 }, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Input, name: L("betonquest.v2.event.removeentity.optional.name.name"), type: ArgumentType.entityName, key: 'name', format: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v2.event.removeentity.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.removeentity.optional.marked.name"), type: ArgumentType.entityMark, key: 'marked', format: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v2.event.removeentity.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Checkbox, name: L("betonquest.v2.event.removeentity.optional.kill.name"), type: ArgumentType.constant, key: 'kill', format: 'boolean', tooltip: L("betonquest.v2.event.removeentity.optional.kill.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/RunEvent.java
                value: 'run',
                display: L("betonquest.v2.event.run.display"),
                description: L("betonquest.v2.event.run.description"),
                // e.g. run ^tag add beton ^give emerald:5 ^entry add beton ^kill
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v2.event.run.mandatory.eventInstruction.name"), type: ArgumentType.stringList, format: 'string[^]', defaultValue: [''], placeholder: 'e.g. give item:1', tooltip: L("betonquest.v2.event.run.mandatory.eventInstruction.tooltip") },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/run/RunForAllEventFactory.java
                value: 'runForAll',
                display: L("betonquest.v2.event.runForAll.display"),
                description: L("betonquest.v2.event.runForAll.description"),
                // e.g. runForAll where:!isOp events:kickPlayer,restartQuest
                argumentsPatterns: {
                    mandatory: [
                        // For some reason this can be optional in BQ: https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/quest/event/run/RunForAllEventFactory.java#L34
                        // But it is better to make it mandatory.
                        { jsx: InputList, name: L("betonquest.v2.event.runForAll.mandatory.events.name"), type: ArgumentType.eventIdList, key: 'events', format: 'string[,]', defaultValue: ['an_event_id_1'], placeholder: 'e.g. kickPlayer', tooltip: L("betonquest.v2.event.runForAll.mandatory.events.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                    optional: [
                        // { jsx: InputList, name: 'Event Names', key: 'events', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: 'List of Event Names to be executed', config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: InputList, name: L("betonquest.v2.event.runForAll.optional.where.name"), type: ArgumentType.conditionIdList, key: 'where', format: 'string[,]', placeholder: 'e.g. trigger_condition_id_1', tooltip: L("betonquest.v2.event.runForAll.optional.where.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // { jsx: InputList, name: 'Conditions of Trigger', key: 'conditions', type: 'string[,]', placeholder: 'e.g. trigger_condition_id_1', tooltip: 'List of Condition Names to be checked on the player whom triggers this event. If conditions are not met by this player, no Events will be executed on all other players.', config: { allowedPatterns: [/^\S*$/] } },
                    ],
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/run/RunIndependentEventFactory.java
                value: 'runIndependent',
                display: L("betonquest.v2.event.runIndependent.display"),
                description: L("betonquest.v2.event.runIndependent.description"),
                // e.g. runIndependent events:removeObjective,clearTags,resetJournal
                argumentsPatterns: {
                    mandatory: [
                        { jsx: InputList, name: L("betonquest.v2.event.runIndependent.mandatory.events.name"), type: ArgumentType.eventIdList, key: 'events', format: 'string[,]', defaultValue: ['an_event_1'], placeholder: 'e.g. kickPlayer', tooltip: L("betonquest.v2.event.runIndependent.mandatory.events.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                    optional: [
                        // { jsx: InputList, name: 'Event Names', key: 'events', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: 'List of Event Names to be executed', config: { allowedPatterns: [/^\S*$/] } },
                    ],
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/scoreboard/ScoreboardEventFactory.java
                value: 'score',
                display: L("betonquest.v2.event.score.display"),
                description: L("betonquest.v2.event.score.description"),
                // e.g. score kill 1.2 action:multiply
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.score.mandatory.name.name"), type: ArgumentType.scoreName, format: 'string', defaultValue: '*', placeholder: 'e.g. Quest_Points', tooltip: L("betonquest.v2.event.score.mandatory.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        // TODO: multiplication prefix - '*'
                        { jsx: Number, name: L("betonquest.v2.event.score.mandatory.amount.name"), type: ArgumentType.float, format: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.score.mandatory.amount.tooltip"), allowVariable: true },
                        {
                            jsx: Select, name: L("betonquest.v2.event.score.mandatory.action.name"), type: ArgumentType.selection, key: 'action', format: 'string', defaultValue: 'action:add', placeholder: 'e.g. action:add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.score.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v2.event.score.mandatory.action.option.subtract"),
                                        value: 'subtract'
                                    },
                                    {
                                        label: L("betonquest.v2.event.score.mandatory.action.option.set"),
                                        value: 'set'
                                    },
                                    {
                                        label: L("betonquest.v2.event.score.mandatory.action.option.multiply"),
                                        value: 'multiply'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/setblock/SetBlockEventFactory.java
                value: 'setblock',
                display: L("betonquest.v2.event.setblock.display"),
                description: L("betonquest.v2.event.setblock.description"),
                // e.g. setblock SAND 100;200;300;world ignorePhysics
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BlockSelector, name: L("betonquest.v2.event.setblock.mandatory.blockSelector.name"), type: ArgumentType.blockID, format: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: L("betonquest.v2.event.setblock.mandatory.blockSelector.tooltip") },
                        { jsx: BaseLocation, name: L("betonquest.v2.event.setblock.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v2.event.setblock.optional.ignorePhysics.name"), type: ArgumentType.constant, key: 'ignorePhysics', format: 'boolean', tooltip: L("betonquest.v2.event.setblock.optional.ignorePhysics.tooltip") },
                    ]
                }
            },
            // TODO: Seprated standalone editor
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/stage/StageEventFactory.java
                value: 'stage',
                display: L("betonquest.v2.event.stage.display"),
                description: L("betonquest.v2.event.stage.description"),
                // e.g. stage bakeCookies decrease 2
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.stage.mandatory.stageObjective.name"), type: ArgumentType.objectiveID, format: 'string', defaultValue: 'a_stage_objective_1', placeholder: 'e.g. bakeCookies', tooltip: L("betonquest.v2.event.stage.mandatory.stageObjective.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        {
                            jsx: Select, name: L("betonquest.v2.event.stage.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'increase', placeholder: 'e.g. increase', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.stage.mandatory.action.option.set"),
                                        value: 'set'
                                    },
                                    {
                                        label: L("betonquest.v2.event.stage.mandatory.action.option.increase"),
                                        value: 'increase'
                                    },
                                    {
                                        label: L("betonquest.v2.event.stage.mandatory.action.option.decrease"),
                                        value: 'decrease'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        // TODO: name or number depending on action above
                        { jsx: Input, name: L("betonquest.v2.event.stage.mandatory.stageName.name"), type: ArgumentType.stageName, format: 'string', defaultValue: 'a_stage_name_1', placeholder: 'e.g. stage_1', tooltip: L("betonquest.v2.event.stage.mandatory.stageName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ],
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/SpawnMobEvent.java
                value: 'spawn',
                display: L("betonquest.v2.event.spawn.display"),
                description: L("betonquest.v2.event.spawn.description"),
                // e.g. spawn 100;200;300;world ZOMBIE name:Bolec 1 h:blue_hat c:red_vest drops:emerald:10,bread:2
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.spawn.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                        { jsx: EntityType, name: L("betonquest.v2.event.spawn.mandatory.entityType.name"), type: ArgumentType.entity, format: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                        { jsx: Number, name: L("betonquest.v2.event.spawn.mandatory.amount.name"), type: ArgumentType.interger, format: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
                    ],
                    optional: [
                        { jsx: Input, name: L("betonquest.v2.event.spawn.optional.name.name"), type: ArgumentType.entityName, key: 'name', format: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v2.event.spawn.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.spawn.optional.marked.name"), type: ArgumentType.entityMark, key: 'marked', format: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v2.event.spawn.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.spawn.optional.h.name"), type: ArgumentType.itemID, key: 'h', format: 'string', placeholder: 'e.g. blue_hat', tooltip: L("betonquest.v2.event.spawn.optional.h.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.spawn.optional.c.name"), type: ArgumentType.itemID, key: 'c', format: 'string', placeholder: 'e.g. red_vest', tooltip: L("betonquest.v2.event.spawn.optional.c.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.spawn.optional.l.name"), type: ArgumentType.itemID, key: 'l', format: 'string', placeholder: 'e.g. yellow_leggings', tooltip: L("betonquest.v2.event.spawn.optional.l.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.spawn.optional.b.name"), type: ArgumentType.itemID, key: 'b', format: 'string', placeholder: 'e.g. purple_boots', tooltip: L("betonquest.v2.event.spawn.optional.b.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.spawn.optional.m.name"), type: ArgumentType.itemID, key: 'm', format: 'string', placeholder: 'e.g. wooden_sword', tooltip: L("betonquest.v2.event.spawn.optional.m.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.spawn.optional.o.name"), type: ArgumentType.itemID, key: 'o', format: 'string', placeholder: 'e.g. wooden_shield', tooltip: L("betonquest.v2.event.spawn.optional.o.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: InputList, name: L("betonquest.v2.event.spawn.optional.drops.name"), type: ArgumentType.itemIdListWithAmount, key: 'drops', format: '[string:number?][,]', placeholder: 'e.g. diamond', tooltip: L("betonquest.v2.event.spawn.optional.drops.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/SudoEventFactory.java
                value: 'sudo',
                display: L("betonquest.v2.event.sudo.display"),
                description: L("betonquest.v2.event.sudo.description"),
                // e.g. sudo spawn
                argumentsPatterns: {
                    mandatory: [
                        { jsx: TextAreaList, name: L("betonquest.v2.event.sudo.mandatory.commands.name"), type: ArgumentType.stringList, format: 'string[|]', defaultValue: [''] },
                    ],
                    keepWhitespaces: true
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/tag/TagPlayerEventFactory.java
                value: 'tag',
                display: L("betonquest.v2.event.tag.display"),
                description: L("betonquest.v2.event.tag.description"),
                // e.g. tag add quest_started,new_entry
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.tag.mandatory.action.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.tag.mandatory.action.option.add"),
                                        value: 'add'
                                    },
                                    {
                                        label: L("betonquest.v2.event.tag.mandatory.action.option.delete"),
                                        value: 'delete'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                        { jsx: InputList, name: L("betonquest.v2.event.tag.mandatory.tagNames.name"), type: ArgumentType.tagName, format: 'string[,]', defaultValue: ['a_tag_1'], config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/TakeEvent.java
                value: 'take',
                display: L("betonquest.v2.event.take.display"),
                description: L("betonquest.v2.event.take.description"),
                // e.g. take emerald:120,sword invOrder:Armor,Offhand,Inventory,Backpack
                argumentsPatterns: {
                    mandatory: [
                        { jsx: ItemList, name: L("betonquest.v2.event.take.mandatory.itemList.name"), type: ArgumentType.itemIdListWithAmount, format: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', 'all'] },
                    ],
                    optional: [
                        // TODO: Picker input
                        { jsx: InputList, name: L("betonquest.v2.event.take.optional.invOrder.name"), type: ArgumentType.stringList, key: 'invOrder', format: 'string[,]', placeholder: 'e.g. Backpack', tooltip: L("betonquest.v2.event.take.optional.invOrder.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Checkbox, name: L("betonquest.v2.event.take.optional.notify.name"), type: ArgumentType.constant, key: 'notify', format: 'boolean', tooltip: L("betonquest.v2.event.take.optional.notify.tooltip") },
                    ]
                }
            },
            // TODO: New optional data type: +-float
            // TODO: ... Or a seprated standalone editor
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/time/TimeEventFactory.java
                value: 'time',
                display: L("betonquest.v2.event.time.display"),
                description: L("betonquest.v2.event.time.description"),
                // e.g. time -12 world:rpgworld
                // e.g. time +%randomnumber.whole.100~2000% world:pvpworld ticks
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
                        //             },
                        //             {
                        //                 label: 'Subtract -',
                        //                 value: '-'
                        //             }
                        //         ] as DefaultOptionType[]
                        //     }
                        // },
                        // { jsx: NumberWithModifier, name: 'Time', type: 'float', defaultValue: 0.0, config: { min: 0, modifiers: ['', '+', '-'] }, allowVariable: true },
                        { jsx: Input, name: L("betonquest.v2.event.time.mandatory.time.name"), type: ArgumentType.string, format: 'string', defaultValue: '+0', placeholder: 'e.g. +1.25', tooltip: L("betonquest.v2.event.time.mandatory.time.tooltip"), config: { allowedPatterns: [/^[\+\-]?\d*\.?\d*$/] } },
                    ],
                    optional: [
                        { jsx: Input, name: L("betonquest.v2.event.time.optional.world.name"), type: ArgumentType.string, key: 'world', format: 'string', placeholder: '(current)', tooltip: L("betonquest.v2.event.time.optional.world.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Checkbox, name: L("betonquest.v2.event.time.optional.ticks.name"), type: ArgumentType.constant, key: 'ticks', format: 'boolean', tooltip: L("betonquest.v2.event.time.optional.ticks.tooltip") },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/teleport/TeleportEventFactory.java
                value: 'teleport',
                display: L("betonquest.v2.event.teleport.display"),
                description: L("betonquest.v2.event.teleport.description"),
                // e.g. teleport 123;32;-789;world_the_nether;180;45
                argumentsPatterns: {
                    mandatory: [
                        { jsx: BaseLocation, name: L("betonquest.v2.event.teleport.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/VariableEvent.java
                value: 'variable',
                display: L("betonquest.v2.event.variable.display"),
                description: L("betonquest.v2.event.variable.description"),
                // e.g. variable CustomVariable MyFirstVariable Goodbye!
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Input, name: L("betonquest.v2.event.variable.mandatory.variableObjectiveName.name"), type: ArgumentType.objectiveID, format: 'string', defaultValue: 'a_variable_objective_1', tooltip: L("betonquest.v2.event.variable.mandatory.variableObjectiveName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: Input, name: L("betonquest.v2.event.variable.mandatory.variableName.name"), type: ArgumentType.variable, format: 'string', defaultValue: 'a_variable_name_1', tooltip: '', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                        { jsx: Input, name: L("betonquest.v2.event.variable.mandatory.value.name"), type: ArgumentType.string, format: 'string', defaultValue: '""', tooltip: L("betonquest.v2.event.variable.mandatory.value.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] }, allowVariable: true },
                    ]
                }
            },
            // TODO: vector Input
            // TODO: ... Or a seprated standalone editor
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/velocity/VelocityEventFactory.java
                value: 'velocity',
                display: L("betonquest.v2.event.velocity.display"),
                description: L("betonquest.v2.event.velocity.description"),
                // e.g. velocity vector:(0;0.1;1.3) direction:relative_y
                // e.g. velocity vector:%objective.customVariable.dashLength% direction:relative_y modification:add
                argumentsPatterns: {
                    mandatory: [
                        // For some reason this can be optional in BQ: https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/quest/event/velocity/VelocityEventFactory.java#L56
                        // It is better to make it mandatory.
                        { jsx: Input, name: L("betonquest.v2.event.velocity.mandatory.vector.name"), type: ArgumentType.vector, key: 'vector', format: 'string', defaultValue: '(0.0;0.0;0.0)', placeholder: 'e.g. (0;0.1;1.3)', tooltip: L("betonquest.v2.event.velocity.mandatory.vector.tooltip"), config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                    ],
                    optional: [
                        // { jsx: Input, name: 'Vector', key: 'vector', type: 'string', placeholder: 'e.g. (0;0.1;1.3)', tooltip: 'The values of the vector: (x;y;z) for absolute direction, (sideways;upwards;forwards) for relative direction', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                        {
                            jsx: Select, name: L("betonquest.v2.event.velocity.optional.direction.name"), type: ArgumentType.selection, key: 'direction', format: 'string', placeholder: 'absolute - Absolute', tooltip: L("betonquest.v2.event.velocity.optional.direction.tooltip"), config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.velocity.optional.direction.option.absolute"),
                                        value: 'absolute'
                                    },
                                    {
                                        label: L("betonquest.v2.event.velocity.optional.direction.option.relative_y"),
                                        value: 'relative_y'
                                    },
                                    {
                                        label: L("betonquest.v2.event.velocity.optional.direction.option.relative"),
                                        value: 'relative'
                                    },
                                ] as DefaultOptionType[],
                                allowClear: true
                            }
                        },
                        {
                            jsx: Select, name: L("betonquest.v2.event.velocity.optional.modification.name"), type: ArgumentType.selection, key: 'modification', format: 'string', placeholder: '`set` - Set / Replace', tooltip: '', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.velocity.optional.modification.option.set"),
                                        value: 'set'
                                    },
                                    {
                                        label: L("betonquest.v2.event.velocity.optional.modification.option.add"),
                                        value: 'add'
                                    },
                                ] as DefaultOptionType[],
                                allowClear: true
                            }
                        },
                    ]
                }
            },
            {
                // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/weather/WeatherEventFactory.java
                value: 'weather',
                display: L("betonquest.v2.event.weather.display"),
                description: L("betonquest.v2.event.weather.description"),
                // e.g. weather rain duration:60 world:rpgworld
                // e.g. weather storm duration:%point.tribute.left:150%
                argumentsPatterns: {
                    mandatory: [
                        {
                            jsx: Select, name: L("betonquest.v2.event.weather.mandatory.type.name"), type: ArgumentType.selection, format: 'string', defaultValue: 'sun', placeholder: 'e.g. sun', config: {
                                options: [
                                    {
                                        label: L("betonquest.v2.event.weather.mandatory.type.option.sun"),
                                        value: 'sun'
                                    },
                                    {
                                        label: L("betonquest.v2.event.weather.mandatory.type.option.rain"),
                                        value: 'rain'
                                    },
                                    {
                                        label: L("betonquest.v2.event.weather.mandatory.type.option.storm"),
                                        value: 'storm'
                                    },
                                ] as DefaultOptionType[]
                            }
                        },
                    ],
                    optional: [
                        // TODO: This option does not present in BetonQuest source but in the documentation.
                        { jsx: Number, name: L("betonquest.v2.event.weather.optional.duration.name"), type: ArgumentType.interger, key: 'duration', format: 'int', placeholder: 'random', tooltip: L("betonquest.v2.event.weather.optional.duration.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: Input, name: L("betonquest.v2.event.weather.optional.world.name"), type: ArgumentType.string, key: 'world', format: 'string', placeholder: 'current', tooltip: L("betonquest.v2.event.weather.optional.world.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },

            // Third-party Plugins Integrations

            // Citizens - https://betonquest.org/2.1/Documentation/Scripting/Building-Blocks/Integration-List/#citizens
            {
                value: 'movenpc',
                display: L("betonquest.v2.event.movenpc.display"),
                description: L("betonquest.v2.event.movenpc.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v2.event.movenpc.mandatory.npcID.name"), type: ArgumentType.interger, format: 'int', defaultValue: 0, tooltip: L("betonquest.v2.event.movenpc.mandatory.npcID.tooltip"), config: { min: 0, forceInterger: true } },
                        { jsx: BaseLocationList, name: L("betonquest.v2.event.movenpc.mandatory.locations.name"), type: ArgumentType.locationList, format: 'string[,]', defaultValue: ['0.5;64;0.5;world'], tooltip: L("betonquest.v2.event.movenpc.mandatory.locations.tooltip"), allowVariable: true },
                    ],
                    optional: [
                        { jsx: Checkbox, name: L("betonquest.v2.event.movenpc.optional.block.name"), type: ArgumentType.constant, key: 'block', format: 'boolean', tooltip: L("betonquest.v2.event.movenpc.optional.block.tooltip") },
                        { jsx: Number, name: L("betonquest.v2.event.movenpc.optional.wait.name"), type: ArgumentType.interger, key: 'wait', format: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.movenpc.optional.wait.tooltip"), config: { min: 0 }, allowVariable: true },
                        { jsx: InputList, name: L("betonquest.v2.event.movenpc.optional.done.name"), key: 'done', type: ArgumentType.eventIdList, format: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: L("betonquest.v2.event.movenpc.optional.done.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                        { jsx: InputList, name: L("betonquest.v2.event.movenpc.optional.fail.name"), key: 'fail', type: ArgumentType.eventIdList, format: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: L("betonquest.v2.event.movenpc.optional.fail.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                    ]
                }
            },
            {
                value: 'stopnpc',
                display: L("betonquest.v2.event.stopnpc.display"),
                description: L("betonquest.v2.event.stopnpc.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v2.event.stopnpc.mandatory.npcID.name"), type: ArgumentType.interger, format: 'int', defaultValue: 0, tooltip: L("betonquest.v2.event.stopnpc.mandatory.npcID.tooltip"), config: { min: 0, forceInterger: true } },
                    ],
                }
            },
            {
                value: 'teleportnpc',
                display: L("betonquest.v2.event.teleportnpc.display"),
                description: L("betonquest.v2.event.teleportnpc.description"),
                argumentsPatterns: {
                    mandatory: [
                        { jsx: Number, name: L("betonquest.v2.event.teleportnpc.mandatory.npcID.name"), type: ArgumentType.interger, format: 'int', defaultValue: 0, tooltip: L("betonquest.v2.event.teleportnpc.mandatory.npcID.tooltip"), config: { min: 0, forceInterger: true } },
                        { jsx: BaseLocation, name: L("betonquest.v2.event.teleportnpc.mandatory.location.name"), type: ArgumentType.location, format: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                    ],
                }
            },
        ] as ElementKind<Event>[]).map(kind => {
            // Default optional arguments for every kind
            const defaultOptionalArguments: ArgumentsPatternOptional[] = [
                { jsx: InputList, name: L("betonquest.v2.event.*.optional.conditions.name"), type: ArgumentType.conditionIdList, key: 'conditions', format: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.*.optional.conditions.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ];
            if (kind.argumentsPatterns.optional) {
                kind.argumentsPatterns.optional.push(...defaultOptionalArguments);
            } else {
                kind.argumentsPatterns.optional = defaultOptionalArguments;
            }
            return kind;
        });
    }
}
