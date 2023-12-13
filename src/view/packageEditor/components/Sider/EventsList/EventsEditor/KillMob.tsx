import React, { useEffect, useState } from "react";
import { Col, Divider, Input, InputNumber, Row } from "antd";

import Package from "../../../../../../betonquest/Package";
import Event from "../../../../../../betonquest/Event";
import Arguments, { ArgumentsPattern } from "../../../../../../betonquest/Arguments";

interface Props {
    package: Package,
    syncYaml: Function,
    listElement: Event,
}

// e.g. killmob ZOMBIE 100;200;300;world 40 name:Bolec marked:quest_mob
const pattern: ArgumentsPattern = {
    mandatory: ['string', 'string', 'float'],
    mandatoryDefault: [
        'ZOMBIE',
        '100;200;300;world',
        1.0
    ],
    optional: new Map([
        ['name', 'string'],
        ['marked', 'string']
    ])
};

const colSpanLeft = 8;
const colSpanRight = 14;

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
                    <span>Entity Type:</span>
                </Col>
                <Col span={colSpanRight}>
                    <Input
                        value={args?.getMandatoryArgument(0) as string}
                        onChange={(e) => {
                            args?.setMandatoryArgument(0, e.target.value);
                            props.syncYaml();
                            refreshUI();
                        }}
                        size="small"
                    />
                </Col>
            </Row>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={colSpanLeft}>
                    <span>Location:</span>
                </Col>
                <Col span={colSpanRight}>
                    <Input
                        value={args?.getMandatoryArgument(1) as string}
                        onChange={(e) => {
                            args?.setMandatoryArgument(1, e.target.value);
                            props.syncYaml();
                            refreshUI();
                        }}
                        size="small"
                        placeholder="e.g. 100;200;300;world"
                    />
                </Col>
            </Row>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={colSpanLeft}>
                    <span>Radius:</span>
                </Col>
                <Col span={colSpanRight}>
                    <InputNumber
                        defaultValue={1}
                        value={args?.getMandatoryArgument(2) as number}
                        onChange={(value) => {
                            args?.setMandatoryArgument(2, value || 1);
                            props.syncYaml();
                            refreshUI();
                        }}
                        min={1}
                        step={1}
                        size="small"
                        placeholder="e.g. 10"
                    />
                </Col>
            </Row>
            <Divider orientation="left" plain>
                Optional Arguments
            </Divider>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={colSpanLeft}>
                    <span>Name:</span>
                </Col>
                <Col span={colSpanRight}>
                    <Input
                        value={args?.getOptionalArgument('name') as string}
                        onChange={(e) => {
                            args?.setOptionalArgument('name', e.target.value);
                            props.syncYaml();
                            refreshUI();
                        }}
                        size="small"
                    />
                </Col>
            </Row>
            <Row justify="space-between" style={{ padding: "8px 0" }}>
                <Col span={colSpanLeft}>
                    <span>Marked:</span>
                </Col>
                <Col span={colSpanRight}>
                    <Input
                        value={args?.getOptionalArgument('marked') as string}
                        onChange={(e) => {
                            args?.setOptionalArgument('marked', e.target.value);
                            props.syncYaml();
                            refreshUI();
                        }}
                        size="small"
                    />
                </Col>
            </Row>
        </>
    );
}
