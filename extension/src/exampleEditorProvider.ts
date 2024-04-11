import * as vscode from 'vscode';
import { BaseLanguageClient } from 'vscode-languageclient/lib/common/client';

import findYamlNodeByOffset from 'betonquest-utils/yaml/findYamlNodeByOffset';
import findOffestByYamlNode from 'betonquest-utils/yaml/findOffestByYamlNode';
import { LocationsResponse, LocationsParams } from 'betonquest-utils/lsp/file';

interface InitialConfig {
    // translationSelection?: string,
}

export class ExampleEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext, lspClient: BaseLanguageClient): vscode.Disposable {
        const provider = new ExampleEditorProvider(context, lspClient);
        const providerRegistration = vscode.window.registerCustomEditorProvider(ExampleEditorProvider.viewType, provider);
        return providerRegistration;
    }

    private static readonly viewType = 'betonquest.exampleEditor';

    constructor(
        private readonly context: vscode.ExtensionContext,
        private readonly lspClient: BaseLanguageClient
    ) { }

    /**
     * Called when our custom editor is opened.
     * 
     * 
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {
        // Config Webview
        webviewPanel.webview.options = {
            enableScripts: true,
            // localResourceRoots: [
            //     vscode.Uri.joinPath(this.context.extensionUri, "webview", "dist") // see webpack.config.js for name
            // ]
        };

        // Initialize HTML content in Webview
        webviewPanel.webview.html = this.getWebviewContent(
            webviewPanel.webview,
            this.context.extensionUri,
            [
                "lib/react",
                "lib/react-dom",
                "lib/vendor", // All other node_modules
                "utils/betonquest", // BQ YAML models
                "utils/betonquest_v1", // Element Lists for BQ v1
                "utils/betonquest_v2", // Element Lists for BQ v2
                "utils/bukkit", // Bukkit API, Entity list etc
                "utils/i18n", // Translations
                "utils/ui_input", // UI components for Element List editing
                "utils/ui_style", // Style overrides for Ant Design components
                "utils/yaml", // YAML utilities
                "view/components", // Layout components for conversation eiting, includes Drawer, Sider etc
                "view/legacyListEditor", // Legacy Element List editor
                "view/conversationEditor", // Conversation editor
                "view/packageEditor", // Package editor
            ]);

        // Define a method to update Webview
        function sendDocumentToWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                content: document.getText()
            });
        }

        // Hook up event handlers so that we can synchronize the webview with the text document.
        //
        // The text document acts as our model, so we have to sync change in the document to our
        // editor and sync changes in the editor back to the document.
        // 
        // Remember that a single text document can also be shared between multiple custom
        // editors (this happens for example when you split a custom editor)

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                sendDocumentToWebview();
            }
        });

        const changeSelectionSubscription = vscode.window.onDidChangeTextEditorSelection(e => {
            if ((e.kind === vscode.TextEditorSelectionChangeKind.Keyboard ||
                e.kind === vscode.TextEditorSelectionChangeKind.Mouse) &&
                vscode.window.activeTextEditor &&
                e.textEditor.document.uri.toString() === document.uri.toString()) {
                let curPos = e.selections[0].active;
                let offset = e.textEditor.document.offsetAt(curPos);

                webviewPanel.webview.postMessage({
                    type: 'cursor-yaml-path',
                    content: findYamlNodeByOffset(offset, document.getText())
                });
            }
        });

        const changeTranslationSubscription = vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('betonquest.setting.translationSelection')) {
                console.log("sendding betonquest-translationSelection into webview ...");
                webviewPanel.webview.postMessage({
                    type: 'betonquest-translationSelection',
                    content: vscode.workspace.getConfiguration('betonquest.setting').get<string>('translationSelection')
                });
            }
        });

        // Receive message from the webview.
        const onDidReceiveMessage = webviewPanel.webview.onDidReceiveMessage(async e => {
            let offset: number | undefined;
            let jumpToDoc = document;
            switch (e.type) {
                case 'webview-lifecycle':
                    switch (e.content) {
                        case 'started':
                            // When the webview just started, send the initial document to webview.
                            sendDocumentToWebview();
                            return;
                    }

                case 'edit':
                    console.log(e.content);
                    // update editted yml
                    this.updateTextDocument(document, e.content);
                    return;

                case 'save':
                    console.log(document, e.id);
                    return;

                case 'test-from-webview':
                    console.log("received test message from webview to extension:");
                    console.log(e);
                    vscode.window.showInformationMessage("received test message from webview to extension: " + e.content);
                    return;

                case 'set-betonquest-translationSelection':
                    console.log("got betonquest-translationSelection from webview:", e.content);
                    vscode.workspace.getConfiguration('betonquest.setting').update('translationSelection', e.content, vscode.ConfigurationTarget.Global);
                    setTimeout(() => {
                        console.log("new betonquest-translationSelection:", vscode.workspace.getConfiguration('betonquest.setting').get<string>('translationSelection'));
                    }, 1000);

                // Move cursor on text editor.
                // @ts-ignore
                case 'cursor-yaml-path':
                    if (e.content.constructor === Array && e.content.length > 0) {
                        // Get document uri and position from lspClient
                        offset = 0;
                        const response = await this.lspClient.sendRequest<LocationsResponse>("custom/locations", { sourceUri: document.uri.toString(), yamlPath: e.content } as LocationsParams);
                        // TODO: handle multiple locations, e.g. prompt to select where to go
                        // if (response.length > 1) {
                        // } else
                        if (response.length > 0) {
                            offset = response[0].offset;
                            jumpToDoc = await vscode.workspace.openTextDocument(vscode.Uri.parse(response[0].uri));
                        } else {
                            return;
                        }
                    } else {
                        return;
                    }
                case 'cursor-position':
                    let curPos = jumpToDoc.positionAt(offset !== undefined ? offset : e.content);
                    if (e.activateDocuemnt) {
                        // Switch to the document if requested
                        let viewColumn = webviewPanel.viewColumn;
                        viewColumn = vscode.window.tabGroups.
                            all.flatMap(group => group.tabs).
                            find(tab => tab.group.viewColumn !== viewColumn && tab.label === jumpToDoc.fileName.split("/").slice(-1)[0])?.group.viewColumn
                            || vscode.window.tabGroups.all.map(group => group.viewColumn).find(v => v !== webviewPanel.viewColumn)
                            || webviewPanel.viewColumn;
                        vscode.window.showTextDocument(jumpToDoc.uri, { preview: false, viewColumn: viewColumn }).then(editor => {
                            // Set the cursor position and scroll to it.
                            editor.selections = [new vscode.Selection(curPos, curPos)];
                            editor.revealRange(new vscode.Range(curPos, curPos));
                        });
                    } else {
                        // Iterate all opened documents, set the cursor position.
                        for (const editor of vscode.window.visibleTextEditors) {
                            if (editor.document.uri.toString() === jumpToDoc.uri.toString()) {
                                editor.selections = [new vscode.Selection(curPos, curPos)];
                            }
                        }
                    }
                    return;
            }
        });

        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
            changeSelectionSubscription.dispose();
            changeTranslationSubscription.dispose();
            onDidReceiveMessage.dispose();
        });
    }

    // Function to edit vscode.document
    private updateTextDocument(document: vscode.TextDocument, content: string) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            content
        );
        vscode.workspace.applyEdit(edit);
    }

    // Initialize Webview content
    private getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri, libraries: string[], initialConfig?: InitialConfig): string {

        // get root.js url for React-JS
        const pathReactApp = vscode.Uri.joinPath(extensionUri, "webview", "dist", "exampleEditor.js");
        // get lib urls
        const pathLibs = libraries.map(lib => vscode.Uri.joinPath(extensionUri, "webview", "dist", lib + '.js'));

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Config View</title>

            <meta
                http-equiv="Content-Security-Policy"
                content="default-src 'none';
                img-src ${webview.cspSource} https:;
                script-src ${webview.cspSource} 'unsafe-eval' 'unsafe-inline';
                style-src ${webview.cspSource} https: 'unsafe-inline';"
            />

            <script>
                window.vscode = acquireVsCodeApi();
                window.locale = "${vscode.env.language}";
                window.exampleEditor = {
                    initialConfig: ${JSON.stringify(initialConfig)}
                };
            </script>
        </head>
        <body style="padding: 0px;">
            <div id="root">Loading...</div>

            ${pathLibs.map(lib => `<script src="${webview.asWebviewUri(lib)}"></script>`).join('\n')}
            <script src="${webview.asWebviewUri(pathReactApp)}"></script>
            <!--<script src="https://file%2B.vscode-resource.vscode-cdn.net/Users/kenneth/projects/vscode-webpack/dist/conversationeditor.js"></script>-->
        </body>
        </html>`;
    }
}
