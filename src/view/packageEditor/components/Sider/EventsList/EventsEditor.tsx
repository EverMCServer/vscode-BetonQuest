import React from "react";
import { DefaultOptionType } from "antd/es/select";

import Event from "../../../../../betonquest/Event";
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
import { ArgumentsPatternOptional } from "../../../../../betonquest/Arguments";

// Default optional arguments for every kind
const defaultOptionalArguments: ArgumentsPatternOptional[] = [
    { jsx: InputList, name: 'Conditions', key: 'conditions', type: 'string[,]', placeholder: '(none)', tooltip: 'Conditions to be satisfied or it will not be executed', config: { allowedPatterns: [/^\S*$/] } },
];

// All kinds
const kinds: Kind<Event>[] = ([
    {
        value: '*',
        display: '*',
        description: undefined,
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: 'Value', type: '*', defaultValue: '' },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/cancel/CancelEventFactory.java
        value: 'cancel',
        display: 'Cancel (cancel)',
        description: 'Cancel a quest predefined in a Quest Canceler.',
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Canceler', type: 'string', defaultValue: 'a_canceler_name_1', tooltip: 'A canceler name predefined in the package\'s `cancel:` section', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/burn/BurnEventFactory.java
        value: 'burn',
        display: 'Burn',
        description: 'Set fire on the player.',
        // e.g. burn duration:4
        // e.g. burn duration:%point.punishment.amount%
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Duration', key: 'duration', type: 'float', defaultValue: 0, tooltip: 'The duration the player will burn (in seconds).', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/conversation/CancelConversationEventFactory.java
        value: 'cancelconversation',
        display: 'Cancel Conversation',
        description: 'Cancels the active conversation of the player.',
        argumentsPattern: {
            mandatory: [],
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chat/ChatEventFactory.java
        value: 'chat',
        display: 'Chat',
        description: 'Send the given message as the player.',
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Messages', type: 'string[|]', defaultValue: [''] },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chest/ChestClearEventFactory.java
        value: 'chestclear',
        display: 'Chest Clear',
        description: 'Removes all items from a chest at specified location.',
        // e.g. chestclear 100;200;300;world
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chest/ChestGiveEventFactory.java
        value: 'chestgive',
        display: 'Chest Give',
        description: 'Puts items in a chest at specified location.',
        // e.g. chestgive 100;200;300;world emerald:5,sword
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/chest/ChestTakeEventFactory.java
        value: 'chesttake',
        display: 'Chest Take',
        description: 'Removes items from a chest at specified location.',
        // e.g. chesttake 100;200;300;world emerald:5,sword
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/CompassEvent.java
        value: 'compass',
        display: 'Compass',
        description: 'Adds or removes a compass destination for the player.',
        // e.g. compass add beton
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                        options: [
                            {
                                label: 'Add +', // TODO: i18n
                                value: 'add'
                            },
                            {
                                label: 'Delete -', // TODO: i18n
                                value: 'del'
                            },
                            {
                                label: 'Set =', // TODO: i18n
                                value: 'set'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Input, name: 'Compass', type: 'string', defaultValue: 'a_compass_1', placeholder: 'e.g. some_compass', tooltip: 'A name defined in the "compass" section', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/CommandEventFactory.java
        value: 'command',
        display: 'Command',
        description: 'Runs specified command from the console.',
        // e.g. command kill %player%|ban %player%
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Commands', type: 'string[|]', defaultValue: [''], placeholder: 'e.g. kill %player%', tooltip: 'No leading "/"' },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/conversation/ConversationEventFactory.java
        value: 'conversation',
        display: 'Conversation',
        description: 'Starts a conversation at location of the player.',
        // e.g. conversation tutorial option:explain_world
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Conversation ID', type: 'string', defaultValue: 'a_conversation_id_1', placeholder: 'e.g. village_smith', tooltip: 'ID of the conversation', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Input, name: 'Option ID', key: 'option', type: 'string', placeholder: '(none)', tooltip: 'Jump into a NPC option, without its starting header', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/damage/DamageEventFactory.java
        value: 'damage',
        display: 'Damage Player',
        description: 'Damages the player by specified amount of damage.',
        // e.g. damage 20
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'Damage points', allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/DeletePointEventFactory.java
        value: 'deletepoint',
        display: 'Delete Point',
        description: 'Clear all player points in a specified category.',
        // e.g. deletepoint npc_attitude
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Point ID', type: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. npc_attitude', tooltip: 'ID of the point', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/DeleteGlobalPointEventFactory.java
        value: 'deleteglobalpoint',
        display: 'Delete Global Point',
        description: 'Removes the specified category from the global points list.',
        // e.g. deleteglobalpoint bonus
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Point ID', type: 'string', defaultValue: 'a_global_point_id_1', placeholder: 'e.g. bonus', tooltip: 'ID of the global point', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/door/DoorEventFactory.java
        value: 'door',
        display: 'Door',
        description: 'Opens and closes doors, trapdoors and fence gates.',
        // e.g. door 100;200;300;world off
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'toggle', placeholder: 'e.g. toggle', config: {
                        options: [
                            {
                                label: 'Toggle', // TODO: i18n
                                value: 'toggle'
                            },
                            {
                                label: 'On (open)', // TODO: i18n
                                value: 'on'
                            },
                            {
                                label: 'Off (close)', // TODO: i18n
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
        display: 'Drop Item',
        description: 'Drops (place) the defined items at a defined location.',
        // e.g. drop items:myItem location:%objective.MyQuestVariables.DropLocation%
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: 'Item List', key: 'items', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: BaseLocation, name: 'Location', key: 'location', type: 'string', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0], optional: true }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/effect/DeleteEffectEventFactory.java
        value: 'deleffect',
        display: 'Remove Potion Effect',
        description: 'Removes the specified potion effects from the player.',
        // e.g. deleffect ABSORPTION,BLINDNESS
        argumentsPattern: {
            mandatory: [
                { jsx: PotionEffectTypeList, name: 'Effects', type: 'string[,]', placeholder: 'any', defaultValue: [], tooltip: 'Leave it blank for "any" Effects', config: { allowEmpty: true } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/effect/EffectEventFactory.java
        value: 'effect',
        display: 'Apply Potion Effect',
        description: 'Adds a specified potion effect to player.',
        // e.g. effect BLINDNESS 30 1 ambient icon
        argumentsPattern: {
            mandatory: [
                { jsx: PotionEffectType, name: 'Effect', type: 'string', defaultValue: 'SPEED', tooltip: 'A Potion Effect Type' },
                { jsx: Number, name: 'Duration', type: 'float', defaultValue: 0.0, tooltip: 'How long the effect will last in seconds', config: { min: 0 }, allowVariable: true },
                { jsx: Number, name: 'Level', type: 'int', defaultValue: 0, tooltip: 'Level of the effect', config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ambient', key: 'ambient', type: 'boolean', tooltip: 'Make potion particles appear more invisible (just like beacon effects)' },
                { jsx: Checkbox, name: 'Hide Particles', key: 'hidden', type: 'boolean', tooltip: 'Hide particles completely' },
                { jsx: Checkbox, name: 'Hide Icon', key: 'noicon', type: 'boolean', tooltip: 'Hide the icon from user UI' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/experience/ExperienceEventFactory.java
        value: 'experience',
        display: 'Give Experience',
        description: 'Manipulates player\'s experience.',
        // e.g. experience -2 action:addLevel
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'amount to change depends on the Modification types', allowVariable: true },
                {
                    jsx: Select, name: 'Action', key: 'action', type: 'string', defaultValue: 'action:addExperience', tooltip: 'action:addExperience only adds experience points, action:addLevel adds a level and keeps the current percentage. action:setExperienceBar sets the progress of the bar with decimal values between 0 and 1. action:setLevel sets only the level.', placeholder: 'e.g. action:addExperience', config: {
                        options: [
                            {
                                label: 'Add Experience', // TODO: i18n
                                value: 'addExperience'
                            },
                            {
                                label: 'Set Experience Bar', // TODO: i18n
                                value: 'setExperienceBar'
                            },
                            {
                                label: 'Add Level', // TODO: i18n
                                value: 'addLevel'
                            },
                            {
                                label: 'Set Level', // TODO: i18n
                                value: 'setLevel'
                            },
                        ] as DefaultOptionType[]
                    }
                },
            ],
            optional: [
                { jsx: Checkbox, name: <div><s>Level</s></div>, key: 'level', type: 'boolean', tooltip: '(DEPRECATED) Add / remove levels instead of experience points' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/explosion/ExplosionEventFactory.java
        value: 'explosion',
        display: 'Explosion',
        description: 'Creates an explosion.',
        // e.g. explosion 0 1 4 100;64;-100;survival
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'With Fire?', type: 'string', defaultValue: '0', placeholder: 'e.g. 0', config: {
                        options: [
                            {
                                label: 'No', // TODO: i18n
                                value: '0'
                            },
                            {
                                label: 'Yes', // TODO: i18n
                                value: '1'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                {
                    jsx: Select, name: 'Destroy Blocks?', type: 'string', defaultValue: '0', placeholder: 'e.g. 0', config: {
                        options: [
                            {
                                label: 'No', // TODO: i18n
                                value: '0'
                            },
                            {
                                label: 'Yes', // TODO: i18n
                                value: '1'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Number, name: 'Power Level', type: 'float', defaultValue: 0, tooltip: 'TNT is level 4', config: { min: 0 }, allowVariable: true },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
            ]
        }
    },
    // TODO: New optional data type: select
    // TODO: ... Or a seprated standalone editor
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/FolderEvent.java
        value: 'folder',
        display: 'Run multiple events',
        description: 'Runs multiple events in sequence.',
        // e.g. folder event1,event2,event3 delay:5 period:1
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Event Names', type: 'string[,]', defaultValue: ['an_event_1'], placeholder: 'e.g. event1', tooltip: 'Names of other events', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: 'Delay', key: 'delay', type: 'float', placeholder: '(none)', tooltip: 'The delay before the folder starts executing it\'s events', config: { min: 0 }, allowVariable: true },
                { jsx: Number, name: 'Period', key: 'period', type: 'float', placeholder: '(none)', tooltip: 'The interval between each event of the folder', config: { min: 0 }, allowVariable: true },
                // {
                //     jsx: Select, name: 'Duration Unit', key: 'minutes', type: 'select', placeholder: 'Seconds', config: {
                //         options: [
                //             {
                //                 label: 'Minutes', // TODO: i18n
                //                 value: 'minutes'
                //             },
                //             {
                //                 label: 'Ticks', // TODO: i18n
                //                 value: 'ticks'
                //             },
                //         ] as DefaultOptionType[],
                //         allowClear: true
                //     }
                // },
                { jsx: Checkbox, name: 'Minutes?', key: 'minutes', type: 'boolean', tooltip: 'Unit of the time duration' },
                { jsx: Checkbox, name: 'Ticks?', key: 'ticks', type: 'boolean', tooltip: 'Unit of the time duration' },
                { jsx: Number, name: 'Random Pick', key: 'random', type: 'int', placeholder: '(none)', tooltip: 'Number of events to be randomly picked', config: { min: 0 }, allowVariable: true },
                { jsx: Checkbox, name: 'Cancel on Logout', key: 'cancelOnLogout', type: 'boolean', tooltip: 'Terminates the remaining events execution when the player disconnected' },
            ],
        },
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/logic/FirstEventFactory.java
        value: 'first',
        display: 'If-ElseIF Through a List of Events',
        description: <>
            <div>Attempts to execute each event if and only if its condition is met, starting from the first onward. It just likes `if - else if - else if ...` in any programming languages. Once an event is successfully executed, the rest of the events are skipped.</div>
            <div>e.g.:</div>
            <ul>
                <li>firstExample: "first event1,event2,event3"</li>
                <li>event1: "point carry boxes 10 action:add condition:firstCondition"</li>
                <li>event2: "point carry boxes 20 action:add condition:secondCondition"</li>
                <li>event3: "point carry boxes 40 action:add condition:thirdCondition"</li>
            </ul>
        </>,
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Event Name(s)', type: 'string[,]', defaultValue: ['an_event_1'], config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/give/GiveEventFactory.java
        value: 'give',
        display: 'Give',
        description: 'Gives the player predefined items.',
        // e.g. emerald:5,emerald_block:9,important_sign notify backpack
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a message to the player about receiving items' },
                { jsx: Checkbox, name: 'Backpack', key: 'backpack', type: 'boolean', tooltip: 'Forces quest items to be placed in the backpack' }
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/journal/GiveJournalEventFactory.java
        value: 'givejournal',
        display: 'Give Journal',
        description: 'Gives the player his journal. Same as /j command.',
        // e.g. givejournal
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/GlobalPointEventFactory.java
        value: 'globalpoint',
        display: 'Global Point',
        description: 'Manipulates points in a global category. Same as the normal point event. These global categories are player independent.',
        // e.g. global_knownusers 1 action:add
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Point ID', type: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. bonus', tooltip: 'ID of the global point', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: multiplication prefix - '*'
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'amount to change depends on the Action types', allowVariable: true },
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'action:add', placeholder: 'e.g. action:add', config: {
                        options: [
                            {
                                label: 'Add +', // TODO: i18n
                                value: 'action:add'
                            },
                            {
                                label: 'Subtract -', // TODO: i18n
                                value: 'action:subtract'
                            },
                            {
                                label: 'Set =', // TODO: i18n
                                value: 'action:set'
                            },
                            {
                                label: 'Multiply x', // TODO: i18n
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
        display: 'Global Tag',
        description: 'Sets tag globally for all players.',
        // e.g. globaltag add global_areNPCsAgressive
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                        options: [
                            {
                                label: 'Add +', // TODO: i18n
                                value: 'add'
                            },
                            {
                                label: 'Delete -', // TODO: i18n
                                value: 'del'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Input, name: 'Tag ID', type: 'string', defaultValue: 'a_global_tag_id_1', placeholder: 'e.g. reward_claimed', tooltip: 'ID of the global tag', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/hunger/HungerEventFactory.java
        value: 'hunger',
        display: 'Hunger',
        description: 'Changes the food level of the player.',
        // e.g. hunger set 20
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Modification', type: 'string', defaultValue: 'set', placeholder: 'e.g. set', config: {
                        options: [
                            {
                                label: 'Set', // TODO: i18n
                                value: 'set'
                            },
                            {
                                label: 'Give +', // TODO: i18n
                                value: 'give'
                            },
                            {
                                label: 'Take -', // TODO: i18n
                                value: 'take'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                // Doesn't it support Variable instead?
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 0, tooltip: 'For "set", the amount can be any value.\nFor "give" or "take", the final value will be limited between 0 and 20.' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/logic/IfElseEventFactory.java
        value: 'if',
        display: 'If-Else',
        description: 'Checks a condition then runs the first or second event.',
        // e.g. if sun rain else sun
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Condition Name', type: 'string', defaultValue: 'a_positve_condition_1', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Positive Event Name', type: 'string', defaultValue: 'a_positive_event_1', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: () => <>Else</>, name: '', type: 'string', defaultValue: 'else' },
                { jsx: Input, name: 'Negative Event Name', type: 'string', defaultValue: 'a_negative_event_1', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/item/ItemDurabilityEventFactory.java
        value: 'itemdurability',
        display: 'Item Durability',
        description: 'Adds or removes durability from an item in the slot.',
        // e.g. itemdurability CHEST SUBTRACT %randomnumber.whole.15~30% ignoreUnbreakable ignoreEvents
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Slot', type: 'string', defaultValue: 'HAND', placeholder: 'e.g. HAND', config: {
                        options: [
                            {
                                label: 'Hand', // TODO: i18n
                                value: 'HAND'
                            },
                            {
                                label: 'Off Handd', // TODO: i18n
                                value: 'OFF_HAND'
                            },
                            {
                                label: 'Head', // TODO: i18n
                                value: 'HEAD'
                            },
                            {
                                label: 'Chest', // TODO: i18n
                                value: 'CHEST'
                            },
                            {
                                label: 'Legs', // TODO: i18n
                                value: 'LEGS'
                            },
                            {
                                label: 'Feet', // TODO: i18n
                                value: 'FEET'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                {
                    jsx: Select, name: 'Operation', type: 'string', defaultValue: 'SET', placeholder: 'e.g. SET', config: {
                        options: [
                            {
                                label: 'Add +', // TODO: i18n
                                value: 'ADD'
                            },
                            {
                                label: 'Subtract -', // TODO: i18n
                                value: 'SUBTRACT'
                            },
                            {
                                label: 'Set =', // TODO: i18n
                                value: 'SET'
                            },
                            {
                                label: 'Multiply x', // TODO: i18n
                                value: 'MULTIPLY'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ignore Unbreakable', key: 'ignoreUnbreakable', type: 'boolean', tooltip: 'Ignores the unbreakable flag and unbreaking enchantment' },
                { jsx: Checkbox, name: 'Ignore Plugin Events', key: 'ignoreEvents', type: 'boolean', tooltip: 'Prevent interference caused by other plugins' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/journal/JournalEventFactory.java
        value: 'journal',
        display: 'Journal',
        description: 'Adds, deletes an entry to/from a player\'s journal, or refreshes it.',
        // e.g. journal delete quest_available
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                        options: [
                            {
                                label: 'Add +', // TODO: i18n
                                value: 'add'
                            },
                            {
                                label: 'Delete -', // TODO: i18n
                                value: 'delete'
                            },
                            {
                                label: 'Update / Refresh ⟳', // TODO: i18n
                                value: 'update'
                            }
                        ] as DefaultOptionType[]
                    }
                },
                // TODO: New optional data type: string
                // TODO: ... Or a seprated standalone editor
                { jsx: Input, name: 'Journal ID', type: 'string', defaultValue: '', placeholder: 'e.g. a_journal_id_1', tooltip: 'Leave it blank if you selected "Update"', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/kill/KillEventFactory.java
        value: 'kill',
        display: 'Kill',
        description: 'Kills the player',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/language/LanguageEventFactory.java
        value: 'language',
        display: 'Switch Language',
        description: 'Changes player\'s language to the specified one.',
        // e.g. language en
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Language ID', type: 'string', defaultValue: 'en', placeholder: 'e.g. en', config: { allowedPatterns: [/^[a-zA-Z_-]*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/lever/LeverEventFactory.java
        value: 'lever',
        display: 'Lever',
        description: 'Switches a lever.',
        // e.g. lever 100;200;300;world toggle
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'toggle', placeholder: 'e.g. toggle', config: {
                        options: [
                            {
                                label: 'Toggle', // TODO: i18n
                                value: 'toggle'
                            },
                            {
                                label: 'On', // TODO: i18n
                                value: 'on'
                            },
                            {
                                label: 'Off', // TODO: i18n
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
        display: 'Lightning',
        description: 'Strikes a lightning at given location.',
        // e.g. lightning 200;65;100;survival noDamage
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'No Damage', key: 'noDamage', type: 'boolean', tooltip: 'Strikes the lightning without any damages' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/notify/NotifyEventFactory.java
        value: 'notify',
        display: 'Notify',
        description: 'Send notifications to the player.',
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: 'Message', type: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
            ],
            optional: [
                { jsx: InputList, name: 'Category', key: 'category', type: 'string[,]', placeholder: 'e.g. info', tooltip: 'Will load all settings from that Notification Category', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'IO', key: 'io', type: 'string', placeholder: 'e.g. bossbar', tooltip: 'Any NotifyIO Overrides the "category" settings', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: Seprated standalone body. https://docs.betonquest.org/2.0-DEV/Documentation/Visual-Effects/Notifications/Notification-IO%27s-%26-Categories/
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/notify/NotifyAllEventFactory.java
        value: 'notifyall',
        display: 'Broadcasts',
        description: 'Send notifications to all online players.',
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: 'Message', type: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
            ],
            optional: [
                { jsx: InputList, name: 'Category', key: 'category', type: 'string[,]', placeholder: 'e.g. info', tooltip: 'Will load all settings from that Notification Category', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'IO', key: 'io', type: 'string', placeholder: 'e.g. bossbar', tooltip: 'Any NotifyIO Overrides the "category" settings', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: Seprated standalone body. https://docs.betonquest.org/2.0-DEV/Documentation/Visual-Effects/Notifications/Notification-IO%27s-%26-Categories/
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/log/LogEventFactory.java
        value: 'log',
        display: 'Log Message to Console',
        description: <><div style={{ marginBottom: 8 }}>Prints a provided message to the server log.</div><div>Note that when used in static context (by schedules) replacing player dependent variables will not work as the event is player independent.</div></>,
        // e.g. log level:DEBUG daily quests have been reset
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: 'Message', type: '*', defaultValue: '', escapeCharacters: [':'] },
            ],
            optional: [
                {
                    jsx: Select, name: 'Log Level', key: 'level', type: 'string', placeholder: 'info', config: {
                        options: [
                            {
                                label: 'Debug', // TODO: i18n
                                value: 'debug'
                            },
                            {
                                label: 'Info', // TODO: i18n
                                value: 'info'
                            },
                            {
                                label: 'Warning', // TODO: i18n
                                value: 'warning'
                            },
                            {
                                label: 'Error', // TODO: i18n
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
        display: 'Objective',
        description: 'Adds, removes or completes the specified objective(s).',
        // e.g. objective complete killTheDragon
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                        options: [
                            {
                                label: 'Add / Start +', // TODO: i18n
                                value: 'add'
                            },
                            {
                                label: 'Remove / Delete -', // TODO: i18n
                                value: 'remove'
                            },
                            {
                                label: 'Complete / Finish !', // TODO: i18n
                                value: 'complete'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: InputList, name: 'Objective Name(s)', type: 'string[,]', defaultValue: ['an_objective_1'], config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/OpSudoEventFactory.java
        value: 'opsudo',
        display: 'OPsudo',
        description: 'Fires a command as the player, with temporary OP permissions.',
        // e.g. opsudo spawn
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Commands', type: 'string[|]', defaultValue: [''] },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/party/PartyEventFactory.java
        value: 'party',
        display: 'Party Event',
        description: 'Runs events on every player in the party.',
        // e.g. party 10 has_tag1,!has_tag2 give_special_reward amount:3
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Distance', type: 'float', defaultValue: 0.0, tooltip: 'The coverage distance from the player whom triggers this event', config: { min: 0 }, allowVariable: true },
                { jsx: InputList, name: 'Condition Names', type: 'string[,]', placeholder: '(none)', defaultValue: ['a_condition_1'], tooltip: 'Party members will be selected with these conditions', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: 'Event Names', type: 'string[,]', placeholder: 'any', defaultValue: ['an_event_1'], tooltip: 'Events to be executed', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: 'Player Count', key: 'amount', type: 'int', placeholder: 'everyone', tooltip: 'The maximum number of players to be selected', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    // TODO: Seprated standalone Editor
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/random/PickRandomEventFactory.java
        value: 'pickrandom',
        display: 'Run / Pick Random Events',
        description: 'Pcks one (or multiple) events then runs it.',
        // e.g. pickrandom %point.factionXP.amount%%event1,0.5%event2,79%event3,1%event4 amount:3
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Conditions', type: 'string[,]', placeholder: 'e.g. 12.3%event1', defaultValue: ['a_condition_1'], tooltip: 'Restrict selection conditions', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: 'Amount', key: 'amount', type: 'int', placeholder: '1', tooltip: 'The maximum number of events to be executed', config: { min: 0 }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/point/PointEventFactory.java
        value: 'point',
        display: 'Point',
        description: 'Manipulates player\'s points.',
        // e.g. point points 1.25 action:multiply notify
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Point ID', type: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. bonus', tooltip: 'ID of the point', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: multiplication prefix - '*'
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'amount to change depends on the Action types', allowVariable: true },
            ],
            optional: [
                {
                    jsx: Select, name: 'Action', key: 'action', type: 'string', placeholder: 'e.g. action:add', config: {
                        options: [
                            {
                                label: 'Add +', // TODO: i18n
                                value: 'add'
                            },
                            {
                                label: 'Subtract -', // TODO: i18n
                                value: 'subtract'
                            },
                            {
                                label: 'Set =', // TODO: i18n
                                value: 'set'
                            },
                            {
                                label: 'Multiply x', // TODO: i18n
                                value: 'multiply'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a message to the player about the change' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/entity/RemoveEntityEventFactory.java
        value: 'removeentity',
        display: 'Remove Entity',
        description: 'Removes or kills all mobs of given type at the location.',
        // editorBody: KillMob,
        // e.g. removeentity ZOMBIE 100;200;300;world 10 name:Monster kill
        // e.g. removeentity ARROW,SNOWBALL,WOLF,ARMOR_STAND 100;200;300;world 50 marked:minigame
        argumentsPattern: {
            mandatory: [
                { jsx: EntityTypeList, name: 'Entity Type', type: 'string[,]', defaultValue: ['ZOMBIE'], placeholder: 'e.g. ZOMBIE' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 0.0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mob which should get killed', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Removes mobs that only with the same mark using the spawn mob event', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: 'Kill?', key: 'kill', type: 'boolean', tooltip: 'Kill mobs instead of remove' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/RunEvent.java
        value: 'run',
        display: 'Run Events',
        description: <><div style={{ marginBottom: 8 }}>Specify multiple instructions in one, long instruction.</div><div>Actual instruction need to be specified, not an event name. Don't use conditions here, it behaves strangely.</div></>,
        // e.g. run ^tag add beton ^give emerald:5 ^entry add beton ^kill
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Event Instruction', type: 'string[^]', defaultValue: [''], placeholder: 'e.g. give item:1', tooltip: 'Actual instruction need to be specified, not an event name.' },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/run/RunForAllEventFactory.java
        value: 'runForAll',
        display: 'Run Events for All Online Players',
        description: <><div style={{ marginBottom: 8 }}>Runs the specified event(s) once for <b>each player</b> on the server.</div></>,
        // e.g. runForAll where:!isOp events:kickPlayer,restartQuest
        argumentsPattern: {
            mandatory: [
                // For some reason this can be optional in BQ: https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/quest/event/run/RunForAllEventFactory.java#L34
                // But it is better to make it mandatory.
                // { jsx: InputList, name: 'Event Names', key: 'events', type: 'string[,]', defaultValue: '', placeholder: 'e.g. kickPlayer', tooltip: 'List of Event Names to be executed', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: InputList, name: 'Event Names', key: 'events', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: 'List of Event Names to be executed', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: 'Conditions of Each Player', key: 'where', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: 'List of Condition Names to be checked on each player (not the trigger player) while executing events', config: { allowedPatterns: [/^\S*$/] } },
                // { jsx: InputList, name: 'Conditions of Trigger', key: 'conditions', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: 'List of Condition Names to be checked on the player whom triggers this event. If conditions are not met by this player, no Events will be executed on all other players.', config: { allowedPatterns: [/^\S*$/] } },
            ],
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/run/RunIndependentEventFactory.java
        value: 'runIndependent',
        display: 'Run Events Player Independently / Run Events as Schedular Does',
        description: <>
            <div style={{ marginBottom: 8 }}>Runs the specified event(s) player independently (as if it was run from a schedule).</div>
            <div style={{ marginBottom: 8 }}>Note that these events behave differently when executed by this:</div>
            <ul>
                <li>`tag delete` - deletes the tag for all players in the database (even if offline)</li>
                <li>`objective remove` - removes the objective for all players in the database (even if offline)</li>
                <li>`journal delete` - deletes the journal entry for all players in the database (even if offline)</li>
                <li>`deletepoint` - clears points of a given category for all players in the database (even if offline)</li>
            </ul>
        </>,
        // e.g. runIndependent events:removeObjective,clearTags,resetJournal
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Event Names', key: 'events', type: 'string[,]', defaultValue: ['an_event_1'], placeholder: 'e.g. kickPlayer', tooltip: 'List of Event Names to be executed', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                // { jsx: InputList, name: 'Event Names', key: 'events', type: 'string[,]', placeholder: 'e.g. kickPlayer', tooltip: 'List of Event Names to be executed', config: { allowedPatterns: [/^\S*$/] } },
            ],
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/scoreboard/ScoreboardEventFactory.java
        value: 'score',
        display: 'Scoreboard',
        description: 'Manipulates player\'s Scoreboard.',
        // e.g. score kill 1.2 action:multiply
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name', type: 'string', defaultValue: '*', placeholder: 'e.g. Quest_Points', tooltip: 'Name of the scoreboard objective', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: multiplication prefix - '*'
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'amount to change depends on the Action types', allowVariable: true },
                {
                    jsx: Select, name: 'Action', key: 'action', type: 'string', defaultValue: 'action:add', placeholder: 'e.g. action:add', config: {
                        options: [
                            {
                                label: 'Add +', // TODO: i18n
                                value: 'add'
                            },
                            {
                                label: 'Subtract -', // TODO: i18n
                                value: 'subtract'
                            },
                            {
                                label: 'Set =', // TODO: i18n
                                value: 'set'
                            },
                            {
                                label: 'Multiply x', // TODO: i18n
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
        display: 'Set Block',
        description: 'Changes the block at the given position.',
        // e.g. setblock SAND 100;200;300;world ignorePhysics
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Block Selector', type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: 'Block Selector' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ignore Physics', key: 'ignorePhysics', type: 'boolean', tooltip: 'Deactivate the physics of the block' },
            ]
        }
    },
    // TODO: Seprated standalone editor
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/stage/StageEventFactory.java
        value: 'stage',
        display: 'Modify Stage',
        description: <><div style={{ marginBottom: 8 }}>Manipulates player's stage.</div><div>Note that `set` will not automatically complete a `stage` objective. Use `increase` or `decrease` instead.</div></>,
        // e.g. stage bakeCookies decrease 2
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Stage Objective', type: 'string', defaultValue: 'a_stage_objective_1', placeholder: 'e.g. bakeCookies', tooltip: 'The name of the stage objective', config: { allowedPatterns: [/^\S*$/] } },
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'increase', placeholder: 'e.g. increase', config: {
                        options: [
                            {
                                label: 'Set', // TODO: i18n
                                value: 'set'
                            },
                            {
                                label: 'Increase', // TODO: i18n
                                value: 'increase'
                            },
                            {
                                label: 'Decrease', // TODO: i18n
                                value: 'decrease'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                // TODO: name or number depending on action above
                { jsx: Input, name: 'Stage Name', type: 'string', defaultValue: 'a_stage_name_1', placeholder: 'e.g. stage_1', tooltip: 'The name of the stage when `set`. Or amount to `increase` or `decrease`', config: { allowedPatterns: [/^\S*$/] } },
            ],
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/SpawnMobEvent.java
        value: 'spawn',
        display: 'Spawn Mob',
        description: 'Spawns specified amount of mobs of given type at the location.',
        // e.g. spawn 100;200;300;world ZOMBIE name:Bolec 1 h:blue_hat c:red_vest drops:emerald:10,bread:2
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                { jsx: EntityType, name: 'Entity Type', type: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                { jsx: Number, name: 'Amount', type: 'int', defaultValue: 0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mobs to be spawned', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Add an invincible mark onto the spawned mobs', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Helmet', key: 'h', type: 'string', placeholder: 'e.g. blue_hat', tooltip: 'Equip the mob with a helmet', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Chestplate', key: 'c', type: 'string', placeholder: 'e.g. red_vest', tooltip: 'Equip the mob with a chestplate', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Leggings', key: 'l', type: 'string', placeholder: 'e.g. yellow_leggings', tooltip: 'Equip the mob with leggings', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Boots', key: 'b', type: 'string', placeholder: 'e.g. purple_boots', tooltip: 'Equip the mob with a boots', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Main Hand', key: 'm', type: 'string', placeholder: 'e.g. wooden_sword', tooltip: 'Equip the mob with an item on the main hand', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Off Hand', key: 'o', type: 'string', placeholder: 'e.g. wooden_shield', tooltip: 'Equip the mob with an item on the off hand', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: 'Drops', key: 'drops', type: 'string[,]', placeholder: 'e.g. diamond', tooltip: 'Items to be dropped when killed', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/command/SudoEventFactory.java
        value: 'sudo',
        display: 'Sudo',
        description: 'Fires a command as the player.',
        // e.g. sudo spawn
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Commands', type: 'string[|]', defaultValue: [''] },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/tag/TagPlayerEventFactory.java
        value: 'tag',
        display: 'Tag',
        description: 'Adds or delete player\'s tags.',
        // e.g. tag add quest_started,new_entry
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                        options: [
                            {
                                label: 'Add / Start +', // TODO: i18n
                                value: 'add'
                            },
                            {
                                label: 'Remove / Delete -', // TODO: i18n
                                value: 'delete'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: InputList, name: 'Tag Name(s)', type: 'string[,]', defaultValue: ['a_tag_1'], config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/TakeEvent.java
        value: 'take',
        display: 'Take Items',
        description: 'Removes items from the player\'s inventory, armor slots or backpack.',
        // e.g. take emerald:120,sword invOrder:Armor,Offhand,Inventory,Backpack
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', 'all'] },
            ],
            optional: [
                // TODO: Picker input
                { jsx: InputList, name: 'Inventory Checking Order', key: 'invOrder', type: 'string[,]', placeholder: 'e.g. Backpack', tooltip: 'Will check these locations with order. Posible values: Backpack, Inventory, Offhand, Armor', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a message to the player about loosing items' },
            ]
        }
    },
    // TODO: New optional data type: +-float
    // TODO: ... Or a seprated standalone editor
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/time/TimeEventFactory.java
        value: 'time',
        display: 'Time',
        description: <>
            <div style={{ marginBottom: 8 }}>Changes the time of the world.</div>
            <ul>
                <li>`2.75` - Set to 2:45 AM</li>
                <li>`+2.75` - Add 2.75 hour from now</li>
                <li>`-2.75` - Subtract 2.75 hour from now</li>
            </ul>
        </>,
        // e.g. time -12 world:rpgworld
        argumentsPattern: {
            mandatory: [
                // {
                //     jsx: Select, name: 'Action', type: 'string', defaultValue: 'add', placeholder: 'e.g. add', config: {
                //         options: [
                //             {
                //                 label: 'Set =', // TODO: i18n
                //                 value: ''
                //             },
                //             {
                //                 label: 'Add +', // TODO: i18n
                //                 value: '+'
                //             },
                //             {
                //                 label: 'Subtract -', // TODO: i18n
                //                 value: '-'
                //             }
                //         ] as DefaultOptionType[]
                //     }
                // },
                // { jsx: Number, name: 'Hours', type: 'float', defaultValue: 0.0, config: { min: 0 } },
                { jsx: Input, name: 'Hours', type: 'string', defaultValue: '+0', placeholder: 'e.g. +1.25', tooltip: 'How many hours to be change. 1.25 hours = 1 hour + 15 min', config: { allowedPatterns: [/^[\+\-]?\d*\.?\d*$/] } },
            ],
            optional: [
                { jsx: Input, name: 'World', key: 'world', type: 'string', placeholder: '(current)', tooltip: 'The world name to be changed e.g. world', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/teleport/TeleportEventFactory.java
        value: 'teleport',
        display: 'Teleport',
        description: 'Teleports the player to the specified location.',
        // e.g. teleport 123;32;-789;world_the_nether;180;45
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/events/VariableEvent.java
        value: 'variable',
        display: 'Variable',
        description: 'Changes values that are stored in `variable` objective variables.',
        // e.g. variable CustomVariable MyFirstVariable Goodbye!
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Variable Objective ID', type: 'string', defaultValue: 'a_variable_objective_1', placeholder: '', tooltip: '', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Variable Name', type: 'string', defaultValue: 'a_variable_name_1', placeholder: '', tooltip: '', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                { jsx: Input, name: 'Value', type: '*', defaultValue: '""', placeholder: '', tooltip: '', allowVariable: true },
            ],
            keepWhitespaces: true
        }
    },
    // TODO: vector Input
    // TODO: ... Or a seprated standalone editor
    {
        // https://github.com/BetonQuest/BetonQuest/blob/main/src/main/java/org/betonquest/betonquest/quest/event/velocity/VelocityEventFactory.java
        value: 'velocity',
        display: 'Move the player',
        description: 'Applies or changes player\'s velocity.',
        // e.g. velocity vector:(0;0.1;1.3) direction:relative_y
        // e.g. velocity vector:%objective.customVariable.dashLength% direction:relative_y modification:add
        argumentsPattern: {
            mandatory: [
                // For some reason this can be optional in BQ: https://github.com/BetonQuest/BetonQuest/blob/e80ccaba416b1fa458968bc3a35e5a585e06c2e0/src/main/java/org/betonquest/betonquest/quest/event/velocity/VelocityEventFactory.java#L56
                // It is better to make it mandatory.
                { jsx: Input, name: 'Vector', key: 'vector', type: 'string', defaultValue: '(0.0;0.0;0.0)', placeholder: 'e.g. (0;0.1;1.3)', tooltip: 'The values of the vector: (x;y;z) for absolute direction, (sideways;upwards;forwards) for relative direction', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
            ],
            optional: [
                // { jsx: Input, name: 'Vector', key: 'vector', type: 'string', placeholder: 'e.g. (0;0.1;1.3)', tooltip: 'The values of the vector: (x;y;z) for absolute direction, (sideways;upwards;forwards) for relative direction', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                {
                    jsx: Select, name: 'Direction', key: 'direction', type: 'string', placeholder: 'absolute - Absolute', tooltip: 'Coordinate system to be used. Absolute = Coordinate fixed to the world, Relative = Fixed coordinate ralative to the player. Default to `absolute`', config: {
                        options: [
                            {
                                label: '`absolute` - Absolute', // TODO: i18n
                                value: 'absolute'
                            },
                            {
                                label: '`relative_y` - Hrizontal Relative (Relative X & Z, Absolute Y)', // TODO: i18n
                                value: 'relative_y'
                            },
                            {
                                label: '`relative` - Relative to Player', // TODO: i18n
                                value: 'relative'
                            },
                        ] as DefaultOptionType[],
                        allowClear: true
                    }
                },
                {
                    jsx: Select, name: 'Modification', key: 'modification', type: 'string', placeholder: '`set` - Set / Replace', tooltip: '', config: {
                        options: [
                            {
                                label: '`set` - Set / Replace', // TODO: i18n
                                value: 'set'
                            },
                            {
                                label: '`add` - Add +', // TODO: i18n
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
        display: 'Weather',
        description: 'Sets the weather in the world the player is currently in.',
        // e.g. weather rain duration:60 world:rpgworld
        // e.g. weather storm duration:%point.tribute.left:150%
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Type', type: 'string', defaultValue: 'sun', placeholder: 'e.g. sun', config: {
                        options: [
                            {
                                label: 'Sun / Clear', // TODO: i18n
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
                },
            ],
            optional: [
                // TODO: This option does not present in BetonQuest source but in the documentation.
                { jsx: Number, name: 'Duration', key: 'duration', type: 'float', placeholder: 'random', tooltip: 'How long it will last, in seconds', config: { min: 0 }, allowVariable: true },
                { jsx: Input, name: 'World Name', key: 'world', type: 'string', placeholder: 'current', tooltip: 'A name of the world to change weather on', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    }
] as Kind<Event>[]).map(kind => {
    if (kind.argumentsPattern.optional) {
        kind.argumentsPattern.optional.unshift(...defaultOptionalArguments);
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