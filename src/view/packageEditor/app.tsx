import * as React from "react";
import { useEffect, useState } from "react";

import { vscode } from "./vscode";
import { YAMLError } from "yaml";

// test locale
import { setLocale } from '../../i18n/i18n';
import L from '../../i18n/i18n';

import { ConfigProvider, Layout } from "antd";
// const { Content } = Layout;

import Package from '../../betonquest/Package';

import ResizableSider from '../components/ResizableSider';
import Main from "./components/Main";
import ListEditor from "./components/ListEditor";
import YamlErrorPage from "./components/YamlErrorPage";

// Global variables from vscode
declare global {
    var initialConfig: {
        translationSelection?: string; // Conversation YAML's translation selection.
    };
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
        // notify vscode when webview startup completed.
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
                        console.log("debug");
                        if (e.length) {
                            setYamlErrors(e);
                            break;
                        }
                        setYamlErrors(undefined);
                        setPkg(p);
                        // Handle for initial document update
                        if (message.isInit) {
                            if (!p.getConversations().size) {
                                setSiderWidth(document.body.scrollWidth);
                            } else if (!p.getAllEvents().length && !p.getAllConditions().length && !p.getAllObjectives().length && !p.getAllItems().length) {
                                setCollapsed(true);
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
                    Layout: {
                        colorBgBody: "",
                    },
                    Tabs: {
                        horizontalMargin: "0", // margin around tabs

                        cardBg: "var(--vscode-tab-inactiveBackground)", // un-selected bg
                        itemActiveColor: "var(--vscode-editor-foreground)", // selection click
                        itemSelectedColor: "var(--vscode-editor-foreground)", // selected tab
                        itemHoverColor: "var(--vscode-editor-foreground)", // hover
                        cardGutter: 0, // gap between tabs

                        // Global
                        colorText: "var(--vscode-editor-foreground)", // un-selected tab text & contents text
                        colorBgContainer: "var(--vscode-tab-activeBackground)", // selected tab bg
                        colorTextDescription: "var(--vscode-disabledForeground)", // "delete" button
                        colorTextHeading: "var(--vscode-editor-foreground)", // "delete" button hover
                        colorPrimary: "var(--vscode-editor-foreground)", // color of the line below the selected tab

                        borderRadius: 0, // tab radius
                        colorBorderSecondary: "transparent", // tab border color
                        // lineWidth: 0, // tab border width
                        borderRadiusLG: 0, // "add" button border radius
                    }
                },
            }}
        >
            {yamlErrors ? <YamlErrorPage yamlErrors={yamlErrors} /> :
                <Layout
                    style={{
                        height: '100vh'
                    }}
                >
                    <Layout>
                        <Main package={pkg} syncYaml={syncYaml}></Main>
                    </Layout>
                    {/* <ResizableSider
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
                        }}
                        collapsible
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}
                    >
                        <ListEditor package={pkg} syncYaml={syncYaml}></ListEditor>
                    </ResizableSider> */}
                </Layout>
            }
        </ConfigProvider>
    );
}
