import { FileType } from "vscode";
import { Connection, ResponseError, WorkspaceFolder } from "vscode-languageserver";

export function syncWorkspaces(connection: Connection, workspaceFolders: WorkspaceFolder[] | null | undefined) {
  // 1. get folders
  workspaceFolders?.forEach(async wsFolder => {
    try {
      // Get file tree
      let a = await connection.sendRequest<string[]>('custom/file/tree', {
        uriString: wsFolder.uri, //  + "/2.0"
        recursive: true,
        patten: "\.ya?ml$"
      });
      connection.console.log("file tree:\n" + a.join("\n"));

      // Get files
      let files = await connection.sendRequest<[string, Uint8Array][]>('custom/files', a);
      // files.forEach(([uri, buffer]) => {
      //   console.log("file: " + uri + " size: " + buffer.byteLength + " content: " + new TextDecoder().decode(buffer));
      //   // connection.console.log("file: " + uri + " size: " + buffer.byteLength + " content: " + new TextDecoder().decode(buffer));
      // });
      // connection.console.log("file tree:\n" + files.map(([uri, buffer]) => uri + ": " + new TextDecoder().decode(buffer)).join("\n\n"));

      connection.sendRequest<Uint8Array>('custom/file', workspaceFolders![0].uri + "/config.yml").then(
        buffer => {
          connection.console.log("response from " + workspaceFolders![0].uri + "/config.yml" + ": " + new TextDecoder().decode(buffer.buffer));
          // connection.console.log("response from " + workspaceFolders![0].uri + "/config.yml" + ": " + new TextDecoder().decode(new Uint8Array(buffer.length).set(buffer.buffer)));
          // connection.console.log("response from " + workspaceFolders![0].uri + "/config.yml" + ": " + Buffer.from(buffer.buffer).toString());
        },
        (reason: ResponseError<string>) => {
          if (reason.code === 404) {
            // TODO: remove from AST
          } else {
            connection.console.log("request failed: " + [reason.code, reason.data, reason.message].join("\n"));
          }
        }
      );
    } catch (e) {
      if (e instanceof ResponseError) {
        connection.console.log("request file tree failed: " + e);
      }
    };
    // 2. compare folders, which one is removed / new?
    // 3. drop / create new AST
  });
}
