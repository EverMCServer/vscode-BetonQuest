import React, { useEffect, useState } from "react";

import Package from "../../../../betonquest/Package";
import { Button, Collapse, CollapseProps, Input } from "antd";
import EventsEditor from "./EventsList/EventsEditor";
import { VscEdit, VscGear } from "react-icons/vsc";

interface EventsListProps {
    package: Package,
    syncYaml: Function,
}

export default function eventsList(props: EventsListProps) {

    // Convert all Events into coresponding Event's Editor
    const getEventEditors = (pkg: Package): CollapseProps['items'] => {
        return pkg.getAllEvents().map((e, i) => {
            return {
                key: i,
                label: <><span style={{ color: 'var(--vscode-input-foreground)'}}>{e.getName()}</span>&nbsp;<VscEdit style={{color: 'var(--vscode-input-placeholderForeground)'}} /></>,
                children: <EventsEditor key={e.getName()} package={props.package} syncYaml={props.syncYaml} event={e}></EventsEditor>,
                style: { margin: "8px 0" },
                extra: <><VscGear style={{margin: '0 6px 0 0'}} /></>
            };
        });
    };

    const [eventEditorList, setEventEditorList] = useState(getEventEditors(props.package));

    useEffect(() => {
        setEventEditorList(getEventEditors(props.package));
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
                items={eventEditorList}
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