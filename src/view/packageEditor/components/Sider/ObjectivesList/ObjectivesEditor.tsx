import React from "react";

import Objective from "../../../../../betonquest/Objective";
import { Kind, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";
import Default from "./ObjectivesEditor/Default";

export default function(props: ListElementEditorProps<Objective>) {

    // All kinds
    const kinds: Kind<Objective>[] = [
        {
            value: 'unknown',
            display: 'Unknown',
            editorBody: Default,
            argumentsPattern: {
                mandatory: [
                    { name: 'unspecified', type: '*', defaultValue: '' },
                ],
            }
        },
        {
            value: 'give',
            display: 'Give',
            editorBody: Default,
            argumentsPattern: {
                mandatory: [
                    { name: 'unspecified', type: '*', defaultValue: '' },
                ],
            }
        },
        // ...
    ];

    return (
        <CommonEditor<Objective> {...props} kinds={kinds} defaultEditorBody={Default} />
    );
}