import React from "react";

import Condition from "../../../../../betonquest/Condition";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./ConditionsEditor/Default";

export default function(props: ListElementEditorProps<Condition>) {

    // All kinds
    const kinds: Kind<Condition>[] = [
        {
            value: 'unknown',
            display: 'Unknown',
            editor: Default,
            argumentsPattern: {
                mandatory: ['*'],
                mandatoryDefault: [
                    ""
                ]
            }
        },
        {
            value: 'give',
            display: 'Give',
            editor: Default,
            argumentsPattern: {
                mandatory: ['*'],
                mandatoryDefault: [
                    ""
                ]
            }
        },
        // ...
    ];

    return (
        <CommonEditor<Condition> {...props} kinds={kinds} defaultEditor={Default} />
    );
}