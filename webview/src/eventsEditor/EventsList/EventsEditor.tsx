import Event from "betonquest-utils/betonquest/Event";
import { Kinds } from "betonquest-utils/betonquest/v1/Events";
import { Kind, ListElementEditorBodyProps, ListElementEditorProps } from "../../legacyListEditor/components/CommonList/CommonEditor";
import CommonEditor from "../../legacyListEditor/components/CommonList/CommonEditor";

import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";
import KillMob from "./EventsEditor/KillMob";

function getAllKinds(): Kind<Event>[] {
    // Specified custom editors for specific kinds, otherwise it will use the default editor
    const customEditors: { value: string, editorBody?: (props: ListElementEditorBodyProps<Event>) => React.JSX.Element }[] = [
        {
            // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/GiveEvent.java
            value: 'give',
            // editorBody: Give,
        },
        {
            // https://github.com/BetonQuest/BetonQuest/blob/v1.12.11/src/main/java/pl/betoncraft/betonquest/events/KillMobEvent.java
            value: 'killmob',
            // editorBody: KillMob,
        },
    ];

    // Load all kinds
    return Kinds.get().map(kind => {
        return {
            ...kind,
            // Load the custom editor, if exists
            editorBody: customEditors.find(e => e.value === kind.value)?.editorBody
        };
    });
};

export default function (props: ListElementEditorProps<Event>) {

    return (
        <CommonEditor<Event> {...props} kinds={getAllKinds()} defaultEditorBody={Default} />
    );
}
