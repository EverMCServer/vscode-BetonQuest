import * as React from "react";
import { useEffect, useState } from "react";

import { vscode } from "./vscode";

import { ConfigProvider, Layout } from "antd";
// const { Content } = Layout;
import { YAMLError } from "yaml";

import { InitialConfig } from "../../conversationEditorProvider";
import Conversation from "../../betonquest/Conversation";

import ConversationEditor from "./components/ConversationEditor";
import YamlErrorPage from "../components/YamlErrorPage";

// Global variables from vscode
declare global {
    namespace conversationEditor {
        var initialConfig: InitialConfig;
    }
}

// Cache of the Package's YAML
let cachedYaml = "";

// Handler for delayed YAML update
let syncYamlTimeoutHandler: number;

export default function app() {
    // Get initial content data from vscode
    const [conversation, _setConversation] = useState(new Conversation({ yamlText: cachedYaml }));
    const [yamlErrors, setYamlErrors] = useState<YAMLError[]>();

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
                    if (message.content !== conversation) { // Avoid duplicated update
                        // Update Conversation
                        const p = new Conversation({ yamlText: message.content });
                        // Check if parse error
                        const e = p.getYamlErrors();
                        if (e?.length) {
                            setYamlErrors(e);
                            break;
                        }
                        setYamlErrors(undefined);
                        // Update Conversation
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

    // Collapsible Sider
    const [collapsed, setCollapsed] = useState(true);

    return (
        <ConfigProvider
            theme={{
                components: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    Layout: {
                        bodyBg: "",
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
                    <Layout style={{ display: "block" }}>
                        <ConversationEditor conversation={conversation} syncYaml={syncYaml} translationSelection={conversationEditor.initialConfig.translationSelection}></ConversationEditor>
                    </Layout>
                </Layout>
            }
        </ConfigProvider>
    );
}
