import * as React from "react";

import { vscode } from "./vscode";

// test locale
import {setLocale} from '../../i18n/i18n';
import L from '../../i18n/i18n';

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

    console.log("from app.tsx");

    // Test i18n
    console.log(L("1"));
    console.log(setLocale("zh-CN"));
    console.log(L("1"));
    
    return (
        <>
        <h1>Hello, World! from a Package Editor</h1>
        <div>{"hi form tsx"}</div>
        <div>{yml}</div>
        </>
    );
}
