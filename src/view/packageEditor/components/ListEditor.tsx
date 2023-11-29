import React from "react";
import Package from "../../../betonquest/Package";
import { Tabs } from "antd";
import EventsEditor from "./ListEditor/EventsEditor";
import { PiPlayFill } from "react-icons/pi";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { LuSearchCheck, LuSword } from "react-icons/lu";
import Condition from "../../../betonquest/Condition";
import ConditionsEditor from "./ListEditor/ConditionsEditor";
import ObjectivesEditor from "./ListEditor/ObjectivesEditor";
import ItemsEditor from "./ListEditor/ItemsEditor";

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
                destroyInactiveTabPane={false}
                // activeKey={tabsActiveKey}
                // onEdit={onTabsEdit}
                // items={tabsItems}
                items={[
                    {
                        key: "Events",
                        label: <div title="Events"><PiPlayFill /></div>,
                        children: <EventsEditor package={props.package} syncYaml={props.syncYaml}></EventsEditor>,
                        style: {
                            height: "calc(100% - 20px)"
                            // overflowY: "auto",
                            // height: "inherit"
                        },
                    },
                    {
                        key: "Conditions",
                        label: <div title="Conditions"><AiOutlineQuestionCircle /></div>,
                        children: <ConditionsEditor package={props.package} syncYaml={props.syncYaml}></ConditionsEditor>,
                        style: {
                            height: "calc(100% - 20px)"
                        },
                    },
                    {
                        key: "Objectives",
                        label: <div title="Objectives"><LuSearchCheck /></div>,
                        children: <ObjectivesEditor package={props.package} syncYaml={props.syncYaml}></ObjectivesEditor>,
                        style: {
                            height: "calc(100% - 20px)"
                        },
                    },
                    {
                        key: "Items",
                        label: <div title="Items"><LuSword /></div>,
                        children: <ItemsEditor package={props.package} syncYaml={props.syncYaml}></ItemsEditor>,
                        style: {
                            height: "calc(100% - 20px)"
                        },
                    },
                ]}
                // tabPosition="right"
                size="small"
                style={{
                    height: "100vh"
                }}
                tabBarStyle={{
                    color: "var(--vscode-disabledForeground)", // un-activated tab text color
                }}
            ></Tabs>
        </>
    );
}
