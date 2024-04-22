import { Diagnostic } from "vscode-languageserver";

export interface ReducedCodeAction {
  title: string,
  kind?: string,
  diagnostics?: Diagnostic[],
  edits: ReducedTextEdit[],
};

interface ReducedTextEdit {
  offsetStart: number,
  offsetEnd: number,
  newText: string
}
