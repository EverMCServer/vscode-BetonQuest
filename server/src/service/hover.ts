import { CancellationToken, HandlerResult, Hover, HoverParams, ResultProgressReporter, ServerRequestHandler, WorkDoneProgressReporter } from "vscode-languageserver";
import { AST, ASTs } from "../ast/ast";

export const hoverHandler = (asts: ASTs, params: HoverParams, token: CancellationToken, workDoneProgress: WorkDoneProgressReporter, resultProgress?: ResultProgressReporter<never> | undefined): HandlerResult<Hover | null | undefined, void> => {
  params.textDocument.uri;
  // asts.find(([]) =>)
  return null;
};
