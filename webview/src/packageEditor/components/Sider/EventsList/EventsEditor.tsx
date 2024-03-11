import { DefaultOptionType } from "antd/es/select";

import L from "betonquest-utils/i18n/i18n";
import Event from "betonquest-utils/betonquest/Event";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";

import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";
import KillMob from "./EventsEditor/KillMob";

import BaseLocation from "../CommonList/Input/BaseLocation";
import BlockSelector from "../CommonList/Input/BlockSelector";
import Checkbox from "../CommonList/Input/Checkbox";
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
import PotionEffectType from "../CommonList/Input/PotionEffectType";
import { ArgumentsPatternOptional } from "betonquest-utils/betonquest/Arguments";

// Default optional arguments for every kind
const defaultOptionalArguments: ArgumentsPatternOptional[] = [
    { jsx: InputList, name: L("betonquest.v2.event.*.optional.conditions.name"), key: 'conditions', type: 'string[,]', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.*.optional.conditions.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
];

// All kinds
const kinds: Kind<Event>[] = ([
    {
        value: '*',
        display: L("betonquest.v2.event.*.display"),
        description: undefined,
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: L("betonquest.v2.event.*.mandatory.value.name"), type: '*', defaultValue: '' },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/cancel/CancelEventFactory.java
        value: 'cancel',
        display: L("betonquest.v2.event.cancel.display"),
        description: L("betonquest.v2.event.cancel.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.cancel.mandatory.canceler.name"), type: 'string', defaultValue: 'a_canceler_name_1', tooltip: L("betonquest.v2.event.cancel.mandatory.canceler.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
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
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.event.burn.mandatory.duration.name"), key: 'duration', type: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.burn.mandatory.duration.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/conversation/CancelConversationEventFactory.java
        value: 'cancelconversation',
        display: L("betonquest.v2.event.cancelconversation.display"),
        description: L("betonquest.v2.event.cancelconversation.description"),
        argumentsPattern: {
            mandatory: [],
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chat/ChatEventFactory.java
        value: 'chat',
        display: L("betonquest.v2.event.chat.display"),
        description: L("betonquest.v2.event.chat.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: L("betonquest.v2.event.chat.mandatory.messages.name"), type: 'string[|]', defaultValue: [''] },
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
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.chestclear.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chest/ChestGiveEventFactory.java
        value: 'chestgive',
        display: L("betonquest.v2.event.chestgive.display"),
        description: L("betonquest.v2.event.chestgive.description"),
        // e.g. chestgive 100;200;300;world emerald:5,sword
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.chestgive.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: ItemList, name: L("betonquest.v2.event.chestgive.mandatory.itemList.name"), type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chest/ChestTakeEventFactory.java
        value: 'chesttake',
        display: L("betonquest.v2.event.chesttake.display"),
        description: L("betonquest.v2.event.chesttake.description"),
        // e.g. chesttake 100;200;300;world emerald:5,sword
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.chesttake.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: ItemList, name: L("betonquest.v2.event.chesttake.mandatory.itemList.name"), type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/CompassEvent.java
        value: 'compass',
        display: L("betonquest.v2.event.compass.display"),
        description: L("betonquest.v2.event.compass.description"),
        // e.g. compass add beton
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.compass.mandatory.action.name"), type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
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
                { jsx: Input, name: L("betonquest.v2.event.compass.mandatory.compass.name"), type: 'string', defaultValue: 'a_compass_1', placeholder: 'e.g. some_compass', tooltip: L("betonquest.v2.event.compass.mandatory.compass.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/CommandEventFactory.java
        value: 'command',
        display: L("betonquest.v2.event.command.display"),
        description: L("betonquest.v2.event.command.description"),
        // e.g. command kill %player%|ban %player%
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: L("betonquest.v2.event.command.mandatory.commands.name"), type: 'string[|]', defaultValue: [''], placeholder: 'e.g. kill %player%', tooltip: L("betonquest.v2.event.command.mandatory.commands.tooltip") },
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
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.conversation.mandatory.conversationName.name"), type: 'string', defaultValue: 'a_conversation_id_1', placeholder: 'e.g. village_smith', tooltip: L("betonquest.v2.event.conversation.mandatory.conversationName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.event.conversation.optional.option.name"), key: 'option', type: 'string', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.conversation.optional.option.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/damage/DamageEventFactory.java
        value: 'damage',
        display: L("betonquest.v2.event.damage.display"),
        description: L("betonquest.v2.event.damage.description"),
        // e.g. damage 20
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.event.damage.mandatory.amount.name"), type: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.damage.mandatory.amount.tooltip"), allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/DeletePointEventFactory.java
        value: 'deletepoint',
        display: L("betonquest.v2.event.deletepoint.display"),
        description: L("betonquest.v2.event.deletepoint.description"),
        // e.g. deletepoint npc_attitude
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.deletepoint.mandatory.pointCategory.name"), type: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. npc_attitude', tooltip: L("betonquest.v2.event.deletepoint.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/DeleteGlobalPointEventFactory.java
        value: 'deleteglobalpoint',
        display: L("betonquest.v2.event.deleteglobalpoint.display"),
        description: L("betonquest.v2.event.deleteglobalpoint.description"),
        // e.g. deleteglobalpoint bonus
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.deleteglobalpoint.mandatory.pointCategory.name"), type: 'string', defaultValue: 'a_global_point_id_1', placeholder: 'e.g. bonus', tooltip: L("betonquest.v2.event.deleteglobalpoint.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/door/DoorEventFactory.java
        value: 'door',
        display: L("betonquest.v2.event.door.display"),
        description: L("betonquest.v2.event.door.description"),
        // e.g. door 100;200;300;world off
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.door.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                {
                    jsx: Select, name: L("betonquest.v2.event.door.mandatory.action.name"), type: 'string', defaultValue: 'toggle', placeholder: 'e.g. toggle', config: {
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
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: L("betonquest.v2.event.drop.mandatory.items.name"), key: 'items', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.drop.optional.location.name"), key: 'location', type: 'string', tooltip: L("betonquest.v2.event.drop.optional.location.tooltip"), config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0], optional: true }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/effect/DeleteEffectEventFactory.java
        value: 'deleffect',
        display: L("betonquest.v2.event.deleffect.display"),
        description: L("betonquest.v2.event.deleffect.description"),
        // e.g. deleffect ABSORPTION,BLINDNESS
        argumentsPattern: {
            mandatory: [
                { jsx: PotionEffectTypeList, name: L("betonquest.v2.event.deleffect.mandatory.effects.name"), type: 'string[,]', placeholder: 'any', defaultValue: ['any'], tooltip: L("betonquest.v2.event.deleffect.mandatory.effects.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/effect/EffectEventFactory.java
        value: 'effect',
        display: L("betonquest.v2.event.effect.display"),
        description: L("betonquest.v2.event.effect.description"),
        // e.g. effect BLINDNESS 30 1 ambient icon
        argumentsPattern: {
            mandatory: [
                { jsx: PotionEffectType, name: L("betonquest.v2.event.effect.mandatory.effect.name"), type: 'string', defaultValue: 'SPEED', tooltip: L("betonquest.v2.event.effect.mandatory.effect.tooltip") },
                { jsx: Number, name: L("betonquest.v2.event.effect.mandatory.duration.name"), type: 'float', defaultValue: 0.0, tooltip: L("betonquest.v2.event.effect.mandatory.duration.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.event.effect.mandatory.level.name"), type: 'int', defaultValue: 0, tooltip: L("betonquest.v2.event.effect.mandatory.level.tooltip"), config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.event.effect.optional.ambient.name"), key: 'ambient', type: 'boolean', tooltip: L("betonquest.v2.event.effect.optional.ambient.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.event.effect.optional.hidden.name"), key: 'hidden', type: 'boolean', tooltip: L("betonquest.v2.event.effect.optional.hidden.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.event.effect.optional.noicon.name"), key: 'noicon', type: 'boolean', tooltip: L("betonquest.v2.event.effect.optional.noicon.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/experience/ExperienceEventFactory.java
        value: 'experience',
        display: L("betonquest.v2.event.experience.display"),
        description: L("betonquest.v2.event.experience.description"),
        // e.g. experience -2 action:addLevel
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.event.experience.mandatory.amount.name"), type: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.experience.mandatory.amount.tooltip"), allowVariable: true },
                {
                    jsx: Select, name: L("betonquest.v2.event.experience.mandatory.action.name"), key: 'action', type: 'string', defaultValue: 'action:addExperience', tooltip: L("betonquest.v2.event.experience.mandatory.action.tooltip"), placeholder: 'e.g. action:addExperience', config: {
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
                { jsx: Checkbox, name: <div><s>{L("betonquest.v2.event.experience.optional.level.name")}</s></div>, key: 'level', type: 'boolean', tooltip: L("betonquest.v2.event.experience.optional.level.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/explosion/ExplosionEventFactory.java
        value: 'explosion',
        display: L("betonquest.v2.event.explosion.display"),
        description: L("betonquest.v2.event.explosion.description"),
        // e.g. explosion 0 1 4 100;64;-100;survival
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.explosion.mandatory.withFire.name"), type: 'string', defaultValue: '0', placeholder: 'e.g. 0', config: {
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
                    jsx: Select, name: L("betonquest.v2.event.explosion.mandatory.destroyBlocks.name"), type: 'string', defaultValue: '0', placeholder: 'e.g. 0', config: {
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
                { jsx: Number, name: L("betonquest.v2.event.explosion.mandatory.powerLevel.name"), type: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.explosion.mandatory.powerLevel.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: BaseLocation, name: L("betonquest.v2.event.explosion.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
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
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.event.folder.mandatory.eventNames.name"), type: 'string[,]', defaultValue: ['an_event_1'], placeholder: 'e.g. event1', tooltip: L("betonquest.v2.event.folder.mandatory.eventNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.event.folder.optional.delay.name"), key: 'delay', type: 'float', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.folder.optional.delay.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.event.folder.optional.period.name"), key: 'period', type: 'float', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.folder.optional.period.tooltip"), config: { min: 0 }, allowVariable: true },
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
                { jsx: Checkbox, name: L("betonquest.v2.event.folder.optional.minutes.name"), key: 'minutes', type: 'boolean', tooltip: L("betonquest.v2.event.folder.optional.minutes.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.event.folder.optional.ticks.name"), key: 'ticks', type: 'boolean', tooltip: L("betonquest.v2.event.folder.optional.ticks.tooltip") },
                { jsx: Number, name: L("betonquest.v2.event.folder.optional.random.name"), key: 'random', type: 'int', placeholder: L("(none)"), tooltip: L("betonquest.v2.event.folder.optional.random.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: Checkbox, name: L("betonquest.v2.event.folder.optional.cancelOnLogout.name"), key: 'cancelOnLogout', type: 'boolean', tooltip: L("betonquest.v2.event.folder.optional.cancelOnLogout.tooltip") },
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
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.event.first.mandatory.eventNames.name"), type: 'string[,]', defaultValue: ['an_event_1'], config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/give/GiveEventFactory.java
        value: 'give',
        display: L("betonquest.v2.event.give.display"),
        description: L("betonquest.v2.event.give.description"),
        // e.g. emerald:5,emerald_block:9,important_sign notify backpack
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: L("betonquest.v2.event.give.mandatory.itemList.name"), type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.event.give.optional.notify.name"), key: 'notify', type: 'boolean', tooltip: L("betonquest.v2.event.give.optional.notify.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.event.give.optional.backpack.name"), key: 'backpack', type: 'boolean', tooltip: L("betonquest.v2.event.give.optional.backpack.tooltip") }
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/journal/GiveJournalEventFactory.java
        value: 'givejournal',
        display: L("betonquest.v2.event.givejournal.display"),
        description: L("betonquest.v2.event.givejournal.description"),
        // e.g. givejournal
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/GlobalPointEventFactory.java
        value: 'globalpoint',
        display: L("betonquest.v2.event.globalpoint.display"),
        description: L("betonquest.v2.event.globalpoint.description"),
        // e.g. global_knownusers 1 action:add
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.globalpoint.mandatory.pointCategory.name"), type: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. bonus', tooltip: L("betonquest.v2.event.globalpoint.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                // TODO: multiplication prefix - '*'
                { jsx: Number, name: L("betonquest.v2.event.globalpoint.mandatory.amount.name"), type: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.globalpoint.mandatory.amount.tooltip"), allowVariable: true },
                {
                    jsx: Select, name: L("betonquest.v2.event.globalpoint.mandatory.action.name"), type: 'string', defaultValue: 'action:add', placeholder: 'e.g. action:add', config: {
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
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.globaltag.mandatory.action.name"), type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
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
                { jsx: Input, name: L("betonquest.v2.event.globaltag.mandatory.tagName.name"), type: 'string', defaultValue: 'a_global_tag_id_1', placeholder: 'e.g. reward_claimed', tooltip: L("betonquest.v2.event.globaltag.mandatory.tagName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/hunger/HungerEventFactory.java
        value: 'hunger',
        display: L("betonquest.v2.event.hunger.display"),
        description: L("betonquest.v2.event.hunger.description"),
        // e.g. hunger set 20
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.hunger.mandatory.modification.name"), type: 'string', defaultValue: 'set', placeholder: 'e.g. set', config: {
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
                { jsx: Number, name: L("betonquest.v2.event.hunger.mandatory.amount.name"), type: 'int', defaultValue: 0, tooltip: L("betonquest.v2.event.hunger.mandatory.amount.tooltip"), allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/logic/IfElseEventFactory.java
        value: 'if',
        display: L("betonquest.v2.event.if.display"),
        description: L("betonquest.v2.event.if.description"),
        // e.g. if sun rain else sun
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.if.mandatory.conditionName.name"), type: 'string', defaultValue: 'a_positve_condition_1', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.if.mandatory.positiveEventName.name"), type: 'string', defaultValue: 'a_positive_event_1', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: () => <>{L("betonquest.v1.event.if.mandatory.else.name")}</>, name: '', type: 'string', defaultValue: 'else' },
                { jsx: Input, name: L("betonquest.v2.event.if.mandatory.negativeEventName.name"), type: 'string', defaultValue: 'a_negative_event_1', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/item/ItemDurabilityEventFactory.java
        value: 'itemdurability',
        display: L("betonquest.v2.event.itemdurability.display"),
        description: L("betonquest.v2.event.itemdurability.description"),
        // e.g. itemdurability CHEST SUBTRACT %randomnumber.whole.15~30% ignoreUnbreakable ignoreEvents
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.itemdurability.mandatory.slot.name"), type: 'string', defaultValue: 'HAND', placeholder: 'e.g. HAND', config: {
                        options: [
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.HAND"),
                                value: 'HAND'
                            },
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.OFF_HAND"),
                                value: 'OFF_HAND'
                            },
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.HEAD"),
                                value: 'HEAD'
                            },
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.CHEST"),
                                value: 'CHEST'
                            },
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.LEGS"),
                                value: 'LEGS'
                            },
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.slot.option.FEET"),
                                value: 'FEET'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                {
                    jsx: Select, name: L("betonquest.v2.event.itemdurability.mandatory.operation.name"), type: 'string', defaultValue: 'SET', placeholder: 'e.g. SET', config: {
                        options: [
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.operation.option.ADD"),
                                value: 'ADD'
                            },
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.operation.option.SUBTRACT"),
                                value: 'SUBTRACT'
                            },
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.operation.option.SET"),
                                value: 'SET'
                            },
                            {
                                label: L("betonquest.v2.event.itemdurability.mandatory.operation.option.MULTIPLY"),
                                value: 'MULTIPLY'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Number, name: L("betonquest.v2.event.itemdurability.mandatory.amount.name"), type: 'float', defaultValue: 0, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.event.itemdurability.optional.ignoreUnbreakable.name"), key: 'ignoreUnbreakable', type: 'boolean', tooltip: L("betonquest.v2.event.itemdurability.optional.ignoreUnbreakable.tooltip") },
                { jsx: Checkbox, name: L("betonquest.v2.event.itemdurability.optional.ignoreEvents.name"), key: 'ignoreEvents', type: 'boolean', tooltip: L("betonquest.v2.event.itemdurability.optional.ignoreEvents.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/journal/JournalEventFactory.java
        value: 'journal',
        display: L("betonquest.v2.event.journal.display"),
        description: L("betonquest.v2.event.journal.description"),
        // e.g. journal delete quest_available
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.journal.mandatory.action.name"), type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
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
                { jsx: Input, name: L("betonquest.v2.event.journal.mandatory.journalName.name"), type: 'string', defaultValue: '', placeholder: 'e.g. a_journal_id_1', tooltip: L("betonquest.v2.event.journal.mandatory.journalName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/kill/KillEventFactory.java
        value: 'kill',
        display: L("betonquest.v2.event.kill.display"),
        description: L("betonquest.v2.event.kill.description"),
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/language/LanguageEventFactory.java
        value: 'language',
        display: L("betonquest.v2.event.language.display"),
        description: L("betonquest.v2.event.language.description"),
        // e.g. language en
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.language.mandatory.languageID.name"), type: 'string', defaultValue: 'en', placeholder: 'e.g. en', config: { allowedPatterns: [/^[a-zA-Z_-]*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/lever/LeverEventFactory.java
        value: 'lever',
        display: L("betonquest.v2.event.lever.display"),
        description: L("betonquest.v2.event.lever.description"),
        // e.g. lever 100;200;300;world toggle
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.lever.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                {
                    jsx: Select, name: L("betonquest.v2.event.lever.mandatory.action.name"), type: 'string', defaultValue: 'toggle', placeholder: 'e.g. toggle', config: {
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
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.lightning.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.event.lightning.optional.noDamage.name"), key: 'noDamage', type: 'boolean', tooltip: L("betonquest.v2.event.lightning.optional.noDamage.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/notify/NotifyEventFactory.java
        value: 'notify',
        display: L("betonquest.v2.event.notify.display"),
        description: L("betonquest.v2.event.notify.description"),
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: L("betonquest.v2.event.notify.mandatory.message.name"), type: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
            ],
            optional: [
                { jsx: InputList, name: L("betonquest.v2.event.notify.optional.category.name"), key: 'category', type: 'string[,]', placeholder: 'e.g. info', tooltip: L("betonquest.v2.event.notify.optional.category.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.notify.optional.io.name"), key: 'io', type: 'string', placeholder: 'e.g. bossbar', tooltip: L("betonquest.v2.event.notify.optional.io.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
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
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: L("betonquest.v2.event.notifyall.mandatory.message.name"), type: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
            ],
            optional: [
                { jsx: InputList, name: L("betonquest.v2.event.notifyall.optional.category.name"), key: 'category', type: 'string[,]', placeholder: 'e.g. info', tooltip: L("betonquest.v2.event.notifyall.optional.category.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.notifyall.optional.io.name"), key: 'io', type: 'string', placeholder: 'e.g. bossbar', tooltip: L("betonquest.v2.event.notifyall.optional.io.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
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
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: L("betonquest.v2.event.log.mandatory.message.name"), type: '*', defaultValue: '', escapeCharacters: [':'] },
            ],
            optional: [
                {
                    jsx: Select, name: L("betonquest.v2.event.log.optional.level.name"), key: 'level', type: 'string', placeholder: 'info', config: {
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
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.objective.mandatory.action.name"), type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
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
                { jsx: InputList, name: L("betonquest.v2.event.objective.mandatory.objectiveNames.name"), type: 'string[,]', defaultValue: ['an_objective_1'], config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/OpSudoEventFactory.java
        value: 'opsudo',
        display: L("betonquest.v2.event.opsudo.display"),
        description: L("betonquest.v2.event.opsudo.description"),
        // e.g. opsudo spawn
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: L("betonquest.v2.event.opsudo.mandatory.commands.name"), type: 'string[|]', defaultValue: [''] },
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
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: L("betonquest.v2.event.party.mandatory.distance.name"), type: 'float', defaultValue: 0.0, tooltip: L("betonquest.v2.event.party.mandatory.distance.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: InputList, name: L("betonquest.v2.event.party.mandatory.conditionNames.name"), type: 'string[,]', placeholder: L("(none)"), defaultValue: ['a_condition_1'], tooltip: L("betonquest.v2.event.party.mandatory.conditionNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: L("betonquest.v2.event.party.mandatory.eventNames.name"), type: 'string[,]', placeholder: 'any', defaultValue: ['an_event_1'], tooltip: L("betonquest.v2.event.party.mandatory.eventNames.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.event.party.optional.amount.name"), key: 'amount', type: 'int', placeholder: 'everyone', tooltip: L("betonquest.v2.event.party.optional.amount.tooltip"), config: { min: 0 }, allowVariable: true },
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
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.event.pickrandom.mandatory.conditions.name"), type: 'string[,]', placeholder: 'e.g. 12.3%event1', defaultValue: ['a_condition_1'], tooltip: L("betonquest.v2.event.pickrandom.mandatory.conditions.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: L("betonquest.v2.event.pickrandom.optional.amount.name"), key: 'amount', type: 'int', placeholder: '1', tooltip: L("betonquest.v2.event.pickrandom.optional.amount.tooltip"), config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/PointEventFactory.java
        value: 'point',
        display: L("betonquest.v2.event.point.display"),
        description: L("betonquest.v2.event.point.description"),
        // e.g. point points 1.25 action:multiply notify
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.point.mandatory.pointCategory.name"), type: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. bonus', tooltip: L("betonquest.v2.event.point.mandatory.pointCategory.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                // TODO: multiplication prefix - '*'
                { jsx: Number, name: L("betonquest.v2.event.point.mandatory.amount.name"), type: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.point.mandatory.amount.tooltip"), allowVariable: true },
            ],
            optional: [
                {
                    jsx: Select, name: L("betonquest.v2.event.point.optional.action.name"), key: 'action', type: 'string', placeholder: 'e.g. action:add', config: {
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
                { jsx: Checkbox, name: L("betonquest.v2.event.point.optional.notify.name"), key: 'notify', type: 'boolean', tooltip: L("betonquest.v2.event.point.optional.notify.tooltip") },
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
        argumentsPattern: {
            mandatory: [
                { jsx: EntityTypeList, name: L("betonquest.v2.event.removeentity.mandatory.entityType.name"), type: 'string[,]', defaultValue: ['ZOMBIE'], placeholder: 'e.g. ZOMBIE' },
                { jsx: BaseLocation, name: L("betonquest.v2.event.removeentity.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                { jsx: Number, name: L("betonquest.v2.event.removeentity.mandatory.radius.name"), type: 'float', defaultValue: 0.0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.event.removeentity.optional.name.name"), key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v2.event.removeentity.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.removeentity.optional.marked.name"), key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v2.event.removeentity.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: L("betonquest.v2.event.removeentity.optional.kill.name"), key: 'kill', type: 'boolean', tooltip: L("betonquest.v2.event.removeentity.optional.kill.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/RunEvent.java
        value: 'run',
        display: L("betonquest.v2.event.run.display"),
        description: L("betonquest.v2.event.run.description"),
        // e.g. run ^tag add beton ^give emerald:5 ^entry add beton ^kill
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: L("betonquest.v2.event.run.mandatory.eventInstruction.name"), type: 'string[^]', defaultValue: [''], placeholder: 'e.g. give item:1', tooltip: L("betonquest.v2.event.run.mandatory.eventInstruction.tooltip") },
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
        argumentsPattern: {
            mandatory: [
                // For some reason this can be optional in BQ: https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/quest/event/run/RunForAllEventFactory.java#L34
                // But it is better to make it mandatory.
                { jsx: InputList, name: L("betonquest.v2.event.runForAll.mandatory.events.name"), key: 'events', type: 'string[,]', defaultValue: ['an_event_id_1'], placeholder: 'e.g. kickPlayer', tooltip: L("betonquest.v2.event.runForAll.mandatory.events.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                // { jsx: InputList, name: 'Event Names', key: 'events', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: 'List of Event Names to be executed', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: L("betonquest.v2.event.runForAll.optional.where.name"), key: 'where', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: L("betonquest.v2.event.runForAll.optional.where.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                // { jsx: InputList, name: 'Conditions of Trigger', key: 'conditions', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: 'List of Condition Names to be checked on the player whom triggers this event. If conditions are not met by this player, no Events will be executed on all other players.', config: { allowedPatterns: [/^\S*$/] } },
            ],
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/run/RunIndependentEventFactory.java
        value: 'runIndependent',
        display: L("betonquest.v2.event.runIndependent.display"),
        description: L("betonquest.v2.event.runIndependent.description"),
        // e.g. runIndependent events:removeObjective,clearTags,resetJournal
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: L("betonquest.v2.event.runIndependent.mandatory.events.name"), key: 'events', type: 'string[,]', defaultValue: ['an_event_1'], placeholder: 'e.g. kickPlayer', tooltip: L("betonquest.v2.event.runIndependent.mandatory.events.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
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
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.score.mandatory.name.name"), type: 'string', defaultValue: '*', placeholder: 'e.g. Quest_Points', tooltip: L("betonquest.v2.event.score.mandatory.name.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                // TODO: multiplication prefix - '*'
                { jsx: Number, name: L("betonquest.v2.event.score.mandatory.amount.name"), type: 'float', defaultValue: 0, tooltip: L("betonquest.v2.event.score.mandatory.amount.tooltip"), allowVariable: true },
                {
                    jsx: Select, name: L("betonquest.v2.event.score.mandatory.action.name"), key: 'action', type: 'string', defaultValue: 'action:add', placeholder: 'e.g. action:add', config: {
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
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: L("betonquest.v2.event.setblock.mandatory.blockSelector.name"), type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: L("betonquest.v2.event.setblock.mandatory.blockSelector.tooltip") },
                { jsx: BaseLocation, name: L("betonquest.v2.event.setblock.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: L("betonquest.v2.event.setblock.optional.ignorePhysics.name"), key: 'ignorePhysics', type: 'boolean', tooltip: L("betonquest.v2.event.setblock.optional.ignorePhysics.tooltip") },
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
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.stage.mandatory.stageObjective.name"), type: 'string', defaultValue: 'a_stage_objective_1', placeholder: 'e.g. bakeCookies', tooltip: L("betonquest.v2.event.stage.mandatory.stageObjective.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                {
                    jsx: Select, name: L("betonquest.v2.event.stage.mandatory.action.name"), type: 'string', defaultValue: 'increase', placeholder: 'e.g. increase', config: {
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
                { jsx: Input, name: L("betonquest.v2.event.stage.mandatory.stageName.name"), type: 'string', defaultValue: 'a_stage_name_1', placeholder: 'e.g. stage_1', tooltip: L("betonquest.v2.event.stage.mandatory.stageName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ],
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/SpawnMobEvent.java
        value: 'spawn',
        display: L("betonquest.v2.event.spawn.display"),
        description: L("betonquest.v2.event.spawn.description"),
        // e.g. spawn 100;200;300;world ZOMBIE name:Bolec 1 h:blue_hat c:red_vest drops:emerald:10,bread:2
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.spawn.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                { jsx: EntityType, name: L("betonquest.v2.event.spawn.mandatory.entityType.name"), type: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                { jsx: Number, name: L("betonquest.v2.event.spawn.mandatory.amount.name"), type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.event.spawn.optional.name.name"), key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: L("betonquest.v2.event.spawn.optional.name.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.spawn.optional.marked.name"), key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: L("betonquest.v2.event.spawn.optional.marked.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.spawn.optional.h.name"), key: 'h', type: 'string', placeholder: 'e.g. blue_hat', tooltip: L("betonquest.v2.event.spawn.optional.h.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.spawn.optional.c.name"), key: 'c', type: 'string', placeholder: 'e.g. red_vest', tooltip: L("betonquest.v2.event.spawn.optional.c.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.spawn.optional.l.name"), key: 'l', type: 'string', placeholder: 'e.g. yellow_leggings', tooltip: L("betonquest.v2.event.spawn.optional.l.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.spawn.optional.b.name"), key: 'b', type: 'string', placeholder: 'e.g. purple_boots', tooltip: L("betonquest.v2.event.spawn.optional.b.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.spawn.optional.m.name"), key: 'm', type: 'string', placeholder: 'e.g. wooden_sword', tooltip: L("betonquest.v2.event.spawn.optional.m.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.spawn.optional.o.name"), key: 'o', type: 'string', placeholder: 'e.g. wooden_shield', tooltip: L("betonquest.v2.event.spawn.optional.o.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: L("betonquest.v2.event.spawn.optional.drops.name"), key: 'drops', type: 'string[,]', placeholder: 'e.g. diamond', tooltip: L("betonquest.v2.event.spawn.optional.drops.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/SudoEventFactory.java
        value: 'sudo',
        display: L("betonquest.v2.event.sudo.display"),
        description: L("betonquest.v2.event.sudo.description"),
        // e.g. sudo spawn
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: L("betonquest.v2.event.sudo.mandatory.commands.name"), type: 'string[|]', defaultValue: [''] },
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
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.tag.mandatory.action.name"), type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
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
                { jsx: InputList, name: L("betonquest.v2.event.tag.mandatory.tagNames.name"), type: 'string[,]', defaultValue: ['a_tag_1'], config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/TakeEvent.java
        value: 'take',
        display: L("betonquest.v2.event.take.display"),
        description: L("betonquest.v2.event.take.description"),
        // e.g. take emerald:120,sword invOrder:Armor,Offhand,Inventory,Backpack
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: L("betonquest.v2.event.take.mandatory.itemList.name"), type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', 'all'] },
            ],
            optional: [
                // TODO: Picker input
                { jsx: InputList, name: L("betonquest.v2.event.take.optional.invOrder.name"), key: 'invOrder', type: 'string[,]', placeholder: 'e.g. Backpack', tooltip: L("betonquest.v2.event.take.optional.invOrder.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: L("betonquest.v2.event.take.optional.notify.name"), key: 'notify', type: 'boolean', tooltip: L("betonquest.v2.event.take.optional.notify.tooltip") },
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
        argumentsPattern: {
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
                { jsx: Input, name: L("betonquest.v2.event.time.mandatory.time.name"), type: 'string', defaultValue: '+0', placeholder: 'e.g. +1.25', tooltip: L("betonquest.v2.event.time.mandatory.time.tooltip"), config: { allowedPatterns: [/^[\+\-]?\d*\.?\d*$/] } },
            ],
            optional: [
                { jsx: Input, name: L("betonquest.v2.event.time.optional.world.name"), key: 'world', type: 'string', placeholder: '(current)', tooltip: L("betonquest.v2.event.time.optional.world.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: L("betonquest.v2.event.time.optional.ticks.name"), key: 'ticks', type: 'boolean', tooltip: L("betonquest.v2.event.time.optional.ticks.tooltip") },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/teleport/TeleportEventFactory.java
        value: 'teleport',
        display: L("betonquest.v2.event.teleport.display"),
        description: L("betonquest.v2.event.teleport.description"),
        // e.g. teleport 123;32;-789;world_the_nether;180;45
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: L("betonquest.v2.event.teleport.mandatory.location.name"), type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/VariableEvent.java
        value: 'variable',
        display: L("betonquest.v2.event.variable.display"),
        description: L("betonquest.v2.event.variable.description"),
        // e.g. variable CustomVariable MyFirstVariable Goodbye!
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: L("betonquest.v2.event.variable.mandatory.variableObjectiveName.name"), type: 'string', defaultValue: 'a_variable_objective_1', tooltip: L("betonquest.v2.event.variable.mandatory.variableObjectiveName.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: L("betonquest.v2.event.variable.mandatory.variableName.name"), type: 'string', defaultValue: 'a_variable_name_1', tooltip: '', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                { jsx: Input, name: L("betonquest.v2.event.variable.mandatory.value.name"), type: 'string', defaultValue: '""', tooltip: L("betonquest.v2.event.variable.mandatory.value.tooltip"), escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] }, allowVariable: true },
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
        argumentsPattern: {
            mandatory: [
                // For some reason this can be optional in BQ: https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/quest/event/velocity/VelocityEventFactory.java#L56
                // It is better to make it mandatory.
                { jsx: Input, name: L("betonquest.v2.event.velocity.mandatory.vector.name"), key: 'vector', type: 'string', defaultValue: '(0.0;0.0;0.0)', placeholder: 'e.g. (0;0.1;1.3)', tooltip: L("betonquest.v2.event.velocity.mandatory.vector.tooltip"), config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
            ],
            optional: [
                // { jsx: Input, name: 'Vector', key: 'vector', type: 'string', placeholder: 'e.g. (0;0.1;1.3)', tooltip: 'The values of the vector: (x;y;z) for absolute direction, (sideways;upwards;forwards) for relative direction', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                {
                    jsx: Select, name: L("betonquest.v2.event.velocity.optional.direction.name"), key: 'direction', type: 'string', placeholder: 'absolute - Absolute', tooltip: L("betonquest.v2.event.velocity.optional.direction.tooltip"), config: {
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
                    jsx: Select, name: L("betonquest.v2.event.velocity.optional.modification.name"), key: 'modification', type: 'string', placeholder: '`set` - Set / Replace', tooltip: '', config: {
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
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: L("betonquest.v2.event.weather.mandatory.type.name"), type: 'string', defaultValue: 'sun', placeholder: 'e.g. sun', config: {
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
                { jsx: Number, name: L("betonquest.v2.event.weather.optional.duration.name"), key: 'duration', type: 'float', placeholder: 'random', tooltip: L("betonquest.v2.event.weather.optional.duration.tooltip"), config: { min: 0 }, allowVariable: true },
                { jsx: Input, name: L("betonquest.v2.event.weather.optional.world.name"), key: 'world', type: 'string', placeholder: 'current', tooltip: L("betonquest.v2.event.weather.optional.world.tooltip"), config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    }
] as Kind<Event>[]).map(kind => {
    if (kind.argumentsPattern.optional) {
        kind.argumentsPattern.optional.push(...defaultOptionalArguments);
    } else {
        kind.argumentsPattern.optional = defaultOptionalArguments;
    }
    return kind;
});

export default function (props: ListElementEditorProps<Event>) {

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}