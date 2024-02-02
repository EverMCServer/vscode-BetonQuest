import { Connection } from 'vscode-languageserver';

export function server(connection: Connection): void {
  connection.console.log("hello from lsp server! connection.console.log");
  console.log("hello from lsp server! console.log");
};
