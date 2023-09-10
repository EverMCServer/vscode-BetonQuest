import * as React from "react";
import { useEffect, useState } from "react";

import { vscode } from "./vscode";

// test locale
import {setLocale} from '../../i18n/i18n';
import L from '../../i18n/i18n';

import { ConfigProvider, Layout } from "antd";
// const { Content } = Layout;

import Package from '../../betonquest/Package';

import ResizableSider from '../components/ResizableSider';
import Main from "./components/Main";
import ListEditor from "./components/ListEditor";

// Global variables from vscode
declare global {
    var initialConfig: {
        // yamlText?: string,
        translationSelection?: string; // Conversation YAML's translation selection.
    };
}

// Cache of the Package's yaml.
let cachedYaml = "";

export default function app() {
    // Get initial content data from vscode
    const [pkg, _setPkg] = React.useState(new Package(cachedYaml));
    // const [translationSelection, setTranslationSelection] = React.useState(globalThis.initialConfig.translationSelection || "en");

    // Prevent unnecessary rendering
    const setPkg = (newPkg: Package) => {
        const newYaml = newPkg.getYamlText();
        if (newYaml !== cachedYaml) {
            console.log("newPkg:", newYaml);
            console.log("oldPkg:", cachedYaml);
            _setPkg(newPkg);
            cachedYaml = newYaml;
        }
    };

    // Get document's content update from vscode
    useEffect(()=>{
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
                        const p = new Package(message.content);
                        console.log("update pkg ...", p);
                        setPkg(p);
                        break;
                    }
                    console.log("update pkg ... nothing changed.");
                    break;
                case 'betonquest-translationSelection':
                    console.log("update betonquest's translation selection ...");
                    // setTranslationSelection(message.content);
            }
        });
    }, []);

    // Sync package's yaml back to VSCode
    const syncYaml = () => {
        cachedYaml = pkg.getYamlText(); // Prevent duplicated update
        vscode.postMessage({
            type: "edit",
            content: cachedYaml,
        });
    };

    // Test i18n
    console.log(L("1"));
    console.log(setLocale("zh-CN"));
    console.log(L("1"));

    // Collapsible Sider
    const [collapsed, setCollapsed] = useState(false);

    console.log("pkg:", pkg);

    return (
    <ConfigProvider
        theme={{
            components: {
                Layout: {
                    colorBgBody: "",
                }
            },
        }}
    >
        <Layout
            style={{
                minHeight: '100vh'
            }}
        >
            <Layout>
                <Main package={pkg} syncYaml={syncYaml}></Main>
            </Layout>
            <ResizableSider
                width={document.body.scrollWidth/3}
                collapsedWidth={0}
                trigger={<div>||</div>}
                zeroWidthTriggerStyle={{
                    width: "10px",
                    left: "-10px",
                    height: "40",
                    margin: "-20px 0",
                    top: "50vh",
                    background: "var(--vscode-menu-separatorBackground)",
                    borderStartStartRadius: "3px",
                    borderStartEndRadius: "0px",
                    borderEndStartRadius: "3px",
                    borderEndEndRadius: "0px",
                }}
                style={{
                    background: "var(--vscode-sideBar-background)",
                }}
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
            >
                <ListEditor package={pkg} syncYaml={syncYaml}></ListEditor>
            </ResizableSider>
        </Layout>
    </ConfigProvider>
    );
}
