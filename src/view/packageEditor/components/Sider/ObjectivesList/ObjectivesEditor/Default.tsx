import React, { useEffect, useRef, useState } from "react";
import { Col, Divider, Row, Tooltip } from "antd";
import { VscQuestion } from "react-icons/vsc";

import Objective from "../../../../../../betonquest/Objective";
import { ListElementEditorBodyProps } from "../../CommonList/CommonEditor";
import { MandatoryArgumentDataType, OptionalArgumentDataType } from "../../../../../../betonquest/Arguments";

const colSpanLeft1 = 10;
const colSpanRight1 = 14;
const colSpanLeft2 = 8;
const colSpanRight2 = 16;
const colSpanLeft3 = 6;
const colSpanRight3 = 18;

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

    // Auto re-arange cells
    const parentRef = useRef<HTMLDivElement>(null);
    const [spanL, setSpanL] = useState(colSpanLeft1);
    const [spanR, setSpanR] = useState(colSpanRight1);
    useEffect(() => {
        new ResizeObserver(() => {
            const width = parentRef.current?.getBoundingClientRect().width;
            console.log("width", width);
            if (width) {
                if (width < 320) {
                    setSpanL(24);
                    setSpanR(24);
                } else if (width < 480) {
                    setSpanL(colSpanLeft1);
                    setSpanR(colSpanRight1);
                } else if (width < 640) {
                    setSpanL(colSpanLeft2);
                    setSpanR(colSpanRight2);
                } else {
                    setSpanL(colSpanLeft3);
                    setSpanR(colSpanRight3);
                }
            }
        }).observe(parentRef.current as Element);
    }, []);

    return (
        <div ref={parentRef}>
            {(props.argumentsPattern.mandatory.length > 0 && props.argumentsPattern.optional) &&
                <Divider orientation="center" plain>
                    <u>Mandatory Arguments</u>
                </Divider>
            }
            {props.argumentsPattern.mandatory.map((arg, index) => {
                return (
                    <Row justify="space-between" gutter={[0, 4]} style={{ padding: "0 8px 16px 8px" }} key={index}>
                        <Col span={spanL}>
                            <span>
                                {arg.name}&nbsp;
                                {arg.tooltip && <>
                                    <sup>
                                        <Tooltip title={<span>{arg.tooltip}</span>}>
                                            <VscQuestion />
                                        </Tooltip>
                                    </sup>&nbsp;
                                </>}
                            </span>
                        </Col>
                        <Col span={spanR}>
                            {arg.jsx && <arg.jsx
                                value={args.getMandatoryArgument(index).getValue()}
                                defaultValue={arg.defaultValue}
                                placeholder={arg.placeholder}
                                onChange={(value: MandatoryArgumentDataType) => {
                                    args.setMandatoryArgument(index, value);
                                    props.syncYaml();
                                    refreshUI(); // Refresh states, if component uses useEffect() inside
                                }}
                                config={arg.config}
                            />}
                        </Col>
                    </Row>
                );
            })}
            {props.argumentsPattern.optional &&
                <>
                    <Divider orientation="center" plain>
                        <u>Optional Arguments</u>
                    </Divider>
                    {props.argumentsPattern.optional?.map((arg, index) => {
                        return (
                            <Row justify="space-between" gutter={[0, 4]} style={{ padding: "0 8px 16px 8px" }} key={index}>
                                <Col span={spanL}>
                                    <span>{arg.name}&nbsp;
                                        {arg.tooltip && <>
                                            <sup>
                                                <Tooltip title={<span>{arg.tooltip}</span>}>
                                                    <VscQuestion />
                                                </Tooltip>
                                            </sup>&nbsp;
                                        </>}
                                    </span>
                                </Col>
                                <Col span={spanR}>
                                    {arg.jsx && <arg.jsx
                                        value={args.getOptionalArgument(arg.key)?.getValue()}
                                        placeholder={arg.placeholder}
                                        onChange={(value: OptionalArgumentDataType) => {
                                            args.setOptionalArgument(arg.key, value);
                                            props.syncYaml();
                                            refreshUI(); // Refresh states, if component uses useEffect() inside
                                        }}
                                        config={arg.config}
                                    />}
                                </Col>
                            </Row>
                        );
                    })}
                </>
            }
        </div>
    );
}