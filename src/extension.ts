import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	const betonQuestFolder = vscode.workspace.workspaceFolders?.find(folder => 
        folder.name.toLowerCase() === 'betonquest'
    );
	if (!betonQuestFolder) {
		console.log('BetonQuest is noooooot active!');
		return;
	}
	console.log('BetonQuest is active!');

	createWebview();
}

async function createWebview() {
    const panel = vscode.window.createWebviewPanel(
        'BetonQuestWebview',
        'BetonQuest',
        vscode.ViewColumn.Two,
        {
            enableScripts: true
        }
    );

    const files = await getFiles();
    panel.webview.html = getWebviewContent(files);
}

async function getFiles() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
        return [];
    }

    const workspaceFolder = workspaceFolders[0];
    const uri = workspaceFolder.uri;
    const files: string[] = [];
    const readDirectory = async (uri: vscode.Uri) => {
        const entries = await vscode.workspace.fs.readDirectory(uri);
        for (const [entry, type] of entries) {
            const entryUri = vscode.Uri.joinPath(uri, entry);
            if (type === vscode.FileType.Directory) {
                await readDirectory(entryUri);
            } else if (type === vscode.FileType.File) {
                files.push(entryUri.path);
            }
        }
    };

    await readDirectory(uri);
    return files;
}

function getWebviewContent(files: string[]) {
    return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Webview</title>
        </head>
        <body>
            <ul>
                ${files.map(file => `<li>${file}</li>`).join('')}
            </ul>
        </body>
        </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
