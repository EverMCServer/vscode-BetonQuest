import React from "react";
import Package from "../../../betonquest/Package";
import { Tabs } from "antd";
import EventsEditor from "./ListEditor/EventsEditor";
import { PiPlayFill } from "react-icons/pi";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { LuSearchCheck, LuSword } from "react-icons/lu";

interface ListEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function listEditor(props: ListEditorProps) {

    return (
        <>
            <Tabs
                type="line"
                // type="card"
                // onChange={onTabsChange}
                destroyInactiveTabPane={true}
                // activeKey={tabsActiveKey}
                // onEdit={onTabsEdit}
                // items={tabsItems}
                items={[
                    {
                        key: "Events",
                        label: <div title="Events"><PiPlayFill /></div>,
                        children: <EventsEditor package={props.package} syncYaml={props.syncYaml}></EventsEditor>,
                    },
                    {
                        key: "Conditions",
                        label: <div title="Conditions"><AiOutlineQuestionCircle /></div>,
                    },
                    {
                        key: "Objectives",
                        label: <div title="Objectives"><LuSearchCheck /></div>,
                    },
                    {
                        key: "Items",
                        label: <div title="Items"><LuSword /></div>, style: {},
                    },
                ]}
                // tabPosition="right"
                size="small"
                style={{
                    height: "100%"
                }}
                tabBarStyle={{
                    color: "var(--vscode-disabledForeground)", // un-activated tab text color
                }}
            ></Tabs>
            <div style={{position: "absolute", bottom: "0"}}>(ListEditor component)</div>
        </>
    );
}
