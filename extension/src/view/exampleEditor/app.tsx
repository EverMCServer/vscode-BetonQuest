import * as React from "react";
import { useEffect, useState } from "react";
import { ConfigProvider, Layout } from "antd";
import { YAMLError } from "yaml";
import { vscode } from "./vscode";

// test locale
import {setLocale} from '../../i18n/i18n';
import L from '../../i18n/i18n';

import List from "../../betonquest/List";
import ListElement, { ListElementType } from "../../betonquest/ListElement";

// // Global variables from vscode
// declare global {
//     var initialConfig: {
//         translationSelection?: string; // Conversation YAML's translation selection.
//         type?: ListElementType; // List's type e.g. "event".
//     };
// }

// Cache of the YAML
let cachedYaml = "";

// Handler for delayed YAML update
let syncYamlTimeoutHandler: number;

export default function app<T extends ListElement>() {

    // Get initial content data from vscode
    const [list, _setList] = useState(new List<T>(cachedYaml));
    const [yamlErrors, setYamlErrors] = useState<YAMLError[]>();

    // Width of the sider
    const [siderWidth, setSiderWidth] = useState(document.body.scrollWidth / 3);

    // Prevent unnecessary rendering
    const setList = (newList: List<T>) => {
        const newYaml = newList.getYamlText();
        if (newYaml !== cachedYaml) {
            _setList(newList);
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
                    // Update Package
                    const p = new List<T>(message.content);
                    // Check if parse error
                    const e = p.getYamlErrors();
                    if (e.length) {
                        setYamlErrors(e);
                        break;
                    }
                    setYamlErrors(undefined);
                    // Update Package
                    setList(p);
                    // Handle for initial document update
                    if (message.isInit) {
                        //
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
            cachedYaml = list.getYamlText(); // Prevent duplicated update
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
    
    return (
        <>
        <h1>Hello, World!</h1>
        <div>{"hi form tsx"}</div>
        {list.getAllListElements().map(e => <div>e.getName()</div>)}
        </>
    );
}
