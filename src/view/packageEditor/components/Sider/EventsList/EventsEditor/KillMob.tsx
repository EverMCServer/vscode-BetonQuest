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

    // e.g. killmob ZOMBIE 100;200;300;world 40 name:Bolec marked:quest_mob
    console.log(props.listElement.parseArguments({
        mandatory: ['string', 'string', 'int'],
        optional: new Map([
            ['name', 'string'],
            ['marked', 'string']
        ]),
    }));

    return (
        <>
            {/* Events "killmob" Editor... for Event "{event.getName()}"<br /> */}
            Events "killmob" Editor... for Event "{props.listElement.getName()}"<br />
            {}
        </>
    );
}