import React, { useEffect, useState } from "react";
import Package from "../../../../../../betonquest/Package";
import Event from "../../../../../../betonquest/Event";
import { Col, Row } from "antd";
import TextArea from "antd/es/input/TextArea";

interface DefaultProps {
    package: Package,
    event: Event,
    syncYaml: Function,
}

export default function(props: DefaultProps) {

    // UI update trigger #1
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    // UI update trigger #2
    // const [event, setEvent] = useState(props.event);
    // useEffect(()=>{
    //     setEvent(props.event);
    // }, [props.event]);

    return (
        <>
            <Row justify="space-between" style={{padding: "8px 0"}}>
                <Col span={4}>
                    <span>Value:&nbsp;</span>
                </Col>
                <Col span={18}>
                    <TextArea
                        value={props.event.getOptions().join(" ")}
                        onChange={(e) => {
                            if (e.target.value.includes("\n")) {
                                return;
                            }
                            props.event.setOptions(e.target.value.split(" "));
                            props.syncYaml();
                            refreshUI();
                        }}
                        size="small"
                        placeholder={"(none)"}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                    ></TextArea>
                </Col>
            </Row>
        </>
    );
}