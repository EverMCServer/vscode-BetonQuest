import { LocationsParams, LocationsResponse } from "betonquest-utils/lsp/file";
import { HandlerResult } from "vscode-languageserver";
import { ASTs } from "../ast/ast";
import { AllDocuments } from "../utils/document";


export const locationsHandler = (allDocuments: AllDocuments, asts: ASTs, params: LocationsParams): HandlerResult<LocationsResponse, void> => {
  const locations = asts.getLocations(params.sourceUri, params.yamlPath, params.packagePath);

  return locations;
};
