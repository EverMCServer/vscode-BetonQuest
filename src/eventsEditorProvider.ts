import * as vscode from 'vscode';

export class EventsEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new EventsEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(EventsEditorProvider.viewType, provider);
		return providerRegistration;
    }

    private static readonly viewType = 'betonquest.eventsEditor';

    constructor(
		private readonly context: vscode.ExtensionContext
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
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, "dist") // see webpack.config.js for name
            ]
        };

        // Initialize HTML content in Webview
        webviewPanel.webview.html = this.getWebviewContent(webviewPanel.webview, document);

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

        const onDidChangeTextEditorSelection = vscode.window.onDidChangeTextEditorSelection(e => {
            if (e && e.textEditor.document.fileName.endsWith("events.yml")) {
                let curPos = e.selections[0].active;
                let offset = e.textEditor.document.offsetAt(curPos);
                console.log("\ncurPos: ", curPos, "\noffset: ", offset);
                
                webviewPanel.webview.postMessage({
                    type: 'curPos',
                    content: curPos
                });
			}
        });

        // Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
            onDidChangeTextEditorSelection.dispose();
		});

        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('betonquest.setting.translationSelection')) {
                console.log("sendding betonquest-translationSelection into webview ...");
                webviewPanel.webview.postMessage({
                    type: 'betonquest-translationSelection',
                    content: vscode.workspace.getConfiguration('betonquest.setting').get<string>('translationSelection')
                });
            }
        });

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
                case 'webview-lifecycle':
                    switch (e.content) {
                        case 'started':
                            // When the webview just started, send the initial document to webview.
                            sendDocumentToWebview();
                            return;
                    }
                    return;

				case 'edit':
                    console.log("received update editted yml ...");
                    // update editted yml
                    this.updateTextDocument(document, e.content);
					return;
			}
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
    private getWebviewContent(webview: vscode.Webview, document: vscode.TextDocument): string {

        // get root.js url for React-JS
        const reactAppPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, "dist", "eventsEditor.js");

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
              window.acquireVsCodeApi = acquireVsCodeApi;
            </script>
        </head>
        <body>
            <div id="root"></div>
    
            <script src="${webview.asWebviewUri(reactAppPathOnDisk)}"></script>
        </body>
        </html>`;
    }
}
