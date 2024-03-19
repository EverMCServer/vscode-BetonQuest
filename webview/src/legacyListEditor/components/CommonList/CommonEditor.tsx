import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { Row, Col, Divider, Select } from "antd";

import L from "betonquest-utils/i18n/i18n";
import ListElement from "betonquest-utils/betonquest/ListElement";
import { ArgumentsPatterns } from "betonquest-utils/betonquest/Arguments";
import { ElementKind } from "betonquest-utils/betonquest/v1/Element";
import { BaseListProps } from "../CommonList";

import styles from "./CommonEditor.module.css";

export interface ListElementEditorProps<T extends ListElement> extends BaseListProps<T> {
    listElement: T,
}

export interface ListElementEditorBodyProps<T extends ListElement> extends ListElementEditorProps<T> {
    argumentsPatterns: ArgumentsPatterns,
}

export type Kind<T extends ListElement> = ElementKind<T> & {
    editorBody?: (props: ListElementEditorBodyProps<T>) => React.JSX.Element,
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

    const optionsCache = useRef(props.kinds.slice(1).map(k => ({
        value: k.value,
        label: `${k.display} (${k.value})`,
    })));

    const [options, setOptions] = useState<{ label: string, value: string }[]>(optionsCache.current);
    useEffect(() => {
        setOptions(optionsCache.current);
    }, [props.kinds]);

    const onKindSearch = (input: string) => {
        const opt = optionsCache.current.slice();
        if (
            input.match(/^[a-zA-Z]+$/g) &&
            !options.some(e => e.value === input)
        ) {
            opt.unshift({
                value: input,
                label: input,
            });
        }
        setOptions(opt);
    };

    // Handle kind search
    const onKindFilter = (input: string, option: {
        value: string;
        label: string;
    } | undefined) => {
        try {
            const pattern = new RegExp(input, 'i');
            return (
                option?.value.match(pattern)
                || option?.label.match(pattern)
            ) ? true : false;
        } catch (e) {
            // Handle regex pattern error
            return false;
        }
    };

    // Find editor by kind
    const getEditorBody = (kind: string) => {
        const k = props.kinds.find(e => e.value === kind) || props.kinds.find(e => e.value === '*');

        // Create arguments' editor by kind.argumentsConfig
        return (<>
            {k?.description && <div style={{ padding: "0 8px 8px 8px" }} dangerouslySetInnerHTML={{ __html: k.description}} />}
            {k && (k.editorBody &&
                <k.editorBody {...props} argumentsPatterns={k.argumentsPatterns} />
                ||
                <props.defaultEditorBody {...props} argumentsPatterns={k.argumentsPatterns}></props.defaultEditorBody>)
            }
        </>);
    };

    // Auto re-arange cells
    const parentRef = useRef<HTMLDivElement>(null);
    const [spanL, setSpanL] = useState(6);
    const [spanR, setSpanR] = useState(18);
    useEffect(() => {
        new ResizeObserver(() => {
            const width = parentRef.current?.getBoundingClientRect().width;
            if (width) {
                if (width < 320) {
                    setSpanL(24);
                    setSpanR(24);
                } else if (width < 480) {
                    setSpanL(6);
                    setSpanR(18);
                } else if (width < 640) {
                    setSpanL(4);
                    setSpanR(20);
                } else {
                    setSpanL(2);
                    setSpanR(22);
                }
            }
        }).observe(parentRef.current as Element);
    }, []);

    return (
        <div style={{ padding: "0 8px" }}>
            <Row ref={parentRef} justify="space-between" gutter={[0, 4]} style={{ padding: "8px 8px" }}>
                <Col span={spanL}>
                    <span>{L("*.commonList.commonEditor.kind")}</span>
                </Col>
                <Col span={spanR}>
                    <Select
                        className={styles.select}
                        showSearch
                        defaultOpen={!props.listElement.getKind()}
                        autoFocus={!props.listElement.getKind()}
                        value={props.listElement.getKind() || undefined}
                        placeholder={L("*.commonList.commonEditor.kindPlaceholder")}
                        defaultActiveFirstOption={false}
                        // suffixIcon={null}
                        onChange={(e) => {
                            props.listElement.setKind(e);
                            props.syncYaml();
                            refreshUI();
                        }}
                        onSearch={onKindSearch}
                        filterOption={onKindFilter}
                        notFoundContent={null}
                        options={options}
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