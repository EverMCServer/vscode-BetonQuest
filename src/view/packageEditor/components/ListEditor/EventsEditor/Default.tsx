import React, { useEffect, useState } from "react";
import Package from "../../../../../betonquest/Package";
import Event from "../../../../../betonquest/Event";
import { Input, Row, Col } from "antd";
import TextArea from "antd/es/input/TextArea";

interface Props {
    package: Package,
    event: Event,
    syncYaml: Function,
}

export default function (props: Props) {

    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    // const [event, setEvent] = useState(props.event);

    // useEffect(()=>{
    //     setEvent(props.event);
    // }, [props.event]);

    return (
        <div style={{padding: "0 8px"}}>
            <Row justify="space-between" style={{padding: "8px 0"}}>
                <Col span={4}>
                    <span>Kind:</span>
                </Col>
                <Col span={18}>
                    <Input
                        value={props.event.getKind()}
                        onChange={(e) => {
                            props.event.setKind(e.target.value);
                            props.syncYaml();
                            refreshUI();
                        }}
                        size="small"
                        // style={{ width: "100%" }}
                    ></Input>
                </Col>
            </Row>
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
                        // dropdownAlign={{ points: ['tr', 'br'] }}
                        // getPopupContainer={triggerNode => triggerNode.parentElement.parentElement}
                        // className="nodrag"
                        size="small"
                        // mode="tags"
                        // popupMatchSelectWidth={false}
                        // style={{ width: "100%" }}
                        placeholder={"(none)"}
                    // tokenSeparators={[' ']}
                    // options={[]}
                    // open={false}
                    // suffixIcon={null}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                    ></TextArea>
                </Col>
            </Row>
        </div>
    );
}