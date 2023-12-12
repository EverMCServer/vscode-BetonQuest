import React, { useEffect, useState } from "react";

import Package from "../../../../../../betonquest/Package";
import Event from "../../../../../../betonquest/Event";
import Arguments, { ArgumentsPattern } from "../../../../../../betonquest/Arguments";
import { Checkbox, Col, Divider, Input, InputNumber, Row } from "antd";

interface Props {
    package: Package,
    syncYaml: Function,
    listElement: Event,
}

// e.g. emerald:5,emerald_block:9,important_sign notify backpack
const pattern: ArgumentsPattern = {
    mandatory: ['[string:number][,]'],
    mandatoryDefault: [
        [["emerald", 5], ["emerald_block", 9], ["important_sign", 1]]
    ],
    optional: new Map([
        ['notify', 'boolean'],
        ['backpack', 'boolean']
    ]),
    optionalDefault: new Map([
        ['notify', true],
        ['backpack', undefined],
    ])
};

const colSpanLeft = 4;
const colSpanRight = 18;

export default function (props: Props) {

    // UI update trigger #1
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    // useEffect(()=>{
    //     setEvent(props.event);
    // }, [props.event]);

    const [args, setArgs] = useState<Arguments>();
    useEffect(() => {
        setArgs(props.listElement.getArguments(pattern));
    }, [props.listElement]);

    return (
        <>
            <Divider orientation="left" plain>
                Mandatory Arguments
            </Divider>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={colSpanLeft}>
                    <span>Items:</span>
                </Col>
                <Col span={colSpanRight}>
                    <Input
                        value={(args?.getMandatoryArgument(0) as [string, number][])?.map(e => `${e[0]}:${e[1]}`).join(",")}
                        onChange={(e) => {
                            args?.setMandatoryArgument(0, e.target.value.split(",").map(e => e.split(":") as [string, number]));
                            props.syncYaml();
                            refreshUI();
                        }}
                        size="small"
                    />
                </Col>
            </Row>
            <Divider orientation="left" plain>
                Optional Arguments
            </Divider>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={colSpanLeft}>
                    <span>Notify:</span>
                </Col>
                <Col span={colSpanRight}>
                    <Checkbox
                        checked={args?.getOptionalArgument('notify') as boolean}
                        onChange={(e) => {
                            args?.setOptionalArgument('notify', e.target.checked);
                            props.syncYaml();
                            refreshUI();
                        }}
                    />
                </Col>
            </Row>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={colSpanLeft}>
                    <span>Backpack:</span>
                </Col>
                <Col span={colSpanRight}>
                    <Checkbox
                        checked={args?.getOptionalArgument('backpack') as boolean}
                        onChange={(e) => {
                            args?.setOptionalArgument('backpack', e.target.checked);
                            props.syncYaml();
                            refreshUI();
                        }}
                    />
                </Col>
            </Row>
        </>
    );
}