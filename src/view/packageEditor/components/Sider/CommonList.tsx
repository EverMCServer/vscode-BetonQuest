import React, { useEffect, useState } from "react";

import Package from "../../../../betonquest/Package";
import { Button, Collapse, CollapseProps, Input } from "antd";
import { VscEdit, VscGear } from "react-icons/vsc";
import ListElement from "../../../../betonquest/ListElement";

interface CommonListProps {
    package: Package,
    syncYaml: Function,
    listElements: ListElement[],
    editor: (props: any) => React.JSX.Element,
}

export default function(props: CommonListProps) {

    // Convert all ListElements into coresponding ListElement's Editor
    const getListElementEditorList = (allElements: ListElement[]): CollapseProps['items'] => {
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
    }, [props.package]);

    return (
        <>
            <Input
                placeholder="Search"
                size="small"
                style={{
                    margin: "8px",
                    width: "-webkit-fill-available",
                }}
            ></Input>
            <Collapse
                // accordion
                items={listElementEditorList}
                // ghost={true}
                // bordered={false}
                defaultActiveKey={[0, 1, 2]}
                style={{
                    overflowY: "auto",
                    height: "inherit"
                }}
            ></Collapse>
        </>
    );
}