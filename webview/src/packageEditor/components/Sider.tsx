import React, { useContext, useEffect, useState } from "react";
import Package from "betonquest-utils/betonquest/Package";
import { Tabs, Tooltip } from "antd";
import { PiPlayFill } from "react-icons/pi";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { LuSearchCheck, LuSword } from "react-icons/lu";

import L from "betonquest-utils/i18n/i18n";
import EventsList from "./Sider/EventsList";
import ConditionsList from "./Sider/ConditionsList";
import ObjectivesList from "./Sider/ObjectivesList";
import ItemsList from "./Sider/ItemsList";
import { YamlPathPointer } from "betonquest-utils/yaml/yamlPathPointer";

interface ListEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function sider(props: ListEditorProps) {

    // Tab items
    const items = [
        {
            key: "events",
            label: <Tooltip placement="bottomRight" title={L("packageEditor.sider.events")}><PiPlayFill /></Tooltip>,
            children: <EventsList package={props.package} syncYaml={props.syncYaml}></EventsList>,
            style: {
                height: "calc(100% - 21.1px)"
                // overflowY: "auto",
                // height: "inherit"
            },
        },
        {
            key: "conditions",
            label: <Tooltip placement="bottom" title={L("packageEditor.sider.conditions")}><AiOutlineQuestionCircle /></Tooltip>,
            children: <ConditionsList package={props.package} syncYaml={props.syncYaml}></ConditionsList>,
            style: {
                height: "calc(100% - 21.1px)"
            }
        },
        {
            key: "objectives",
            label: <Tooltip placement="bottom" title={L("packageEditor.sider.objectives")}><LuSearchCheck /></Tooltip>,
            children: <ObjectivesList package={props.package} syncYaml={props.syncYaml}></ObjectivesList>,
            style: {
                height: "calc(100% - 21.1px)"
            }
        },
        {
            key: "items",
            label: <Tooltip placement="bottom" title={L("packageEditor.sider.items")}><LuSword /></Tooltip>,
            children: <ItemsList package={props.package} syncYaml={props.syncYaml}></ItemsList>,
            style: {
                height: "calc(100% - 21.1px)"
            }
        },
    ];

    // Handle tab switch
    const [tabsActiveKey, setTabsActiveKey] = useState<string>();
    const onTabsChange = (key: string) => {
        setTabsActiveKey(key);
    };

    // Switch tab for pointer changed
    const { editorPathPointer } = useContext(YamlPathPointer);
    useEffect(() => {
        if (editorPathPointer.length > 1) {
            items.map(e => e.key).find(e => {
                if (e === editorPathPointer[0]) {
                    setTabsActiveKey(e);
                }
            });
        }
    }, [editorPathPointer]);

    return (
        <Tabs
            type="line"
            // type="card"
            onChange={onTabsChange}
            destroyInactiveTabPane={false}
            activeKey={tabsActiveKey}
            // onEdit={onTabsEdit}
            // items={tabsItems}
            items={items}
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
