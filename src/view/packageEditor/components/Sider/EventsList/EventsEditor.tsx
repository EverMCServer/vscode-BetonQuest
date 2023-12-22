import React from "react";

import Event from "../../../../../betonquest/Event";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";

import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";
import KillMob from "./EventsEditor/KillMob";

import Input from "../CommonList/Input/Input";
import InputList from "../CommonList/Input/InputList";
import TextArea from "../CommonList/Input/TextArea";
import TextAreaList from "../CommonList/Input/TextAreaList";
import Checkbox from "../CommonList/Input/Checkbox";
import Number from "../CommonList/Input/Number";
import EntityType from "../CommonList/Input/EntityType";
import BlockSelector from "../CommonList/Input/BlockSelector";
import BaseLocation from "../CommonList/Input/BaseLocation";
import Select from "../CommonList/Input/Select";
import { DefaultOptionType } from "antd/es/select";
import ItemList from "../CommonList/Input/ItemList";

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
        value: 'cancel',
        display: 'Cancel (cancel)',
        description: 'Cancel a quest predefined in a Quest Canceler.',
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Canceler', type: 'string', defaultValue: [''] },
            ]
        }
    },
    // TODO: match mandatory with key
    // TODO: variable support
    // {
    //     value: 'burn',
    //     display: 'Burn',
    //     description: 'Set fire on player.',
    //     // e.g. burn duration:4
    //     // e.g. burn duration:%point.punishment.amount%
    //     argumentsPattern: {
    //         mandatory: [
    //             { jsx: TextAreaList, name: 'Duration', key: 'duration', type: 'string', defaultValue: 0, tooltip: 'The duration the player will burn (in seconds).' },
    //         ]
    //     }
    // },
    {
        value: 'cancelconversation',
        display: 'Cancel Conversation',
        description: 'Cancels the active conversation of the player.',
        argumentsPattern: {
            mandatory: [],
        }
    },
    {
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
        value: 'chestclear',
        display: 'Chest Clear',
        description: 'Removes all items from a chest at specified location.',
        // e.g. chestclear 100;200;300;world
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
            ]
        }
    },
    {
        value: 'chestgive',
        display: 'Chest Give',
        description: 'Puts items in a chest at specified location.',
        // e.g. chestgive 100;200;300;world emerald:5,sword
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        value: 'chesttake',
        display: 'Chest Take',
        description: 'Removes items from a chest at specified location.',
        // e.g. chesttake 100;200;300;world emerald:5,sword
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ]
        }
    },
    {
        value: 'clear',
        display: 'Clear Entities',
        description: 'Removes (instead of kills) all specified mobs from the specified area.',
        // e.g. clear ZOMBIE,CREEPER 100;200;300;world 10 name:Monster
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Entity Type', type: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] } },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 0.0, config: { min: 0 } },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. Super_Zombie', tooltip: 'The name of the mob which should be removed' },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Remove only mobs that with the same mark using the spawn mob event' }
            ]
        }
    },
    {
        value: 'compass',
        display: 'Compass',
        description: 'Adds or removes a compass destination for the player.',
        // e.g. compass add beton
        argumentsPattern: {
            mandatory: [
                {
                    jsx: Select, name: 'Action', type: 'string', defaultValue: 'set', placeholder: 'e.g. set', config: {
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
                { jsx: Input, name: 'Compass', type: 'string', defaultValue: '', placeholder: 'e.g. some_compass', tooltip: 'A name defined in the "compass" section' },
            ]
        }
    },
    {
        value: 'command',
        display: 'Command',
        description: 'Runs specified command from the console.',
        // e.g. command kill %player%|ban %player%
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Commands', type: 'string[|]', defaultValue: '' },
            ]
        }
    },
    {
        value: 'conversation',
        display: 'Conversation',
        description: 'Starts a conversation at location of the player.',
        // e.g. conversation village_smith
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Conversation ID', type: 'string', defaultValue: '', placeholder: 'e.g. village_smith', tooltip: 'ID of the conversation' },
            ]
        }
    },
    {
        value: 'damage',
        display: 'Damage Player',
        description: 'Damages the player by specified amount of damage.',
        // e.g. damage 20
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'Damage points' },
            ]
        }
    },
    {
        value: 'deletepoint',
        display: 'Delete Point',
        description: 'Clear all player points in a specified category.',
        // e.g. deletepoint npc_attitude
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Point ID', type: 'string', defaultValue: '', placeholder: 'e.g. npc_attitude', tooltip: 'ID of the point' },
            ]
        }
    },
    {
        value: 'deleteglobalpoint',
        display: 'Delete Global Point',
        description: 'Removes the specified category from the global points list.',
        // e.g. deleteglobalpoint bonus
        argumentsPattern: {
            mandatory: [
                { jsx: Input, name: 'Point ID', type: 'string', defaultValue: '', placeholder: 'e.g. bonus', tooltip: 'ID of the global point' },
            ]
        }
    },
    {
        value: 'door',
        display: 'Door',
        description: 'Opens and closes doors, trapdoors and fence gates.',
        // e.g. door 100;200;300;world off
        argumentsPattern: {
            mandatory: [
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] } },
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
    // TODO: match mandatory with key
    // TODO: variable support
    // {
    //     value: 'drop',
    //     display: 'Drop Item',
    //     description: 'Drops (place) the defined items at a defined location.',
    //     // e.g. 
    //     argumentsPattern: {
    //         mandatory: [
    //             { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
    //         ],
    //         optional: [
    //             { jsx: BaseLocation, name: 'Location', key: 'location', type: 'string', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] } },
    //         ]
    //     }
    // },
    // TODO: Spigot Effects list
    {
        value: 'deleffect',
        display: 'Remove Potion Effect',
        description: 'Removes the specified potion effects from the player.',
        // e.g. deleffect ABSORPTION,BLINDNESS
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Effects', type: 'string[,]', placeholder: 'any', defaultValue: [''], tooltip: 'Leave it blank for "any" Effects' },
            ]
        }
    },
    // TODO: Spigot Effects list
    {
        value: 'effect',
        display: 'Apply Potion Effect',
        description: 'Adds a specified potion effect to player.',
        // e.g. effect BLINDNESS 30 1 ambient icon
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Effects', type: 'string[,]', placeholder: 'any', defaultValue: [''], tooltip: 'Leave it blank for "any" Effects' },
                { jsx: Number, name: 'Duration', type: 'float', defaultValue: 0.0, tooltip: 'How long the effect will last in seconds', config: { min: 0 } },
                { jsx: Number, name: 'Level', type: 'int', defaultValue: 0, tooltip: 'Level of the effect', config: { min: 0 } },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ambient', key: 'ambient', type: 'boolean', tooltip: 'Make potion particles appear more invisible (just like beacon effects)' },
                { jsx: Checkbox, name: 'Hide Particles', key: 'hidden', type: 'boolean', tooltip: 'Hide particles completely' },
                { jsx: Checkbox, name: 'Hide Icon', key: 'noicon', type: 'boolean', tooltip: 'Hide the icon from user UI' },
            ]
        }
    },
    // TODO: Seprated standalone Editor
    // https://docs.betonquest.org/2.0-DEV/Documentation/Scripting/Building-Blocks/Events-List/#give-experience-experience
    {
        value: 'experience',
        display: 'Give Experience',
        description: 'Manipulates player\'s experience.',
        // e.g. experience -2 action:addLevel
        argumentsPattern: {
            mandatory: [
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'amount to change depends on Modification types' },
                {
                    jsx: Select, name: 'Modification', type: 'string', defaultValue: 'action:addExperience', tooltip: 'action:addExperience only adds experience points, action:addLevel adds a level and keeps the current percentage. action:setExperienceBar sets the progress of the bar with decimal values between 0 and 1. action:setLevel sets only the level.', placeholder: 'e.g. action:addExperience', config: {
                        options: [
                            {
                                label: 'Add Experience', // TODO: i18n
                                value: 'action:addExperience'
                            },
                            {
                                label: 'Set Experience Bar', // TODO: i18n
                                value: 'action:setExperienceBar'
                            },
                            {
                                label: 'Add Level', // TODO: i18n
                                value: 'action:addLevel'
                            },
                            {
                                label: 'Set Level', // TODO: i18n
                                value: 'action:setLevel'
                            },
                        ] as DefaultOptionType[]
                    }
                },
            ]
        }
    },
    {
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
                { jsx: Number, name: 'Power Level', type: 'float', defaultValue: 0, tooltip: 'TNT is level 4' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
            ]
        }
    },
    // TODO: New optional data type: select
    // TODO: ... Or a seprated standalone editor
    {
        value: 'folder',
        display: 'Run multiple events',
        description: 'Runs multiple events in sequence.',
        // e.g. folder event1,event2,event3 delay:5 period:1
        argumentsPattern: {
            mandatory: [
                { jsx: InputList, name: 'Event Names', type: 'string[,]', defaultValue: [''], placeholder: 'e.g. event1', tooltip: 'Names of other events' },
            ],
            optional: [
                { jsx: Number, name: 'Delay', key: 'delay', type: 'float', placeholder: '(none)', tooltip: 'The delay before the folder starts executing it\'s events' },
                { jsx: Number, name: 'Period', key: 'period', type: 'float', placeholder: '(none)', tooltip: 'The interval between each event of the folder' },
                // {
                //     jsx: Select, name: 'Duration Unit', key: 'minutes', type: 'select', placeholder: 'e.g. 0', config: {
                //         options: [
                //             {
                //                 label: 'Minutes', // TODO: i18n
                //                 value: 'minutes'
                //             },
                //             {
                //                 label: 'Ticks', // TODO: i18n
                //                 value: 'ticks'
                //             },
                //         ] as DefaultOptionType[]
                //     }
                // },
                { jsx: Checkbox, name: 'Minutes?', key: 'minutes', type: 'boolean', tooltip: 'Unit of the time duration' },
                { jsx: Checkbox, name: 'Ticks?', key: 'ticks', type: 'boolean', tooltip: 'Unit of the time duration' },
                { jsx: Number, name: 'Random Pick', key: 'random', type: 'int', placeholder: '(none)', tooltip: 'Number of events to be randomly picked' },
                { jsx: Checkbox, name: 'Cancel on Logout', key: 'cancelOnLogout', type: 'boolean', tooltip: 'Terminates the remaining events execution when the player disconnected' },
            ],
            keepWhitespaces: true,
        },
    },
    // TODO
    // {
    //     value: 'kind',
    //     display: 'Name',
    //     description: 'desc.',
    //     // e.g. 
    //     argumentsPattern: {
    //         mandatory: [
    //             { jsx: TextAreaList, name: 'Name', type: 'string', defaultValue: '' },
    //         ]
    //     }
    // },
    {
        value: 'give',
        display: 'Give',
        description: 'Gives the player predefined items.',
        // e.g. emerald:5,emerald_block:9,important_sign notify backpack
        argumentsPattern: {
            mandatory: [
                // { jsx: ItemList, name: 'Item List', type: 'ItemList', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
                { jsx: ItemList, name: 'Item List', type: '[string:number?][,]', defaultValue: [["", 0]], placeholder: ['e.g. emerald', '1'] },
            ],
            optional: [
                { jsx: Checkbox, name: 'Notify', key: 'notify', type: 'boolean', tooltip: 'Display a simple message to the player about receiving items' },
                { jsx: Checkbox, name: 'Backpack', key: 'backpack', type: 'boolean', tooltip: 'Forces quest items to be placed in the backpack' }
            ]
        }
    },
    {
        value: 'hunger',
        display: 'Hunger',
        description: 'Changes the food level of the player.',
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
                { jsx: Number, name: 'Amount', type: 'float', defaultValue: 0, tooltip: 'For "set", the amount can be any value.\nFor "give" or "take", the final value will be limited between 0 and 20.' },
            ]
        }
    },
    {
        value: 'kill',
        display: 'Kill',
        description: 'Kills the player',
        argumentsPattern: {
            mandatory: []
        }
    },
    {
        value: 'killmob',
        display: 'Kill Mob',
        description: 'Kills all mobs of given type at the location.',
        // editorBody: KillMob,
        // e.g. killmob ZOMBIE 100;200;300;world 40 name:Bolec marked:quest_mob
        argumentsPattern: {
            mandatory: [
                { jsx: EntityType, name: 'Entity Type', type: 'string', defaultValue: 'ZOMBIE', placeholder: 'e.g. ZOMBIE' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world', config: { defaultValue: [0.5, 64, 0.5, "world", 0, 0] } },
                { jsx: Number, name: 'Radius', type: 'float', defaultValue: 0.0, config: { min: 0 } },
            ],
            optional: [
                { jsx: Input, name: 'Name', key: 'name', type: 'string', placeholder: 'e.g. Super_Zombie', tooltip: 'The name of the mob which should get killed' },
                { jsx: Input, name: 'Marked', key: 'marked', type: 'string', placeholder: 'e.g. quest_mob', tooltip: 'Kill only mobs that with the same mark using the spawn mob event' }
            ]
        }
    },
    {
        value: 'notify',
        display: 'Notify',
        description: 'Send notifications to the player.',
        argumentsPattern: {
            mandatory: [
                { jsx: TextArea, name: 'Message', type: 'string', defaultValue: '', escapeCharacters: [':', '\n'] },
            ],
            optional: [
                { jsx: InputList, name: 'Category', key: 'category', type: 'string[,]', placeholder: 'e.g. info', tooltip: 'Will load all settings from that Notification Category' },
                { jsx: Input, name: 'IO', key: 'io', type: 'string', placeholder: 'e.g. bossbar', tooltip: 'Any NotifyIO Overrides the "category" settings' },
                // TODO: Seprated standalone body. https://docs.betonquest.org/2.0-DEV/Documentation/Visual-Effects/Notifications/Notification-IO%27s-%26-Categories/
            ],
            keepWhitespaces: true
        }
    },
    {
        value: 'run',
        display: 'Run Events',
        description: <><div style={{ marginBottom: 8 }}>Specify multiple instructions in one, long instruction.</div><div>Actual instruction need to be specified, not an event name. Don't use conditions here, it behaves strangely.</div></>,
        argumentsPattern: {
            mandatory: [
                { jsx: TextAreaList, name: 'Event Instruction', type: 'string[^]', defaultValue: '', placeholder: 'e.g. give item:1', tooltip: 'Actual instruction need to be specified, not an event name.' },
            ],
            keepWhitespaces: true
        }
    },
    {
        value: 'setblock',
        display: 'Set Block',
        description: 'Changes the block at the given position.',
        argumentsPattern: {
            mandatory: [
                { jsx: BlockSelector, name: 'Block Selector', type: 'string', defaultValue: 'AIR', placeholder: 'e.g. AIR', tooltip: 'Block Selector' },
                { jsx: BaseLocation, name: 'Location', type: 'string', defaultValue: '0.5;64;0.5;world' },
            ],
            optional: [
                { jsx: Checkbox, name: 'Ignore Physics', key: 'ignorePhysics', type: 'boolean', tooltip: 'Deactivate the physics of the block' },
            ]
        }
    }
];

export default function (props: ListElementEditorProps<Event>) {

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}