import React from "react";

import Objective from "../../../../../betonquest/Objective";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./ObjectivesEditor/Default";

// All kinds
const kinds: Kind<Objective>[] = [
    {
        value: 'unknown',
        display: 'Unknown',
        description: 'Unknown Objective',
        editorBody: Default,
        argumentsPattern: {
            mandatory: [
                { name: 'unspecified', type: '*', defaultValue: '' },
            ],
        }
    },
    // ...
];


export default function (props: ListElementEditorProps<Objective>) {
    return (
        <CommonEditor<Objective> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}