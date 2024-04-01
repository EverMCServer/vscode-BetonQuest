import { CancellationToken, HandlerResult, Hover, HoverParams, MarkupContent, MarkupKind, ResultProgressReporter, ServerRequestHandler, WorkDoneProgressReporter } from "vscode-languageserver";
import { ASTs } from "../ast/ast";
import { AllDocuments } from "../utils/document";

export const hoverHandler = (allDocuments: AllDocuments, asts: ASTs, params: HoverParams, token: CancellationToken, workDoneProgress: WorkDoneProgressReporter, resultProgress?: ResultProgressReporter<never> | undefined): HandlerResult<Hover | null | undefined, void> => {
  const offset = allDocuments.getOffsetByPosition(params.textDocument.uri, params.position);
  const allAst = asts.getAllAstByDocumentUri(params.textDocument.uri);
  const hoverInfos = allAst.flatMap(ast => ast.getHoverInfo(params.textDocument.uri, offset));
  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: hoverInfos.join("\n\n---\n\n")
    },
    // range: {
    //   start: params.position,
    //   end: params.position
    // }
  };
};
