import Objective from "betonquest-utils/betonquest/Objective";
import { Kinds } from "betonquest-utils/betonquest/v2/Objectives";
import { Kind, ListElementEditorBodyProps, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";

import Default from "./ObjectivesEditor/Default";

function getAllKinds(): Kind<Objective>[] {
    // Specified custom editors for specific kinds, otherwise it will use the default editor
    const customEditors: { value: string, editorBody?: (props: ListElementEditorBodyProps<Objective>) => React.JSX.Element }[] = [
        {
            value: '*',
            editorBody: Default,
        }
    ];

    // Load all kinds
    return Kinds.get().map(kind => {
        return {
            ...kind,
            // Load the custom editor, if exists
            editorBody: customEditors.find(e => e.value === kind.value)?.editorBody
        };
    });
}

export default function (props: ListElementEditorProps<Objective>) {
    return (
        <CommonEditor<Objective> {...props} kinds={getAllKinds()} defaultEditorBody={Default} />
    );
}
