import * as React from "react";
import { vscode } from "./vscode";

interface TestButtonProps {
    yml: string;
    translationSelection: string; // BetonQuest's "Translation" setting
}

// export default function testButton(vscode: undefined) {
export default function testButton({yml, translationSelection: translationSelection} : TestButtonProps) {

    let updatedYml:string = yml!;
    updatedYml = "# test\n\n" + updatedYml;

    let languageOptions = ["en", "es", "pl", "fr", "cn", "de", "nl", "hu"];

    return (
        <>
        <script>
        </script>
        {/* test Betonquest Translation Selection */}
        <div>betonquestTranslation: {translationSelection}</div>
        <select value={translationSelection} onChange={e => setBetonquestTranslation(e.target.value)}>
            {languageOptions.map(o => (<option key={o} value={o}>{o}</option>))}
        </select>
        {/* test send message to vscode */}
        <button onClick={()=>{sendMsgToVscode("test-from-webview", "hi");}}>Send message from React to VSCode</button>
        {/* update editted yml file to vscode */}
        <button onClick={()=>{sendMsgToVscode("edit", updatedYml);}}>Update file</button>
        </>
    );
}

function sendMsgToVscode( type: string, content: string) {
    console.log("button clicked");
    vscode.postMessage({
        type: type,
        content: content
    });
}

function setBetonquestTranslation(translation: string) {
    // push setting to vscode
    console.log("button clicked");
    vscode.postMessage({
        type: "set-betonquest-translationSelection",
        content: translation,
    });
}
