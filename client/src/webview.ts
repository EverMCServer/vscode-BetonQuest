import * as vscode from 'vscode';

// Generate Webview content
export function getContent(webview: vscode.Webview, extensionUri: vscode.Uri, libraries: string[]): string {

    // get root.js url for React-JS
    const pathReactApp = vscode.Uri.joinPath(extensionUri, "client", "dist", "conditionsEditor.js");
    // get lib urls
    const pathLibs = libraries.map(lib => webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, "client", "dist", lib + '.js')));

    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Config View</title>

        <meta http-equiv="Content-Security-Policy"
            content="default-src 'none';
                    img-src ${webview.cspSource} https:;
                    script-src ${webview.cspSource} 'unsafe-eval' 'unsafe-inline';
                    style-src ${webview.cspSource} https: 'unsafe-inline';"
        />

        <script>
            window.vscode = acquireVsCodeApi();
        </script>
    </head>
    <body style="padding: 0px;">
        <div id="root">Loading...</div>

        ${pathLibs.map(lib => `<script src="${webview.asWebviewUri(lib)}"></script>`).join('\n')}
        <script src="${webview.asWebviewUri(pathReactApp)}"></script>
    </body>
    </html>`;
}