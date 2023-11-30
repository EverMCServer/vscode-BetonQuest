import React, { useEffect, useState } from "react";
import { Input, Row, Col, Divider, ConfigProvider, Select } from "antd";

import Package from "../../../../../betonquest/Package";
import Event from "../../../../../betonquest/Event";
import Default from "./EventsEditor/Default";
import Give from "./EventsEditor/Give";

interface EventsEditorProps {
    package: Package,
    event: Event,
    syncYaml: Function,
}

export default function(props: EventsEditorProps) {

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

    // All kinds
    const kinds = [
        {
            value: 'unknown',
            display: 'Unknown'
        },
        {
            value: 'give',
            display: 'Give'
        },
    ];

    // Find editor by kind
    const findEditor = (kind: string) => {
        switch (kind) {
            case 'give':
                return <Give {...props}></Give>;
        }
        return <Default {...props}></Default>;
    };

    return (
        <ConfigProvider
            theme={{
                components: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Divider: {
                        // global
                        marginLG: 0, // The margin of the Divider
                        lineWidth: 1,
                        colorSplit: 'var(--vscode-sideBarSectionHeader-border)',
                    }
                }
            }}
        >
        <div style={{padding: "0 8px"}}>
            <Row justify="space-between" style={{padding: "8px 0"}}>
                <Col span={4}>
                    <span>Kind:</span>
                </Col>
                <Col span={18}>
                    <Select
                        showSearch
                        value={props.event.getKind()}
                        placeholder="Please enter a kind"
                        defaultActiveFirstOption={false}
                        // suffixIcon={null}
                        filterOption={(input, option) =>
                            option?.value
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            || option?.label
                                .toLowerCase()
                                .includes(input.toLowerCase())
                            || false
                        }
                        onChange={(e) => {
                            props.event.setKind(e);
                            props.syncYaml();
                            refreshUI();
                        }}
                        notFoundContent={null}
                        options={(kinds || []).map((d) => ({
                            value: d.value,
                            label: d.display,
                        }))}
                        size="small"
                        style={{ width: "100%" }}
                    />
                </Col>
            </Row>
            <Divider />
            {findEditor(props.event.getKind())}
        </div>
        </ConfigProvider>
    );
}