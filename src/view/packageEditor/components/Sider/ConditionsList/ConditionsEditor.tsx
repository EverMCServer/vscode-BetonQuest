import React from "react";

import Condition from "../../../../../betonquest/Condition";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./ConditionsEditor/Default";

// All kinds
const kinds: Kind<Condition>[] = [
    {
        value: 'unknown',
        display: 'Unknown',
        description: 'Unknown Condition',
        editorBody: Default,
        argumentsPattern: {
            mandatory: [
                { name: 'unspecified', type: '*', defaultValue: '' },
            ],
        }
    },
    // ...
];


export default function (props: ListElementEditorProps<Condition>) {
    return (
        <CommonEditor<Condition> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}