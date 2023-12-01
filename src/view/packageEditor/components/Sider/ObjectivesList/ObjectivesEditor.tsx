import React from "react";

import Objective from "../../../../../betonquest/Objective";
import { ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./ObjectivesEditor/Default";

export default function(props: ListElementEditorProps<Objective>) {

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
            editor: Default,
        },
        // ...
    ];

    return (
        <CommonEditor {...props} kinds={kinds} defaultEditor={Default} />
    );
}