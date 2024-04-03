import { CancellationToken, HandlerResult, Hover, HoverParams, MarkupKind, Range, ResultProgressReporter, WorkDoneProgressReporter } from "vscode-languageserver";
import { ASTs } from "../ast/ast";
import { AllDocuments } from "../utils/document";

export const hoverHandler = (allDocuments: AllDocuments, asts: ASTs, params: HoverParams, token: CancellationToken, workDoneProgress: WorkDoneProgressReporter, resultProgress?: ResultProgressReporter<never> | undefined): HandlerResult<Hover | null | undefined, void> => {
  // Get Hover infos from ASTs
  const offset = allDocuments.getOffsetByPosition(params.textDocument.uri, params.position);
  const allAst = asts.getAllAstByDocumentUri(params.textDocument.uri);
  const hoverInfos = allAst.flatMap(ast => ast.getHoverInfo(params.textDocument.uri, offset));

  // Concatnate hover infos
  const content = hoverInfos.map(i => i.content).join("\n\n---\n\n");
  if (!content) { return null; }

  // Get the most outer range
  const range = Range.create(params.position, params.position);
  hoverInfos.map(i => i.offset).forEach(o => {
    const r = allDocuments.getRangeByOffsets(params.textDocument.uri, o);
    if (r.start.line < range.start.line) {
      range.start = r.start;
    }
    if (r.start.character < range.start.character) {
      range.start = r.start;
    }
    if (r.end.line > range.end.line) {
      range.end = r.end;
    }
    if (r.end.character > range.end.character) {
      range.end = r.end;
    }
  });

  return {
    contents: {
      kind: MarkupKind.Markdown,
      value: content
    },
    range: range
  };
};
