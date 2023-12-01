import React, { useEffect, useState } from "react";
import Package from "../../../../../../betonquest/Package";
import Condition from "../../../../../../betonquest/Condition";
import { Col, Row } from "antd";
import TextArea from "antd/es/input/TextArea";

interface DefaultProps {
    package: Package,
    syncYaml: Function,
    listElement: Condition,
}

export default function(props: DefaultProps) {

    // UI update trigger #1
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    // UI update trigger #2
    // const [listElement, setListElement] = useState(props.listElement);
    // useEffect(()=>{
    //     setListElement(props.listElement);
    // }, [props.listElement]);

    return (
        <>
            <Row justify="space-between" style={{padding: "8px 0"}}>
                <Col span={4}>
                    <span>Value:&nbsp;</span>
                </Col>
                <Col span={18}>
                    <TextArea
                        value={props.listElement.getOptions().join(" ")}
                        onChange={(e) => {
                            if (e.target.value.includes("\n")) {
                                return;
                            }
                            props.listElement.setOptions(e.target.value.split(" "));
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