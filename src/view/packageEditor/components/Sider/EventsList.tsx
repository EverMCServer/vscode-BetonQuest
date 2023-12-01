import React, { useEffect, useState } from "react";

import EventsEditor from "./EventsList/EventsEditor";
import CommonList, { BaseListProps } from "./CommonList";

export default function eventsList(props: BaseListProps) {

    return (
        <CommonList {...props} editor={EventsEditor} listElements={props.package.getAllEvents()} />
    );
}