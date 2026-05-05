import { PackageEntriesParams, PackageEntriesResponse } from "betonquest-utils/lsp/file";
import { HandlerResult } from "vscode-languageserver";
import { ASTs } from "../ast/ast";

export const packageEventsHandler = (asts: ASTs, params: PackageEntriesParams): HandlerResult<PackageEntriesResponse, void> => {
  return {
    names: asts.getPackageEventNames(params.sourceUri, params.packagePath)
  };
};
