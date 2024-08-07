import { Checkbox, Col, Divider, Input, Row } from "antd";
import { useEffect, useState } from "react";

import Arguments, { ArgumentType, ArgumentsPatterns } from "betonquest-utils/betonquest/Arguments";
import Event from "betonquest-utils/betonquest/Event";

import { ListElementEditorBodyProps } from "../../CommonList/CommonEditor";

// e.g. emerald:5,emerald_block:9,important_sign notify backpack
const pattern: ArgumentsPatterns = {
    mandatory: [
        { name: 'item_list', type: ArgumentType.itemID, format: '[string:number?][,]', defaultValue: [["emerald", 5], ["emerald_block", 9], ["important_sign", 1]] },
    ],
    optional: [
        { name: 'notify', type: ArgumentType.constant, key: 'notify', format: 'boolean' },
        { name: 'backpack', type: ArgumentType.constant, key: 'backpack', format: 'boolean' }
    ]

};

const colSpanLeft = 4;
const colSpanRight = 18;

export default function (props: ListElementEditorBodyProps<Event>) {

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
                        value={(args?.getMandatoryArgument(0).getValue() as [string, number][])?.map(e => `${e[0]}:${e[1]}`).join(",")}
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
                        checked={args?.getOptionalArgument('notify')?.getValue() as boolean}
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
                        checked={args?.getOptionalArgument('backpack')?.getValue() as boolean}
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