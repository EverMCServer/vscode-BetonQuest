import React, { useEffect, useState } from "react";
import Package from "../../../../../../betonquest/Package";
import Event from "../../../../../../betonquest/Event";

interface Props {
    package: Package,
    event: Event,
    syncYaml: Function,
}

export default function give(props: Props) {

    // const [event, setEvent] = useState(props.event);

    // useEffect(()=>{
    //     setEvent(props.event);
    // }, [props.event]);

    return (
        <>
            {/* Events "give" Editor... for Event "{event.getName()}"<br /> */}
            Events "give" Editor... for Event "{props.event.getName()}"<br />
        </>
    );
}