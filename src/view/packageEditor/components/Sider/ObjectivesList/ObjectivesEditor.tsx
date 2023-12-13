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
            editor: Default,
            argumentsConfig: {
                mandatory: [
                    { name: 'unspecified', type: '*', placeholder: '' },
                ],
            }
        },
        {
            value: 'give',
            display: 'Give',
            editor: Default,
            argumentsConfig: {
                mandatory: [
                    { name: 'unspecified', type: '*', placeholder: '' },
                ],
            }
        },
        // ...
    ];

    return (
        <CommonEditor<Objective> {...props} kinds={kinds} defaultEditor={Default} />
    );
}