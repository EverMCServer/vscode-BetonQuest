import React from "react";
import Package from "../../../betonquest/Package";
import { ConfigProvider, Tabs, Tooltip } from "antd";
import { PiPlayFill } from "react-icons/pi";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { LuSearchCheck, LuSword } from "react-icons/lu";

import EventsList from "./Sider/EventsList";
import ConditionsList from "./Sider/ConditionsList";
import ObjectivesList from "./Sider/ObjectivesList";
import ItemsList from "./Sider/ItemsList";
import L from "../../../i18n/i18n";

interface ListEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function sider(props: ListEditorProps) {

    return (
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
                    label: <Tooltip placement="bottomRight" title={L("packageEditor.sider.events")}><PiPlayFill /></Tooltip>,
                    children: <EventsList package={props.package} syncYaml={props.syncYaml}></EventsList>,
                    style: {
                        height: "calc(100% - 20px)"
                        // overflowY: "auto",
                        // height: "inherit"
                    },
                },
                {
                    key: "Conditions",
                    label: <Tooltip placement="bottom" title={L("packageEditor.sider.conditions")}><AiOutlineQuestionCircle /></Tooltip>,
                    children: <ConditionsList package={props.package} syncYaml={props.syncYaml}></ConditionsList>,
                    style: {
                        height: "calc(100% - 20px)"
                    },
                },
                {
                    key: "Objectives",
                    label: <Tooltip placement="bottom" title={L("packageEditor.sider.objectives")}><LuSearchCheck /></Tooltip>,
                    children: <ObjectivesList package={props.package} syncYaml={props.syncYaml}></ObjectivesList>,
                    style: {
                        height: "calc(100% - 20px)"
                    },
                },
                {
                    key: "Items",
                    label: <Tooltip placement="bottom" title={L("packageEditor.sider.items")}><LuSword /></Tooltip>,
                    children: <ItemsList package={props.package} syncYaml={props.syncYaml}></ItemsList>,
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
        />
    );
}
