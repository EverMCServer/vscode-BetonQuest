import React from "react";

import Event from "../../../../../betonquest/Event";
import { ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";
import KillMob from "./EventsEditor/KillMob";

export default function(props: ListElementEditorProps<Event>) {

    // All kinds
    const kinds = [
        {
            value: 'unknown',
            display: 'Unknown',
            editor: Default,
        },
        {
            value: 'give',
            display: 'Give',
            editor: Give,
        },
        {
            value: 'killmob',
            display: 'Kill Mob',
            editor: KillMob,
        },
    ];

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditor={Default} />
    );
}