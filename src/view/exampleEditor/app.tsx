import * as React from "react";

import TestButton from './testbutton';
import TestView from './testview';
import { vscode } from "./vscode";

// test locale
import {setLocale} from '../../i18n/i18n';
import L from '../../i18n/i18n';

export default function app() {

    // Get initial content data from vscode
    const [yml, setYml] = React.useState("");

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
        <h1>Hello, World!</h1>
        <div>{"hi form tsx"}</div>
        <TestButton yml={yml} />
        <TestView yml={yml} />
        </>
    );
}
