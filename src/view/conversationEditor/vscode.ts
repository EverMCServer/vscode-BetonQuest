import { WebviewApi } from "vscode-webview";

export const vscode : WebviewApi<unknown> = window.acquireVsCodeApi();
