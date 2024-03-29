import { CancellationToken, HandlerResult, Hover, HoverParams, MarkupContent, MarkupKind, ResultProgressReporter, ServerRequestHandler, WorkDoneProgressReporter } from "vscode-languageserver";
import { ASTs } from "../ast/ast";

export const hoverHandler = (asts: ASTs, params: HoverParams, token: CancellationToken, workDoneProgress: WorkDoneProgressReporter, resultProgress?: ResultProgressReporter<never> | undefined): HandlerResult<Hover | null | undefined, void> => {
  const allAst = asts.getAllAstByDocumentUri(params.textDocument.uri);
  const hoverInfos = allAst.flatMap(ast => ast.getHover(params.textDocument.uri, params.position));
  return {
    contents: {
      kind: MarkupKind.PlainText,
      value: hoverInfos.join('\n')
    },
    // range: {
    //   start: params.position,
    //   end: params.position
    // }
  };
};
