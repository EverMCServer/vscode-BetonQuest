import * as vscode from 'vscode';
import { BaseLanguageClient } from 'vscode-languageclient/lib/common/client';
import { PackageEntriesParams, PackageEntriesResponse } from 'betonquest-utils/lsp/file';

export type PackageEntryType = 'conditions' | 'events';

export async function handlePackageEntriesRequest(
    lspClient: BaseLanguageClient,
    webview: vscode.Webview,
    sourceUri: string,
    packagePath: string | undefined,
    entryType: PackageEntryType
): Promise<void> {
    const methodName = entryType === 'conditions' ? 'custom/packageConditions' : 'custom/packageEvents';
    const responseType = `response-package-${entryType}`;

    const response = await lspClient.sendRequest<PackageEntriesResponse>(
        methodName,
        {
            sourceUri,
            packagePath,
        } as PackageEntriesParams
    );

    webview.postMessage({
        type: responseType,
        names: response.names,
    });
}
