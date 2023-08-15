import * as vscode from 'vscode';

interface InitialConfig {
    translationSelection?: string,
}

export class ConversationEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new ConversationEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(ConversationEditorProvider.viewType, provider);
		return providerRegistration;
    }

    private static readonly viewType = 'betonquest.conversationEditor';

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
        webviewPanel.webview.html = this.getWebviewContent(
            webviewPanel.webview,
            {
                translationSelection: vscode.workspace.getConfiguration('betonquest.setting').get<string>('translationSelection'),
            },
            document,
        );

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

        let timeoutHandler: NodeJS.Timeout; // Use timeout to avoid frenquent update / flowchart flickering
        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document.uri.toString() === document.uri.toString()) {
                clearTimeout(timeoutHandler);
                if (e.reason === 1 || 2) {
                    // If docuemnt is changed by undo / redo, it should be updated immediately
				sendDocumentToWebview();
                } else {
                    timeoutHandler = setTimeout(()=>{
                        sendDocumentToWebview();
                    }, 1000);
                }
			}
		});

        // Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
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

                // Update translation selction configuration.
                case 'set-betonquest-translationSelection':
                    console.log("got betonquest-translationSelection from webview:", e.content);
                    vscode.workspace.getConfiguration('betonquest.setting').update('translationSelection', e.content, vscode.ConfigurationTarget.Global);
                    // setTimeout(() => {
                        console.log("new betonquest-translationSelection:", vscode.workspace.getConfiguration('betonquest.setting').get<string>('translationSelection'));
                    // }, 1000);
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
    private getWebviewContent(webview: vscode.Webview, initialConfig: InitialConfig, document: vscode.TextDocument): string {

        // get root.js url for React-JS
        const reactAppPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, "dist", "conversationEditor.js");

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
                window.initialConfig = ${JSON.stringify(initialConfig)};
            </script>
        </head>
        <body>
            <div id="root"></div>
    
            <script src="${webview.asWebviewUri(reactAppPathOnDisk)}"></script>
        </body>
        </html>`;
    }
}
