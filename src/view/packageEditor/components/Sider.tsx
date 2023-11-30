import React from "react";
import Package from "../../../betonquest/Package";
import { ConfigProvider, Tabs } from "antd";
import { PiPlayFill } from "react-icons/pi";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import { LuSearchCheck, LuSword } from "react-icons/lu";

import EventsList from "./Sider/EventsList";
import ConditionsList from "./Sider/ConditionsList";
import ObjectivesList from "./Sider/ObjectivesList";
import ItemsList from "./Sider/ItemsList";

interface ListEditorProps {
    package: Package,
    syncYaml: Function,
}

export default function sider(props: ListEditorProps) {

    return (
        <ConfigProvider
            theme={{
                components: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Collapse: {
                        headerBg: 'var(--vscode-sideBarSectionHeader-background)',
                        contentBg: 'var(--vscode-sideBar-dropBackground)',
                        headerPadding: 2,
                        contentPadding: 0,
                        borderRadiusLG: 0,

                        // global
                        colorBorder: 'var(--vscode-sideBarSectionHeader-border)',
                        lineWidth: 1, // border line width
                        colorText: '', // content default color of text
                        colorTextHeading: 'var(--vscode-sideBarTitle-foreground)', // heading color of text
                        marginSM: 12, // left margin of header text
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Select: {
                        // selectorBg: 'var(--vscode-input-background)', // = colorBgContainer
                        // optionSelectedBg: 'var(--vscode-list-activeSelectionBackground)', // = controlItemBgActive
                        optionSelectedColor: 'var(--vscode-list-activeSelectionForeground)', // text color of selected item
                        // optionActiveBg: 'var(--vscode-list-hoverBackground)', // = controlItemBgHover

                        // global
                        colorBgContainer: 'var(--vscode-input-background)', // background color of input box
                        colorBgContainerDisabled: 'var(--vscode-input-background)', // background color of input box when disabled
                        colorBgElevated: 'var(--vscode-input-background)', // background color of drop-down box
                        controlItemBgActive: 'var(--vscode-list-activeSelectionBackground)', // background color of active item = optionSelectedBg
                        controlItemBgHover: 'var(--vscode-list-hoverBackground)', // background color of hover item
                        colorText: 'var(--vscode-input-foreground)',
                        colorTextPlaceholder: 'var(--vscode-input-placeholderForeground)',
                        colorTextQuaternary: 'var(--vscode-input-placeholderForeground)', // suffix icon "down arrow" color
                        colorIcon: 'var(--vscode-input-placeholderForeground)', // "clear" button color
                        colorIconHover: 'var(--vscode-list-hoverForeground)', // "clear" button color when hovering
                        colorBorder: 'var(--vscode-checkbox-border)', // border color
                        colorPrimary: 'var(--vscode-focusBorder)', // active / focus border color
                        colorPrimaryHover: 'var(--vscode-input-foreground)', // hover color border
                        borderRadius: 0,
                        borderRadiusLG: 0,
                        borderRadiusSM: 0,
                        borderRadiusXS: 0,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Input: {
                        activeBorderColor: 'var(--vscode-focusBorder)',
                        hoverBorderColor: 'var(--vscode-input-foreground)',

                        // global
                        colorText: 'var(--vscode-input-foreground)',
                        colorTextPlaceholder: 'var(--vscode-input-placeholderForeground)',
                        colorBgContainer: 'var(--vscode-input-background)',
                        colorBorder: 'var(--vscode-checkbox-border)',
                        borderRadius: 0,
                        borderRadiusLG: 0,
                        borderRadiusSM: 0,
                    },
                },
            }}
        >
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
                        children: <EventsList package={props.package} syncYaml={props.syncYaml}></EventsList>,
                        style: {
                            height: "calc(100% - 20px)"
                            // overflowY: "auto",
                            // height: "inherit"
                        },
                    },
                    {
                        key: "Conditions",
                        label: <div title="Conditions"><AiOutlineQuestionCircle /></div>,
                        children: <ConditionsList package={props.package} syncYaml={props.syncYaml}></ConditionsList>,
                        style: {
                            height: "calc(100% - 20px)"
                        },
                    },
                    {
                        key: "Objectives",
                        label: <div title="Objectives"><LuSearchCheck /></div>,
                        children: <ObjectivesList package={props.package} syncYaml={props.syncYaml}></ObjectivesList>,
                        style: {
                            height: "calc(100% - 20px)"
                        },
                    },
                    {
                        key: "Items",
                        label: <div title="Items"><LuSword /></div>,
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
            ></Tabs>
        </ConfigProvider>
    );
}
