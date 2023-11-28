import React, { useEffect, useState } from "react";
import Package from "../../../../../betonquest/Package";
import Event from "../../../../../betonquest/Event";
import { Input, Select } from "antd";

interface Props {
    package: Package,
    event: Event,
    syncYaml: Function,
}

export default function(props: Props) {

    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
      setTrigger(!getTrigger);
    };

    // const [event, setEvent] = useState(props.event);

    // useEffect(()=>{
    //     setEvent(props.event);
    // }, [props.event]);

    return (
        <>
            Default Events Editor... for "{props.event.getName()}"<br />
            <Input
                value={props.event.getKind()}
                onChange={(e) => {
                    props.event.setKind(e.target.value);
                    props.syncYaml();
                    refreshUI();
                }}
                size="small"
            ></Input>
            <Select
                value={props.event.getOptions()}
                onChange={(e) => {
                    props.event.setOptions(e);
                    props.syncYaml();
                    refreshUI();
                }}
                dropdownAlign={{points:['tr', 'br']}}
            getPopupContainer={triggerNode => triggerNode.parentElement.parentElement}
            // className="nodrag"
            size="small"
            mode="tags"
            popupMatchSelectWidth={false}
            style={{width: "100%"}}
            placeholder={"(none)"}
            tokenSeparators={[' ']}
            options={[]}
            open={false}
            suffixIcon={null}
            ></Select>
        </>
    );
}