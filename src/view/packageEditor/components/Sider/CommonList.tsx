import React, { useEffect, useRef, useState } from "react";

import { Button, Collapse, CollapseProps, Input } from "antd";
import { ItemType } from "rc-collapse/es/interface";
import { VscChevronRight } from "react-icons/vsc";

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

export default function <T extends ListElement>(props: CommonListProps<T>) {

    // // UI update trigger #1
    // const [getTrigger, setTrigger] = useState(false);
    // const refreshUI = () => {
    //     setTrigger(!getTrigger);
    // };

    // Cache all ListElements
    const [listElements, _setListElements] = useState<T[]>(props.package.getAllListElements(props.type));
    const listElementsCache = useRef(listElements);
    const setListElements = (newListElements: T[]) => {
        listElementsCache.current = newListElements;
        _setListElements(newListElements);
    };

    // Convert all ListElements into coresponding ListElement's Editor
    const getListElementEditor = (e: T): ItemType => {
        const name = e.getName();
        return {
            key: name,
            label: <CollapseLabel {...props} listElement={e}></CollapseLabel>,
            children: <props.editor key={name} {...props} listElement={e}></props.editor>,
            style: { padding: "4px 0 0 0" },
            extra: <CollapseExtra {...props} name={name} removeElement={onElementRemove} />
        };
    };
    const getListElementEditorList = (allElements: T[]): CollapseProps['items'] => {
        return allElements.map(e => {
            return getListElementEditor(e);
        });
    };

    // Cache all ListElements' Editor
    const [listElementEditorList, _setListElementEditorList] = useState(getListElementEditorList(listElements));
    const listElementEditorListCache = useRef(listElementEditorList);
    const setListElementEditorList = (newListElementEditorList: CollapseProps['items']) => {
        listElementEditorListCache.current = newListElementEditorList;
        _setListElementEditorList(newListElementEditorList);
    };

    useEffect(() => {
        const newListElements = props.package.getAllListElements<T>(props.type);
        setListElements(newListElements);
        setListElementEditorList(getListElementEditorList(newListElements));
    }, [props.package]);

    // Handle search
    const onElementSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value.length > 0) {
            try {
                const patten = new RegExp(e.target.value, 'i');
                const filteredElements = listElements.filter(element => {
                    return element.getName().match(patten) || element.toString().match(patten);
                });
                setListElementEditorList(getListElementEditorList(filteredElements));
            } catch (e) {
                // Handle regex patten error
                setListElementEditorList([]);
            }
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
        // Create new editor
        const newListElementEditor = getListElementEditor(newListElement);
        // Append new editor to elementEditorList
        setListElementEditorList(listElementEditorList?.concat(newListElementEditor));
        // Expand editor
        if (typeof collapseActiveKeys === 'string') {
            setCollapseActiveKeys([collapseActiveKeys, newListElement.getName()]);
        } else {
            setCollapseActiveKeys([...collapseActiveKeys, newListElement.getName()]);
        }
        props.syncYaml();
    };

    const onElementRemove = (type: ListElementType, name: string) => {
        // Remove from cached listElements
        const newListElements = listElementsCache.current.filter(e => e.getName() !== name);
        setListElements(newListElements);
        // Remove from elementEditorList
        const newListElementEditorList = listElementEditorListCache.current?.filter(e => e.key !== name);
        setListElementEditorList(newListElementEditorList);

        // Remove from package
        props.package.removeListElement(type, name);
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
                    expandIcon={({ isActive }) => <VscChevronRight style={{ marginLeft: "8px", transform: isActive ? 'rotate(90deg)' : undefined }} />}
                    items={listElementEditorList}
                    // ghost={true}
                    // bordered={false}
                    activeKey={collapseActiveKeys}
                    onChange={setCollapseActiveKeys}
                    destroyInactivePanel={true}
                ></Collapse>
                <Button
                    type="primary"
                    onClick={onElementAdd}
                    style={{
                        margin: "24px 20px",
                        width: "-webkit-fill-available",
                    }}
                >
                    New
                </Button>
            </div>
        </>
    );
}