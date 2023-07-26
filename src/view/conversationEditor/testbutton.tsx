import * as React from "react";
import { WebviewApi } from "vscode-webview";

interface TestButtonProps {
    test?: string;
    vscode?: WebviewApi<unknown>;
}

// export default function testButton(vscode: undefined) {
export default function testButton({
    test, vscode
}: TestButtonProps) {

    return (
        <>
        <script>
        {/* (function() {}), 100);
        }()) */}
        </script>
        <button onClick={()=>{onClick(vscode!);}}>Send message from React to VSCode</button>
        </>
    );
}

function onClick(vscode: WebviewApi<unknown>) {
    console.log("button clicked");
    vscode.postMessage({
        type: "test-from-webview",
        message: "hi"
    });
}