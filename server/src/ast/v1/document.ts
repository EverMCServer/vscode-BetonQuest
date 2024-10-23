import { Range } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Scalar, YAMLMap, isSeq, parseDocument, visit } from "yaml";

import { LocationsResponse } from "betonquest-utils/lsp/file";

import { NodeType } from "../node";
import { AbstractNodeV1 } from "../v1";
import { PackageV1 } from "./Package";

export abstract class Document<T extends NodeType> extends AbstractNodeV1<T> {
  readonly uri: string;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: PackageV1;

  // VSCode Document, for diagnostics / quick actions / goto definition, etc
  document: TextDocument;
  yml: YAMLMap<Scalar<string>>;

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super();

    this.uri = uri;
    this.parent = parent;
    this.document = document;

    // Parse yaml
    const yamlDoc = parseDocument<YAMLMap<Scalar<string>>, false>(
      document.getText(),
      {
        keepSourceTokens: true,
        strict: false
      }
    );
    // Move comment from YAMLMap onto it's first item, avoiding eemeli/yaml/discussions/490
    // Ref: https://github.com/eemeli/yaml/issues/502#issuecomment-1795624261
    visit(yamlDoc as any, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Map(_, node: any, path) {
        if (!node.commentBefore || isSeq(path[path.length - 1])) {
          return;
        }
        node.items[0].key.commentBefore = node.commentBefore;
        delete node.commentBefore;
      }
    });

    this.yml = yamlDoc.contents;

    // Extract offsets
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];
  }

  abstract getLocations(yamlPath: string[], sourceUri: string): LocationsResponse;

  getRangeByOffset(offsetStart: number, offsetEnd: number) {
    return {
      start: this.document.positionAt(offsetStart),
      end: this.document.positionAt(offsetEnd)
    } as Range;
  }

  // Get all CodeActions, quick fixes etc
  _getCodeActions(documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getCodeActions();
  }

  _getSemanticTokens(documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getSemanticTokens();
  }

  _getHoverInfo(offset: number, documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getHoverInfo(offset, documentUri);
  }

  _getDefinitions(offset: number, documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getDefinitions(offset, documentUri);
  }

  _getReferences(offset: number, documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getReferences(offset, documentUri);
  }

  _getCompletions(offset: number, documentUri?: string) {
    if (documentUri && documentUri !== this.uri) {
      return [];
    }
    return super._getCompletions(offset, documentUri);
  }

}