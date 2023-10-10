import { WebviewApi } from "vscode-webview";

declare global {
    interface Window {
        vscode: WebviewApi<unknown>;
    }
}

export const vscode = window.vscode;