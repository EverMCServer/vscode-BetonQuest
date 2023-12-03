import React from "react";

import Event from "../../../../../betonquest/Event";
import { ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";

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
    ];

    return (
        <CommonEditor<Event> {...props} kinds={kinds} defaultEditor={Default} />
    );
}