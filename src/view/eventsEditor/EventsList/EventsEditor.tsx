import React from "react";
import { DefaultOptionType } from "antd/es/select";

import Event from "../../../betonquest/Event";
import { Kind, ListElementEditorProps } from "../../legacyListEditor/components/CommonList/CommonEditor";
import CommonEditor from "../../legacyListEditor/components/CommonList/CommonEditor";

import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";
import KillMob from "./EventsEditor/KillMob";

import BaseLocation from "../../legacyListEditor/components/CommonList/Input/BaseLocation";
import BlockSelector from "../../legacyListEditor/components/CommonList/Input/BlockSelector";
import Checkbox from "../../legacyListEditor/components/CommonList/Input/Checkbox";
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

// All kinds
const kinds: Kind<Event>[] = [
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/CancelEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ChatEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ChestClearEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ChestGiveEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ChestTakeEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ClearEvent.java
        value: 'clear',
        display: 'Clear Entities',
        description: 'Removes (instead of kills) all specified mobs from the specified area.',
        // e.g. clear ZOMBIE,CREEPER 100;200;300;world 10 name:Monster
        argumentsPattern: {
            mandatory: [
                { jsx: EntityTypeList, name: 'Entity Type', type: 'string[,]', defaultValue: ['ZOMBIE'], placeholder: 'e.g. ZOMBIE' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 0.0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mob which should be removed', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Remove only mobs that with the same mark using the spawn mob event', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Checkbox, name: 'Kill?', key: 'kill', type: 'boolean', tooltip: 'Kill mobs instead of remove' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/CompassEvent.java
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
                                label: 'Give +', // TODO: i18n
                                value: 'give'
                            },
                            {
                                label: 'Take -', // TODO: i18n
                                value: 'take'
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/CommandEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ConversationEvent.java
        value: 'conversation',
        display: 'Conversation',
        description: 'Starts a conversation at location of the player.',
        // e.g. conversation village_smith
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Conversation ID', type: 'string', defaultValue: 'a_conversation_id_1', placeholder: 'e.g. village_smith', tooltip: 'ID of the conversation', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/DamageEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/DeletePointEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/DoorEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/DelEffectEvent.java
        value: 'deleffect',
        display: 'Remove Potion Effect',
        description: 'Removes the specified potion effects from the player.',
        // e.g. deleffect ABSORPTION,BLINDNESS
        argumentsPattern: {
            mandatory: [
                { jsx: PotionEffectTypeList, name: 'Effects', type: 'string[,]', placeholder: 'any', defaultValue: ['any'], tooltip: 'Leave it blank for "any" Effects' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/EffectEvent.java
        value: 'effect',
        display: 'Apply Potion Effect',
        description: 'Adds a specified potion effect to player.',
        // e.g. effect BLINDNESS 30 1 ambient icon
        argumentsPattern: {
            mandatory: [
                { jsx: PotionEffectTypeList, name: 'Effects', type: 'string[,]', defaultValue: ['SPEED'], tooltip: 'List of Potion Effect Types' },
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ExplosionEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/FolderEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GiveEvent.java
        value: 'give',
        display: 'Give',
        description: 'Gives the player predefined items.',
        // e.g. emerald:5,emerald_block:9,important_sign notify
        argumentsPattern: {
            mandatory: [
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a message to the player about receiving items' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GiveJournalEvent.java
        value: 'givejournal',
        display: 'Give Journal',
        description: 'Gives the player his journal. Same as /j command.',
        // e.g. givejournal
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GlobalPointEvent.java
        value: 'globalpoint',
        display: 'Global Point',
        description: 'Manipulates points in a global category. Same as the normal point event. These global categories are player independent.',
        // e.g. global_knownusers 1
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Point ID', type: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. bonus', tooltip: 'ID of the global point', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: custom standalone editor
                { jsx: Input, name: 'Amount', type: 'string', defaultValue: '0', placeholder: 'e.g. *12', tooltip: 'Amount to change, could be multiply' },
            ],
            optional: [
                { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a message to the player about the change' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GlobalTagEvent.java
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
                                value: 'action:add'
                            },
                            {
                                label: 'Delete -', // TODO: i18n
                                value: 'action:del'
                            },
                        ] as DefaultOptionType[]
                    }
                },
                { jsx: Input, name: 'Tag ID', type: 'string', defaultValue: 'a_global_tag_id_1', placeholder: 'e.g. reward_claimed', tooltip: 'ID of the global tag', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/IfElseEvent.java
        value: 'if',
        display: 'If Else',
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/JournalEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/KillEvent.java
        value: 'kill',
        display: 'Kill',
        description: 'Kills the player',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/KillMobEvent.java
        value: 'killmob',
        display: 'Kill Mob',
        description: 'Kills all mobs of given type at the location.',
        // editorBody: KillMob,
        // e.g. killmob ZOMBIE 100;200;300;world 40 name:Bolec marked:quest_mob
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Entity Type', type: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 0.0, config: { min: 0 }, allowVariable: true },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. "Super Zombie"', tooltip: 'The name of the mob which should get killed', escapeCharacters: [' '], config: { allowedPatterns: [/^[\S ]*$/] } },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Kill only mobs that with the same mark using the spawn mob event', config: { allowedPatterns: [/^\S*$/] } }
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/LanguageEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/LeverEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/LightningEvent.java
        value: 'lightning',
        display: 'Lightning',
        description: 'Strikes a lightning at given location.',
        // e.g. lightning 200;65;100;survival
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] }, allowVariable: true },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/NotifyEvent.java
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
                // TODO: Seprated standalone body. https://betonquest.org/1.12/User-Documentation/Events-List/#notification-notify
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/NotifyAllEvent.java
        value: 'notifyall',
        display: 'Broadcast',
        description: 'Send notifications to all online players.',
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: 'Message', type: '*', defaultValue: '', escapeCharacters: [':', '\n'] },
            ],
            optional: [
                { jsx: InputList, name: 'Category', key: 'category', type: 'string[,]', placeholder: 'e.g. info', tooltip: 'Will load all settings from that Notification Category', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'IO', key: 'io', type: 'string', placeholder: 'e.g. bossbar', tooltip: 'Any NotifyIO Overrides the "category" settings', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: Seprated standalone body. https://betonquest.org/1.12/User-Documentation/Events-List/#broadcast-notifyall
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ObjectiveEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/OpSudoEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/PartyEvent.java
        value: 'party',
        display: 'Party Event',
        description: 'Runs events on every player in the party.',
        // e.g. party 10 has_tag1,!has_tag2 give_special_reward
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Distance', type: 'float', defaultValue: 0.0, tooltip: 'The coverage distance from the player whom triggers this event', config: { min: 0 }, allowVariable: true },
                { jsx: InputList, name: 'Condition Names', type: 'string[,]', placeholder: '(none)', defaultValue: ['a_condition_1'], tooltip: 'Party members will be selected with these conditions', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: InputList, name: 'Event Names', type: 'string[,]', placeholder: 'any', defaultValue: ['an_event_1'], tooltip: 'Events to be executed', config: { allowedPatterns: [/^\S*$/] } },
            ]
        }
    },
    // TODO: variable support
    // TODO: Seprated standalone Editor
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/PickRandomEvent.java
        value: 'pickrandom',
        display: 'Run / Pick Random Events',
        description: 'Pcks one (or multiple) events then runs it.',
        // e.g. pickrandom %point.factionXP.amount%%event1,0.5%event2,79%event3,1%event4 amount:3
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Conditions', type: 'string[,]', placeholder: 'e.g. 12.3%event1', defaultValue: ['a_condition_1'], tooltip: 'Restrict selection conditions', config: { allowedPatterns: [/^\S*$/] } },
            ],
            optional: [
                { jsx: Number, name: 'Amount', key: 'amount', type: 'int', placeholder: '1', tooltip: 'The maximum number of events to be executed', config: { min: 0 } },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/PointEvent.java
        value: 'point',
        display: 'Point',
        description: 'Manipulates player\'s points.',
        // e.g. point points 1.25 notify
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Point ID', type: 'string', defaultValue: 'a_point_id_1', placeholder: 'e.g. bonus', tooltip: 'ID of the global point', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: custom standalone editor
                { jsx: Input, name: 'Amount', type: 'float', defaultValue: '0', placeholder: 'e.g. *12', tooltip: 'Amount to change, could be multiply' },
            ],
            optional: [
                { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a message to the player about the change' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/RunEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ScoreboardEvent.java
        value: 'score',
        display: 'Scoreboard',
        description: 'Manipulates player\'s Scoreboard.',
        // e.g. score kill 1.2
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Name', type: 'string', defaultValue: '*', placeholder: 'e.g. Quest_Points', tooltip: 'Name of the scoreboard objective', config: { allowedPatterns: [/^\S*$/] } },
                // TODO: custom standalone editor
                { jsx: Input, name: 'Amount', type: 'string', defaultValue: '0', placeholder: 'e.g. *12', tooltip: 'Amount to change, could be multiply' },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/SetBlockEvent.java
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
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/SpawnMobEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/SudoEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GlobalTagEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/TakeEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/TimeEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/TeleportEvent.java
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
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/VariableEvent.java
        value: 'variable',
        display: 'Variable',
        description: 'Changes a custom variable\'s value stored in a `variable` objective. Note that the player must have a `variable` objective started first for this event to have any effects.',
        // e.g. variable CustomVariable MyFirstVariable Goodbye!
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Variable Objective ID', type: 'string', defaultValue: 'a_variable_objective_1', tooltip: 'The `variable` Objective\' ID which you want to store the variable onto. You must define this Objective in you Objective list first.', config: { allowedPatterns: [/^\S*$/] } },
                { jsx: Input, name: 'Variable Name', type: 'string', defaultValue: 'a_variable_name_1', tooltip: '', config: { allowedPatterns: [/^\S*$/] }, allowVariable: true },
                { jsx: Input, name: 'Value', type: '*', defaultValue: '""', tooltip: 'Input "" to delete the value', allowVariable: true },
            ],
            keepWhitespaces: true
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/WeatherEvent.java
        value: 'weather',
        display: 'Weather',
        description: 'Sets the weather in the world the player is currently in.',
        // e.g. weather rain
        // e.g. weather storm
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
                },
            ]
        }
    },
    {
        // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/ExperienceEvent.java
        value: 'experience',
        display: 'Give Experience',
        description: 'Manipulates player\'s experience.',
        // e.g. experience -2 action:addLevel
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'amount to change depends on the Modification types', allowVariable: true },
            ],
            optional: [
                { jsx: Checkbox, name: 'Level', key: 'level', type: 'boolean', tooltip: 'Add / remove levels instead of experience points' },
            ]
        }
    },
];

export default function (props: ListElementEditorProps<Event>) {

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}