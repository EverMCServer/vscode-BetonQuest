import * as React from "react";

import { vscode } from "./vscode";

// test locale
import {setLocale} from '../../i18n/i18n';
import L from '../../i18n/i18n';
import { useEffect, useState } from "react";

import { Layout } from "antd";
// const { Content, Sider } = Layout;

import ResizableSider from '../components/ResizableSider';

export default function app() {

    // Get initial content data from vscode
    const [yml, setYml] = React.useState("");
    // const [translationSelection, setTranslationSelection] = React.useState("");

    console.log("initialize yml Data.");

    // Get document's content update from vscode
    React.useEffect(()=>{
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
                    if (message.content !== yml) { // Avoid duplicated update
                        console.log("update yml ...");
                        setYml(message.content);
                        break;
                    }
                    console.log("update yml ... nothing changed.");
                    break;
                case 'betonquest-translationSelection':
                    console.log("update betonquest's translation selection ...");
                    // setTranslationSelection(message.content);
            }
        });
    }, []);

    // Test i18n
    console.log(L("1"));
    console.log(setLocale("zh-CN"));
    console.log(L("1"));

    // Collapsible Sider
    
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
        <Layout
            style={{ minHeight: '100vh' }}
        >
            <Layout>content</Layout>
            {/* <Sider
                collapsedWidth={0}
                trigger={<div>||</div>}
                zeroWidthTriggerStyle={{
                    width: "10px",
                    left: "-10px",
                    height: "40",
                    margin: "-20px 0",
                    top: "50vh",
                    borderStartStartRadius: "6px",
                    borderStartEndRadius: "0px",
                    borderEndStartRadius: "6px",
                    borderEndEndRadius: "0px",
                }}
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
            >
                sider
            </Sider> */}
            <ResizableSider
                collapsedWidth={0}
                trigger={<div>||</div>}
                zeroWidthTriggerStyle={{
                    width: "10px",
                    left: "-10px",
                    height: "40",
                    margin: "-20px 0",
                    top: "50vh",
                    borderStartStartRadius: "6px",
                    borderStartEndRadius: "0px",
                    borderEndStartRadius: "6px",
                    borderEndEndRadius: "0px",
                }}
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
            >
                sider
            </ResizableSider>
        </Layout>
        </>
    );
}
