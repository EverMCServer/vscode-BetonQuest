import React, { useEffect, useState } from "react";
import { Input, Row, Col, Divider, ConfigProvider, Select } from "antd";

import Package from "../../../../../betonquest/Package";
import ListElement from "../../../../../betonquest/ListElement";
import { BaseListProps } from "../CommonList";

export interface ListElementEditorProps<T extends ListElement> extends BaseListProps {
    listElement: T,
}

interface CommonEditorProps<T extends ListElement> extends ListElementEditorProps<T> {
    kinds: {
        value: string,
        display: string,
        editor: (props: ListElementEditorProps<T>) => React.JSX.Element,
    }[],
    defaultEditor: (props: ListElementEditorProps<T>) => React.JSX.Element,
}

export default function<T extends ListElement>(props: CommonEditorProps<T>) {

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

    // Find editor by kind
    const findEditor = (kind: string) => {
        const k = props.kinds.find(e => e.value === kind);
        return k && <k.editor {...props} /> || <props.defaultEditor {...props} />;
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
                        value={props.listElement.getKind()}
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
                            props.listElement.setKind(e);
                            props.syncYaml();
                            refreshUI();
                        }}
                        notFoundContent={null}
                        options={(props.kinds || []).map((d) => ({
                            value: d.value,
                            label: d.display,
                        }))}
                        size="small"
                        style={{ width: "100%" }}
                    />
                </Col>
            </Row>
            <Divider />
            {findEditor(props.listElement.getKind())}
        </div>
        </ConfigProvider>
    );
}