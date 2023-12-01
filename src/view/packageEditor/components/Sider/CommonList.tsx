import React, { useEffect, useState } from "react";

import Package from "../../../../betonquest/Package";
import { Button, Collapse, CollapseProps, Input } from "antd";
import { VscEdit, VscGear } from "react-icons/vsc";
import ListElement, { ListElementType } from "../../../../betonquest/ListElement";
import { ListElementEditorProps } from "./CommonList/CommonEditor";

interface CommonListProps<T extends ListElement> {
    package: Package,
    syncYaml: Function,
    type: ListElementType,
    listElements: T[],
    editor: (props: ListElementEditorProps<T>) => React.JSX.Element,
}

export interface BaseListProps {
    package: Package,
    syncYaml: Function,
}

export default function<T extends ListElement>(props: CommonListProps<T>) {

    // UI update trigger #1
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    // Convert all ListElements into coresponding ListElement's Editor
    const getListElementEditorList = (allElements: T[]): CollapseProps['items'] => {
        return allElements.map((e, i) => {
            return {
                key: i,
                label: <><span style={{ color: 'var(--vscode-input-foreground)'}}>{e.getName()}</span>&nbsp;<VscEdit style={{color: 'var(--vscode-input-placeholderForeground)'}} /></>,
                children: <props.editor key={e.getName()} package={props.package} syncYaml={props.syncYaml} listElement={e}></props.editor>,
                style: { margin: "8px 0" },
                extra: <><VscGear style={{margin: '0 6px 0 0'}} /></>
            };
        });
    };

    const [listElementEditorList, setListElementEditorList] = useState(getListElementEditorList(props.listElements));

    useEffect(() => {
        setListElementEditorList(getListElementEditorList(props.listElements));
        console.log("debug");
    }, [props.listElements]);

    // Handle search
    const onElementSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 0) {
            const patten = new RegExp(e.target.value, 'i');
            const filteredElements = props.listElements.filter(element => {
                return element.getName().match(patten) || element.toString().match(patten);
            });
            setListElementEditorList(getListElementEditorList(filteredElements));
        } else {
            setListElementEditorList(getListElementEditorList(props.listElements));
        }
    };

    // Handle add
    const onAddElement = () => {
        // Get incremental ID
        let id = 0;
        while (props.listElements.some(e => e.getName() === 'new_' + props.type + id)) {
            id++;
        }

        // Create
        props.package.createListElement(props.type, 'new_' + props.type + id);
        props.syncYaml();
        // refreshUI();
    };

    return (
        <>
            <Input
                placeholder="Search"
                size="small"
                style={{
                    margin: "8px",
                    width: "-webkit-fill-available",
                }}
                onChange={onElementSearch}
                allowClear
            ></Input>
            <div
                style={{
                    overflowY: "auto",
                    height: "inherit"
                }}
            >
                <Collapse
                    // accordion
                    items={listElementEditorList}
                    // ghost={true}
                    // bordered={false}
                    defaultActiveKey={[0, 1, 2]}
                ></Collapse>
                <Button
                    type="primary"
                    onClick={onAddElement}
                    style={{
                        margin: "24px 8px",
                        width: "-webkit-fill-available",
                    }}
                >
                    Add
                </Button>
            </div>
        </>
    );
}