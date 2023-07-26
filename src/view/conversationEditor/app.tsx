import * as React from "react";

import TestButton from './testbutton';
import TestView from './testview';

declare global {
    // acquireVsCodeApi(): WebviewApi<unknown>;
    var initialData: string;
}

export default function app() {

    // get initial content data from vscode
    const [yml, setYml] = React.useState(window.globalThis.initialData);

    console.log("initDate:", yml);

    // get document's content update from vscode
    React.useEffect(()=>{
        // listen from extension message (document update etc)
        window.addEventListener('message', event => {
            const message = event.data; // JSON

            switch (message.type) {
                case 'update':
                    if (message.text !== yml) {
                        console.log("update yml ...\nyml was:", yml, "\ndoc now:", message.text);
                        setYml(message.text);
                        break;
                    }
                    console.log("nothing changed ...\nyml:", yml, "\ndoc now:", message.text);
                    break;
            }
        });
    }, []);

    console.log("from app.tsx");
    
    return (
        <>
        <h1>Hello, World!</h1>
        <div>{"hi form tsx"}</div>
        <TestButton yml={yml} />
        <TestView yml={yml} />
        </>
    );
}
