import React, { useEffect, useState } from "react";
import Package from "../../../../betonquest/Package";
import Give from "./EventsEditor/Give";

interface EventsEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function eventsEditor(props: EventsEditorProps) {

    // Convert all Events into coresponding Event's Editor
    const getEventEditors = (pkg: Package) => {
        return pkg.getAllEvents().flatMap(e=>{
            switch (e.getKind().toLowerCase()) {
                case 'give':
                    return [<Give key={e.getName()} package={props.package} syncYaml={props.syncYaml} event={e}></Give>];
                default:
                break;
            }
            return [];
        });
    };

    const [eventEditorList, setEventEditorList] = useState(getEventEditors(props.package));

    useEffect(()=>{
        setEventEditorList(getEventEditors(props.package));
    }, [props.package]);

    return (
        <>
            {eventEditorList}<br />
            Events Editor...<br />
        </>
    );
}