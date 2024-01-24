import * as React from "react";
import { useEffect, useState } from "react";

import { vscode } from "./vscode";

import { ConfigProvider, Layout } from "antd";
// const { Content } = Layout;
import { YAMLError } from "yaml";

import { InitialConfig } from "../../packageEditorProvider";
import Package from '../../betonquest/Package';

import ResizableSider from '../components/ResizableSider';
import Main from "./components/Main";
import Sider from "./components/Sider";
import YamlErrorPage from "../components/YamlErrorPage";
import { YamlPathPointer } from "../../utils/yamlPathPointer";

// Global variables from vscode
declare global {
    namespace packageEditor {
        var initialConfig: InitialConfig;
    }
}

// Cache of the Package's YAML
let cachedYaml = "";

// Handler for delayed YAML update
let syncYamlTimeoutHandler: number;

export default function app() {
    // Get initial content data from vscode
    const [pkg, _setPkg] = useState(new Package(cachedYaml));
    const [yamlErrors, setYamlErrors] = useState<YAMLError[]>();
    // const [translationSelection, setTranslationSelection] = useState(globalThis.initialConfig.translationSelection || "en");

    // Width of the sider
    const [siderWidth, setSiderWidth] = useState(document.body.scrollWidth / 3);

    // Prevent unnecessary rendering
    const setPkg = (newPkg: Package) => {
        const newYaml = newPkg.getYamlText();
        if (newYaml !== cachedYaml) {
            _setPkg(newPkg);
            cachedYaml = newYaml;
        }
    };

    // Get document's content update from vscode
    useEffect(() => {
        // Notify vscode when webview startup completed.
        vscode.postMessage({
            type: "webview-lifecycle",
            content: "started",
        });
        // Listen from extension message (document update etc)
        window.addEventListener('message', event => {
            const message = event.data; // JSON

            switch (message.type) {
                case 'update':
                    if (message.content !== pkg) { // Avoid duplicated update
                        // Update Package
                        const p = new Package(message.content);
                        // Check if parse error
                        const e = p.getYamlErrors();
                        if (e.length) {
                            setYamlErrors(e);
                            break;
                        }
                        setYamlErrors(undefined);
                        // Update Package
                        setPkg(p);
                        // Handle for initial document update
                        if (message.isInit) {
                            // Fully expand the sider if there is no conversation.
                            if (!p.getConversations().size) {
                                setSiderWidth(document.body.scrollWidth - 5);
                            }
                            // Pops out the sider if there are any events, conditions, objectives or items.
                            if (p.getAllEvents().length || p.getAllConditions().length || p.getAllObjectives().length || p.getAllItems().length) {
                                setCollapsed(false);
                            }
                        }
                        break;
                    }
                    break;
                case 'betonquest-translationSelection':
                // setTranslationSelection(message.content);
            }
        });
    }, []);

    // Sync package's YAML back to VSCode, delay in ms
    const syncYaml = (delay: number = 1000) => {
        // Prevent YAML update if it is still updating.
        window.clearTimeout(syncYamlTimeoutHandler);

        // Delayed YAML update.
        syncYamlTimeoutHandler = window.setTimeout(() => {
            // Update
            cachedYaml = pkg.getYamlText(); // Prevent duplicated update
            vscode.postMessage({
                type: "edit",
                content: cachedYaml,
            });
        }, delay);
    };

    // Collapsible Sider
    const [collapsed, setCollapsed] = useState(true);

    // Yaml's path pointer cache, to sync between components
    const [yamlPathPointer, setYamlPathPointer] = useState<string[]>([]);
    // Expand collapse if pointer refer to a event, condition, objective or item.
    useEffect(() => {
        if (yamlPathPointer.length > 1) {
            const pointer = yamlPathPointer[0];
            ["event", "condition", "objective", "item"].find(e => {
                if (pointer.toLowerCase().includes(e)) {
                    setCollapsed(false);
                }
            });
        }
    }, [yamlPathPointer]);

    return (
        <YamlPathPointer.Provider value={{ yamlPathPointer: yamlPathPointer, setYamlPathPointer: setYamlPathPointer }}>
            <ConfigProvider
                theme={{
                    components: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Layout: {
                            bodyBg: "",
                        },
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        Tabs: {
                            horizontalMargin: "0", // margin around tabs

                            cardBg: "var(--vscode-tab-inactiveBackground)", // un-selected tab bg
                            itemColor: "var(--vscode-tab-inactiveForeground)", // un-selected tab text color
                            itemActiveColor: "var(--vscode-tab-unfocusedActiveForeground)", // active tab text color
                            itemSelectedColor: "var(--vscode-tab-activeForeground)", // selected tab text color
                            itemHoverColor: "var(--vscode-tab-activeForeground)", // hover tab text color
                            cardGutter: 0, // gap between tabs
                            inkBarColor: "var(--vscode-editor-foreground)", // color of the line below the selected tab

                            // Global
                            colorText: "var(--vscode-tab-activeForeground)", // "+" and "..." button
                            colorBgContainer: "var(--vscode-tab-activeBackground)", // selected tab bg
                            colorTextDescription: "var(--vscode-disabledForeground)", // "delete" button
                            colorTextHeading: "var(--vscode-editor-foreground)", // "delete" button hover

                            borderRadius: 0, // tab radius
                            colorBorderSecondary: "transparent", // tab border color
                            // lineWidth: 0, // tab border width
                            borderRadiusLG: 0, // "add" button border radius
                        },
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
                            lineHeight: 1,
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
                {yamlErrors ? <YamlErrorPage yamlErrors={yamlErrors} vscode={vscode} /> :
                    <Layout
                        style={{
                            height: '100vh'
                        }}
                    >
                        <Layout>
                            <Main package={pkg} syncYaml={syncYaml}></Main>
                        </Layout>
                        <ResizableSider
                            width={siderWidth}
                            collapsedWidth={0}
                            trigger={<div>|||</div>}
                            zeroWidthTriggerStyle={{
                                width: "18px",
                                left: collapsed ? "-18px" : "-6px", // "-6px",
                                height: "40px",
                                margin: "-20px 0",
                                top: "50vh",
                                background: "var(--vscode-menu-separatorBackground)",
                                borderStartStartRadius: "0px",
                                borderStartEndRadius: "0px",
                                borderEndStartRadius: "0px",
                                borderEndEndRadius: "0px",
                                zIndex: "1000",
                            }}
                            style={{
                                background: "var(--vscode-sideBar-background)",
                                transitionDuration: "0s"
                            }}
                            collapsible
                            collapsed={collapsed}
                            onCollapse={(value) => setCollapsed(value)}
                        >
                            <Sider package={pkg} syncYaml={syncYaml}></Sider>
                        </ResizableSider>
                    </Layout>
                }
            </ConfigProvider>
        </YamlPathPointer.Provider>
    );
}
