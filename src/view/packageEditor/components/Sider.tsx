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
                        colorIconHover: 'var(--vscode-list-hoverForeground)', // "clear" button color when hover
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
                        colorTextQuaternary: 'var(--vscode-input-placeholderForeground)', // suffix icon color
                        colorTextTertiary: 'var(--vscode-input-foreground)', // suffix icon color when hover
                        colorBgContainer: 'var(--vscode-input-background)',
                        colorBorder: 'var(--vscode-checkbox-border)',
                        borderRadius: 0,
                        borderRadiusLG: 0,
                        borderRadiusSM: 0,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Button: {
                        // See "style/vscodeButton.css"

                        // defaultColor: 'var(--vscode-button-foreground)', // text color of button
                        // defaultBg: 'var(--vscode-button-secondaryBackground)', // background color of button, secondary / default
                        // // ?: 'var(--vscode-button-secondaryHoverBackground)', // background color of button when hover, secondary / default
                        // defaultBorderColor: '', // border color, secondary / default
                        // colorPrimaryHover: '', // background color of primary button when hover, secondary / default button border+text color when hover

                        // // global
                        // lineWidth: 0, // all button border line width

                        // colorPrimary: 'var(--vscode-button-background)', // background color of button, primary
                        // colorPrimaryActive: 'var(--vscode-button-hoverBackground)', // text color of button when clicked, primary
                        // // colorPrimaryHover: 'var(--vscode-button-hoverBackground)', // background color of button when hover, primary
                        // // controlOutline: '', // primay button shadow
                        // primaryShadow: '', // primay button shadow

                        // // controlTmpOutline: '', // secondary / default button shadow
                        // defaultShadow: '', // secondary / default button shadow

                        // borderRadius: 2,
                        // borderRadiusLG: 2,
                        // borderRadiusSM: 2,

                        // colorPrimaryBorder: 'var(--vscode-focusBorder)', // focus outline border color
                        // lineWidthFocus: 1, // focus outline border width
                        // // ?: 10, // focus outline border offset
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Popover: {
                        // See "style/vscodePopover.css"
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
            ></Tabs>
        </ConfigProvider>
    );
}
