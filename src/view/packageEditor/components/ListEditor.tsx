import React from "react";
import Package from "../../../betonquest/Package";
import { Tabs } from "antd";
import EventsEditor from "./ListEditor/EventsEditor";

interface ListEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function listEditor(props: ListEditorProps) {

    return (
        <>
            <Tabs
                type={"line"}
                // onChange={onTabsChange}
                // activeKey={tabsActiveKey}
                // onEdit={onTabsEdit}
                // items={tabsItems}
                items={[
                    {key: "Events", label: <div title="Events">E</div>, children: <EventsEditor package={props.package} syncYaml={props.syncYaml}></EventsEditor>},
                    {key: "Conditions", label: <div title="Conditions">C</div>},
                    {key: "Objectives", label: <div title="Objectives">O</div>},
                    {key: "Items", label: <div title="Items">I</div>, style: {}},
                ]}
                // tabPosition="right"
                style={{
                    height: "100%"
                }}
            ></Tabs>
            <div>ListEditor...</div>
        </>
    );
}
