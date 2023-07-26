import * as vscode from 'vscode';

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
        // config Webview
        webviewPanel.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, "dist") // see webpack.config.js for name
            ]
        };

        // fill html into Webview
        webviewPanel.webview.html = this.getWebviewContent(webviewPanel.webview, document);

        // Define a method to update Webview
        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText()
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
				updateWebview();
			}
		});

        // Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
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
                    vscode.window.showInformationMessage("received test message from webview to extension: " + e.message);
                    return;
			}
		});

		updateWebview();
    }

    // function to edit vscode.document
    private updateTextDocument(document: vscode.TextDocument, content: string) {
        const edit = new vscode.WorkspaceEdit();
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            content
        );
        vscode.workspace.applyEdit(edit);
    }

    // render html content
    private getWebviewContent(webview: vscode.Webview, document: vscode.TextDocument): string {

        // get root.js url for React-JS
        const reactAppPathOnDisk = vscode.Uri.joinPath(this.context.extensionUri, "dist", "conversationEditor.js");

        let initialData = document.getText().replace("\`", "\\\`");
        
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
              window.globalThis.initialData = \`${initialData}\`;
            </script>
        </head>
        <body>
            <div id="root"></div>
    
            <script src="${webview.asWebviewUri(reactAppPathOnDisk)}"></script>
            <!--<script src="https://file%2B.vscode-resource.vscode-cdn.net/Users/kenneth/projects/vscode-webpack/dist/conversationeditor.js"></script>-->
        </body>
        </html>`;
    }
}
