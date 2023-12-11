import React, { useEffect, useState } from "react";
import Package from "../../../../../../betonquest/Package";
import Event from "../../../../../../betonquest/Event";

interface Props {
    package: Package,
    syncYaml: Function,
    listElement: Event,
}

export default function(props: Props) {

    // const [event, setEvent] = useState(props.event);

    // useEffect(()=>{
    //     setEvent(props.event);
    // }, [props.event]);

    // e.g. emerald:5,emerald_block:9,important_sign notify backpack
    console.log(props.listElement.getArguments({
        mandatory: ['string[,]'],
        optional: new Map([
            ['notify', 'boolean'],
            ['backpack', 'boolean']
        ]),
    }));

    return (
        <>
            {/* Events "give" Editor... for Event "{event.getName()}"<br /> */}
            Events "give" Editor... for Event "{props.listElement.getName()}"<br />
            {}
        </>
    );
}