import React, { useState } from "react";
import { Row, Col, Divider, Select } from "antd";

import ListElement from "../../../../../betonquest/ListElement";
import { BaseListProps } from "../CommonList";
import { ArgumentsPattern } from "../../../../../betonquest/Arguments";

export interface ListElementEditorProps<T extends ListElement> extends BaseListProps {
    listElement: T,
    kindSelectDefaultOpen?: boolean,
}

export interface ListElementEditorBodyProps<T extends ListElement> extends ListElementEditorProps<T> {
    argumentsPattern: ArgumentsPattern,
}

export type Kind<T extends ListElement> = {
    value: string,
    display: string,
    description: string,
    editorBody?: (props: ListElementEditorBodyProps<T>) => React.JSX.Element,
    argumentsPattern: ArgumentsPattern
    // argumentsConfig: ArgumentsPattern & {
    //     mandatory: {
    //         jsx: React.JSX.Element,
    //         config?: any
    //     }[],
    //     optional?: {
    //         jsx: React.JSX.Element,
    //         config?: any
    //     }[]
    // },
};

interface CommonEditorProps<T extends ListElement> extends ListElementEditorProps<T> {
    kinds: Kind<T>[],
    defaultEditorBody: (props: ListElementEditorBodyProps<T>) => React.JSX.Element,
}

export default function <T extends ListElement>(props: CommonEditorProps<T>) {

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

    // Handle kind search
    const onKindFilter = (input: string, option: {
        value: string;
        label: string;
    } | undefined) => {
        try {
            const patten = new RegExp(input, 'i');
            return (
                option?.value.match(patten)
                || option?.label.match(patten)
            ) ? true : false;
        } catch (e) {
            // Handle regex patten error
            return false;
        }
    };

    // Find editor by kind
    const getEditorBody = (kind: string) => {
        const k = props.kinds.find(e => e.value === kind);

        // Create arguments' editor by kind.argumentsConfig
        return (<>
            {k?.description && <div style={{ padding: "0 8px 8px 8px" }}><b>{k.description}</b></div>}
            {k && (k.editorBody &&
                <k.editorBody {...props} argumentsPattern={k.argumentsPattern} />
                ||
                <props.defaultEditorBody {...props} argumentsPattern={k.argumentsPattern}></props.defaultEditorBody>)
            }
        </>);
    };

    return (
        <div style={{ padding: "0 8px" }}>
            <Row justify="space-between" style={{ margin: "8px 0" }}>
                <Col span={4}>
                    <span>Kind:</span>
                </Col>
                <Col span={18}>
                    <Select
                        showSearch
                        defaultOpen={props.kindSelectDefaultOpen}
                        autoFocus={props.kindSelectDefaultOpen}
                        value={props.listElement.getKind()}
                        placeholder="Please enter a kind"
                        defaultActiveFirstOption={false}
                        // suffixIcon={null}
                        filterOption={onKindFilter}
                        onChange={(e) => {
                            props.listElement.setKind(e);
                            props.syncYaml();
                            refreshUI();
                        }}
                        notFoundContent={null}
                        options={props.kinds.map((d) => ({
                            value: d.value,
                            label: d.display,
                        }))}
                        size="small"
                        style={{ width: "100%" }}
                    />
                </Col>
            </Row>
            <Divider />
            {getEditorBody(props.listElement.getKind())}
        </div>
    );
}