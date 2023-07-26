import * as React from "react";

import TestButton from './testbutton';
import TestView from './testview';

export default function app() {

    // get document's content from vscode
    const [yml, setDoc] = React.useState("");

    React.useEffect(()=>{
        // listen from extension message (document update etc)
        window.addEventListener('message', event => {
            const message = event.data; // JSON

            switch (message.type) {
                case 'update':
                    if (message.text !== yml) {
                        console.log("update yml ...\nyml was:", yml, "\ndoc now:", message.text);
                        setDoc(message.text);
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
