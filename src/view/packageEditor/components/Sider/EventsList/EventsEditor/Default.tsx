import React, { useEffect, useState } from "react";
import { Col, Divider, Row, Tooltip } from "antd";

import Event from "../../../../../../betonquest/Event";
import Arguments, { MandatoryArgumentDataType, OptionalArgumentDataType } from "../../../../../../betonquest/Arguments";
import { ListElementEditorBodyProps } from "../../CommonList/CommonEditor";
import { VscQuestion } from "react-icons/vsc";

const colSpanLeft = 4;
const colSpanRight = 18;

export default function (props: ListElementEditorBodyProps<Event>) {

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

    const [args, setArgs] = useState<Arguments>();
    useEffect(() => {
        setArgs(props.listElement.getArguments(props.argumentsPattern));
    }, [props.listElement]);

    return (
        <>
            {props.argumentsPattern.optional &&
                <Divider orientation="left" plain>
                    Mandatory Arguments
                </Divider>
            }
            {props.argumentsPattern.mandatory.map((arg, index) => {
                return (
                    <Row justify="space-between" style={{ padding: "0 0 16px 0" }} key={index}>
                        <Col span={colSpanLeft}>
                            <span>
                                {arg.name}&nbsp;
                                {arg.tooltip && <>
                                    <sup>
                                        <Tooltip placement="topRight" title={<span color="var(--vscode-notifications-foreground)">{arg.tooltip}</span>} color="var(--vscode-notifications-background)">
                                            <VscQuestion />
                                        </Tooltip>
                                    </sup>&nbsp;
                                </>}
                            </span>
                        </Col>
                        <Col span={colSpanRight}>
                            {arg.jsx && <arg.jsx
                                value={args?.getMandatoryArgument(index)}
                                defaultValue={arg.defaultValue}
                                placeholder={arg.placeholder}
                                onChange={(value: MandatoryArgumentDataType) => {
                                    args?.setMandatoryArgument(index, value);
                                    props.syncYaml();
                                    refreshUI();
                                }}
                                config={arg.config}
                            />}
                        </Col>
                    </Row>
                );
            })}
            {props.argumentsPattern.optional &&
                <>
                    <Divider orientation="left" plain>
                        Optional Arguments
                    </Divider>
                    {props.argumentsPattern.optional?.map((arg, index) => {
                        return (
                            <Row justify="space-between" style={{ padding: "0 0 16px 0" }} key={index}>
                                <Col span={colSpanLeft}>
                                    <span>{arg.name}&nbsp;
                                        {arg.tooltip && <>
                                            <sup>
                                                <Tooltip placement="topRight" title={<span color="var(--vscode-notifications-foreground)">{arg.tooltip}</span>} color="var(--vscode-notifications-background)">
                                                    <VscQuestion />
                                                </Tooltip>
                                            </sup>&nbsp;
                                        </>}
                                    </span>
                                </Col>
                                <Col span={colSpanRight}>
                                    {arg.jsx && <arg.jsx
                                        value={args?.getOptionalArgument(arg.key)}
                                        placeholder={arg.placeholder}
                                        onChange={(value: OptionalArgumentDataType) => {
                                            args?.setOptionalArgument(arg.key, value);
                                            props.syncYaml();
                                            refreshUI();
                                        }}
                                        config={arg.config}
                                    />}
                                </Col>
                            </Row>
                        );
                    })}
                </>
            }
        </>
    );
}