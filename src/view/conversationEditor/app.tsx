import * as React from "react";
import { useEffect, useState } from "react";

import { vscode } from "./vscode";

// test locale
import { setLocale } from '../../i18n/i18n';
import L from '../../i18n/i18n';

import { ConfigProvider, Layout } from "antd";
// const { Content } = Layout;

import Conversation from "../../betonquest/Conversation";
import ConversationEditor from "./components/ConversationEditor";

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
    const [conversation, _setConversation] = useState(new Conversation({yamlText: cachedYaml}));

    // Prevent unnecessary rendering
    const setConversation = (newConversation: Conversation) => {
        const newYaml = newConversation.getYamlText();
        if (newYaml !== cachedYaml) {
            _setConversation(newConversation);
            cachedYaml = newYaml;
        }
    };

    // Get document's content update from vscode when init
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
                    console.log("1");
                    if (message.content !== conversation) { // Avoid duplicated update
                        // Update Conversation
                        const p = new Conversation({yamlText: message.content});
                        setConversation(p);
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
            cachedYaml = conversation.getYamlText(); // Prevent duplicated update
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
                    }
                },
            }}
        >
            <Layout
                style={{
                    height: '100vh'
                }}
            >
                <Layout style={{ display: "block" }}>
                    <ConversationEditor conversation={conversation} syncYaml={syncYaml}></ConversationEditor>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
