import * as React from "react";
import { WebviewApi } from "vscode-webview";

import TestButton from './testbutton';
import TestView from './testview';

interface AppProps {
    test?: string;
    vscode?: WebviewApi<unknown>;
}

export default function app({vscode}: AppProps) {
    
    return (
        <>
        <h1>Hello, World!</h1>
        <div>{"hi form tsx"}</div>
        <TestButton vscode={vscode}/>
        {/* <TestButton test={"hi"}/> */}
        <TestView />
        </>
    );
}
