import Condition from "betonquest-utils/betonquest/Condition";
import { kinds } from "betonquest-utils/betonquest/v2/Conditions";
import { Kind, ListElementEditorBodyProps, ListElementEditorProps } from "../CommonList/CommonEditor";
import CommonEditor from "../CommonList/CommonEditor";

import Default from "./ConditionsEditor/Default";

// Specified custom editors for specific kinds, otherwise it will use the default editor
const customEditors: { value: string, editorBody?: (props: ListElementEditorBodyProps<Condition>) => React.JSX.Element }[] = [
    {
        value: '*',
        editorBody: Default,
    }
];

// Load all kinds
const allKinds: Kind<Condition>[] = kinds.map(kind => {
    return {
        ...kind,
        // Load the custom editor, if exists
        editorBody: customEditors.find(e => e.value === kind.value)?.editorBody
    };
});

export default function (props: ListElementEditorProps<Condition>) {
    return (
        <CommonEditor<Condition> {...props} kinds={allKinds} defaultEditorBody={Default} />
    );
}
