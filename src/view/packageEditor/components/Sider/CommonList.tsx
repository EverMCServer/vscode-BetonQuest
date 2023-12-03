import React, { useEffect, useState } from "react";

import { Button, Collapse, CollapseProps, Input } from "antd";
import { ItemType } from "rc-collapse/es/interface";

import Package from "../../../../betonquest/Package";
import ListElement, { ListElementType } from "../../../../betonquest/ListElement";
import CollapseLabel from "./CommonList/CollapseLabel";
import CollapseExtra from "./CommonList/CollapseExtra";
import { ListElementEditorProps } from "./CommonList/CommonEditor";

export interface BaseListProps {
    package: Package,
    syncYaml: Function,
}

export interface CommonListProps<T extends ListElement> extends BaseListProps {
    type: ListElementType,

    editor: (props: ListElementEditorProps<T>) => React.JSX.Element,
}

export default function<T extends ListElement>(props: CommonListProps<T>) {

    // UI update trigger #1
    const [getTrigger, setTrigger] = useState(false);
    const refreshUI = () => {
        setTrigger(!getTrigger);
    };

    // Cache all ListElements
    const [listElements, setListElements] = useState<T[]>(props.package.getAllListElements(props.type));

    // Convert all ListElements into coresponding ListElement's Editor
    const getListElementEditor = (e: T, key?: string | number): ItemType => {
        return {
            key: key?? e.getName(),
            label: <CollapseLabel {...props} listElement={e}></CollapseLabel>,
            children: <props.editor key={e.getName()} {...props} listElement={e}></props.editor>,
            style: { margin: "8px 0" },
            extra: <CollapseExtra {...props} listElement={e} />
        };
    };
    const getListElementEditorList = (allElements: T[]): CollapseProps['items'] => {
        return allElements.map((e, i) => {
            return getListElementEditor(e, i);
        });
    };

    const [listElementEditorList, setListElementEditorList] = useState(getListElementEditorList(listElements));

    useEffect(() => {
        const newListElements = props.package.getAllListElements<T>(props.type);
        setListElements(newListElements);
        setListElementEditorList(getListElementEditorList(newListElements));
    }, [props.package]);

    // Handle search
    const onElementSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 0) {
            const patten = new RegExp(e.target.value, 'i');
            const filteredElements = listElements.filter(element => {
                return element.getName().match(patten) || element.toString().match(patten);
            });
            setListElementEditorList(getListElementEditorList(filteredElements));
        } else {
            setListElementEditorList(getListElementEditorList(listElements));
        }
    };

    // Handle add
    const onElementAdd = () => {
        // Get incremental ID
        let id = 1;
        while (listElements.some(e => e.getName() === props.type + '_' + id)) {
            id++;
        }

        // Create
        const newListElement = props.package.createListElement<T>(props.type, props.type + '_' + id);
        const newListElements = [...listElements, newListElement];
        // Append to cached listElements
        setListElements(newListElements);
        // Append new editor to elementEditorList
        setListElementEditorList(listElementEditorList?.concat(getListElementEditor(newListElement)));
        props.syncYaml();
    };

    // Handle Collapse
    const [collapseActiveKeys, setCollapseActiveKeys] = useState<string | string[]>([]);

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
                    defaultActiveKey={collapseActiveKeys}
                    onChange={setCollapseActiveKeys}
                ></Collapse>
                <Button
                    type="primary"
                    onClick={onElementAdd}
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