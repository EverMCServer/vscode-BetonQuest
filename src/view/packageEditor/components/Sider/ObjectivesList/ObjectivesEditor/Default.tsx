import React, { useEffect, useState } from "react";
import { Col, Row } from "antd";
import TextArea from "antd/es/input/TextArea";

import Objective from "../../../../../../betonquest/Objective";
import { ListElementEditorBodyProps } from "../../CommonList/CommonEditor";

export default function (props: ListElementEditorBodyProps<Objective>) {

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

    // Arguments should be parsed everytime. Do NOT cache it.
    const args = props.listElement.getArguments(props.argumentsPattern);

    return (
        <>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={4}>
                    <span>Value:&nbsp;</span>
                </Col>
                <Col span={18}>
                    <TextArea
                        value={args?.toString()}
                        onChange={(e) => {
                            if (e.target.value.includes("\n")) {
                                return;
                            }
                            args?.setMandatoryArgument(0, e.target.value);
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