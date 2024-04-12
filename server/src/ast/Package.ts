import { PublishDiagnosticsParams } from "vscode-languageserver";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { Node, PackageTypes } from "./node";
import { HoverInfo } from "../utils/hover";

export abstract class Package<T extends PackageTypes> implements Node<T> {
  type: T;
  uri: string;
  abstract offsetStart?: number;
  abstract offsetEnd?: number;

  constructor(type: T, packageUri: string) {
    this.type = type;
    this.uri = packageUri;
  }

  /**
   * Get diagnostics info, e.g. gramatical errors.
   */
  abstract getPublishDiagnosticsParams(): PublishDiagnosticsParams[];

  /**
   * Get hover info of a given location.
   * @param uri File's uri
   * @param offset Offset on the text
   */
  abstract getHoverInfo(uri: string, offset: number): HoverInfo[];

  /**
   * Get target location of a abstract path. Useful for "goto" jump.
   * @param yamlPath The abstract YAML path to search for.
   * @param sourceUri The URI of the document to begin searching locations from. It is used to determine which package to search on.
   */
  abstract getLocations(yamlPath: string[], sourceUri: string): LocationsResponse;
}
