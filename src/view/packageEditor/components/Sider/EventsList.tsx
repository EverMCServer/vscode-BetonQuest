import React, { useEffect, useState } from "react";

import Package from "../../../../betonquest/Package";
import EventsEditor from "./EventsList/EventsEditor";
import CommonList from "./CommonList";

interface EventsListProps {
    package: Package,
    syncYaml: Function,
}

export default function eventsList(props: EventsListProps) {

    return (
        <CommonList {...props} editor={EventsEditor} listElements={props.package.getAllEvents()} />
    );
}