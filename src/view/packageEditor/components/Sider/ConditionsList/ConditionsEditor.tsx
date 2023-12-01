import React from "react";

import Condition from "../../../../../betonquest/Condition";
import { ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./ConditionsEditor/Default";

export default function(props: ListElementEditorProps<Condition>) {

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