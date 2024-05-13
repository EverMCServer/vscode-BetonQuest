import { Pair, Scalar, YAMLMap } from "yaml";
import { CodeAction, Diagnostic } from "vscode-languageserver";

import { ConversationOptionType, ConversationOptionsType, Node } from "../../../node";
import { Conversation } from "../Conversation";
import { AbstractOption } from "./AbstractOption";
import { isYamlMapPair } from "../../../../utils/yaml";

export abstract class AbstractOptions<T extends ConversationOptionType> extends Node<ConversationOptionsType> {
  abstract type: ConversationOptionsType;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: Conversation;

  // Cache the parsed yaml document
  yml: YAMLMap;
  options: AbstractOption<T>[] = [];

  constructor(yml: YAMLMap, parent: Conversation) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;

    this.yml.items.forEach(pair => {
      if (isYamlMapPair(pair)) {
        this.options.push(this.newAbstractOption(pair));
      }
    });
  }

  abstract newAbstractOption(yml: Pair<Scalar<string>, YAMLMap>): AbstractOption<T>;

  getDiagnostics(): Diagnostic[] {
    return [
      ...this.diagnostics,
      ...this.options.flatMap(option => option.getDiagnostics())
    ];
  } 

  getCodeActions(): CodeAction[] {
    return [
      ...this.codeActions,
      ...this.options.flatMap(option => option.getCodeActions())
    ];
  }
}
