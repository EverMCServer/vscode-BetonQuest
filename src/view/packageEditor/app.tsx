import * as React from "react";
import { useEffect, useState } from "react";

import { vscode } from "./vscode";

// test locale
import { setLocale } from '../../i18n/i18n';
import L from '../../i18n/i18n';

import { ConfigProvider, Layout } from "antd";
// const { Content } = Layout;
import { YAMLError } from "yaml";

import { InitialConfig } from "../../packageEditorProvider";
import Package from '../../betonquest/Package';

import ResizableSider from '../components/ResizableSider';
import Main from "./components/Main";
import Sider from "./components/Sider";
import YamlErrorPage from "../components/YamlErrorPage";

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
        // Set language
        setLocale(packageEditor.initialConfig.locale || "en");
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
                                setSiderWidth(document.body.scrollWidth-5);
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

    // // Test i18n
    // console.log(L("1"));
    // console.log(setLocale("zh-CN"));
    // console.log(L("1"));

    // Collapsible Sider
    const [collapsed, setCollapsed] = useState(true);

    return (
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
                    }
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
    );
}
