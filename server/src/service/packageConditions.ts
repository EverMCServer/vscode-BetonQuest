import { PackageEntriesParams, PackageEntriesResponse } from "betonquest-utils/lsp/file";
import { HandlerResult } from "vscode-languageserver";
import { ASTs } from "../ast/ast";

export const packageConditionsHandler = (asts: ASTs, params: PackageEntriesParams): HandlerResult<PackageEntriesResponse, void> => {
  return {
    names: asts.getPackageConditionNames(params.sourceUri, params.packagePath)
  };
};
