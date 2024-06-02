/* eslint-disable @typescript-eslint/naming-convention */
import { SemanticTokens, SemanticTokensParams, HandlerResult, SemanticTokensBuilder, SemanticTokenTypes } from "vscode-languageserver";
import { ASTs } from "../ast/ast";
import { AllDocuments } from "../utils/document";
import { legend, tokenTypeCondition, tokenTypeEnum, tokenTypeEvent, tokenTypeNumber, tokenTypeObjective, tokenTypeString } from "../semantics/legend";

export type SemanticToken = {
  offsetStart: number,
  offsetEnd: number,
  tokenType: SemanticTokenType,
  tokenModifier?: string
};

export const semanticTokensHandler = (allDocuments: AllDocuments, asts: ASTs, params: SemanticTokensParams): HandlerResult<SemanticTokens | null, void> => {
  const builder = new SemanticTokensBuilder();
  asts.getSemanticTokens(params.textDocument.uri).forEach(token => {
    const range = allDocuments.getRangeByOffsets(params.textDocument.uri, [token.offsetStart, token.offsetEnd]);
    const len = range.end.character - range.start.character;

    builder.push(
      range.start.line,
      range.start.character,
      len,
      legend.tokenTypes.findIndex(t => t === token.tokenType),
      token.tokenModifier ? legend.tokenModifiers.findIndex(m => m === token.tokenModifier) : 0
    );
  });

  // DEBUG
  // legend.tokenTypes;
  // legend.tokenModifiers;
  // // builder.push(0, 0, 1, legend.tokenTypes.indexOf(tokenTypeCondition), -1);
  // // builder.push(0, 1, 1, legend.tokenTypes.indexOf(tokenTypeEvent), -1);
  // // builder.push(0, 2, 1, legend.tokenTypes.indexOf(tokenTypeObjective), -1);
  // // builder.push(0, 3, 1, legend.tokenTypes.indexOf(tokenTypeString), -1);
  // // builder.push(0, 4, 1, legend.tokenTypes.indexOf(tokenTypeNumber), -1);
  // // builder.push(0, 5, 1, legend.tokenTypes.indexOf(tokenTypeEnum), -1);
  // // // builder.push(0, 4, 1, legend.tokenTypes.indexOf(tokenType), -1);
  // builder.push(0, 0, 'namespace'.length, legend.tokenTypes.indexOf('namespace'), -1);
  // builder.push(1, 0, 'class'.length, legend.tokenTypes.indexOf('class'), -1);
  // builder.push(2, 0, 'enum'.length, legend.tokenTypes.indexOf('enum'), -1);
  // builder.push(3, 0, 'interface'.length, legend.tokenTypes.indexOf('interface'), -1);
  // builder.push(4, 0, 'struct'.length, legend.tokenTypes.indexOf('struct'), -1);
  // builder.push(5, 0, 'typeParameter'.length, legend.tokenTypes.indexOf('typeParameter'), -1);
  // builder.push(6, 0, 'type'.length, legend.tokenTypes.indexOf('type'), -1);
  // builder.push(7, 0, 'parameter'.length, legend.tokenTypes.indexOf('parameter'), -1);
  // builder.push(8, 0, 'variable'.length, legend.tokenTypes.indexOf('variable'), -1);
  // builder.push(9, 0, 'property'.length, legend.tokenTypes.indexOf('property'), -1);
  // builder.push(10, 0, 'enumMember'.length, legend.tokenTypes.indexOf('enumMember'), -1);
  // builder.push(11, 0, 'decorator'.length, legend.tokenTypes.indexOf('decorator'), -1);
  // builder.push(12, 0, 'event'.length, legend.tokenTypes.indexOf('event'), -1);
  // builder.push(13, 0, 'function'.length, legend.tokenTypes.indexOf('function'), -1);
  // builder.push(14, 0, 'method'.length, legend.tokenTypes.indexOf('method'), -1);
  // builder.push(15, 0, 'macro'.length, legend.tokenTypes.indexOf('macro'), -1);
  // builder.push(16, 0, 'label'.length, legend.tokenTypes.indexOf('label'), -1);
  // builder.push(17, 0, 'comment'.length, legend.tokenTypes.indexOf('comment'), -1);
  // builder.push(18, 0, 'string'.length, legend.tokenTypes.indexOf('string'), -1);
  // builder.push(19, 0, 'keyword'.length, legend.tokenTypes.indexOf('keyword'), -1);
  // builder.push(20, 0, 'number'.length, legend.tokenTypes.indexOf('number'), -1);
  // builder.push(21, 0, 'regexp'.length, legend.tokenTypes.indexOf('regexp'), -1);
  // builder.push(22, 0, 'operator'.length, legend.tokenTypes.indexOf('operator'), -1);

  const result = builder.build();

  return result;
};

export enum SemanticTokenType {
  /**
   * Thumbs of rule:
   * ---
   * class namespace enum interface struct
   * - ConditionID
   * - ConversationOptionPlayerID
   * ---
   * event variable parameter property
   * - ObjectiveID
   * ---
   * enumMember
   * - SectionKeyword
   * ---
   * function decorator method
   * - EventID
   * ---
   * macro ~= label
   * - Boolean
   * - InstructionKind
   * - ConversationOptionNpcID
   * ---
   * label ~= macro
   * ---
   * comment
   * - x
   * ---
   * string
   * - String
   * - InstructionArguments
   * ---
   * keyword
   * - ConversationKeyword
   * ---
   * number
   * - ConversationOptionNpcID
   * ---
   * regexp
   * ---
   * operator
   * - Operator
   *

  * original plan:
  namespace: 
  class: conditions / player_options
  enum: 
  interface: 
  struct: 
  typeParameter: 
  type: 
  parameter: 
  variable: variables
  property: 
  enumMember: items / v2 top level keywords
  decorator: 
  event: objectives
  function: 
  method: events / jouirnals
  macro: boolean / npc_options
  label: minecraft / optional_key
  comment: 
  string: default
  keyword: tag / point
  number: number
  regexp: 
  operator: ,:^!
   */

  String = SemanticTokenTypes.string,

  Boolean = SemanticTokenTypes.macro,

  /**
   * Operator / Seprator, e.g.: , : !
   */
  Operator = SemanticTokenTypes.operator,

  /**
   * For V2 top level keywords. e.g.
   * ```yaml
   * conditions:
   * events:
   * conversations:
   * ```
   */
  SectionKeyword = SemanticTokenTypes.enumMember,

  /**
   * ID of Conditions.
   */
  ConditionID = SemanticTokenTypes.class,

  /**
   * ID of Events.
   */
  EventID = SemanticTokenTypes.function,

  /**
   * ID of Objectives
   */
  ObjectiveID = SemanticTokenTypes.event,

  /**
   * Kind of Instruction, e.g. Condition "kill"
   */
  InstructionKind = SemanticTokenTypes.macro,

  /**
   * Default Arguments of Instructions, e.g. the location of a "tp" Condition
   */
  InstructionArguments = SemanticTokenTypes.string,

  /**
   * Conversation's keywords. e.g.
   * ```yaml
   * quester:
   * first:
   * stop:
   * final_events:
   * interceptor:
   * NPC_options:
   * player_options:
   * ```
   */
  ConversationKeyword = SemanticTokenTypes.keyword,

  /**
   * Conversation option's keywords. e.g.
   * ```yaml
   * text:
   * conditions:
   * events:
   * pointers:
   * ```
   */
  ConversationOptionKeyword = SemanticTokenTypes.macro,

  /**
   * Conversation Player option's ID.
   */
  ConversationOptionNpcID = SemanticTokenTypes.number,

  /**
   * Conversation Player option's ID.
   */
  ConversationOptionPlayerID = SemanticTokenTypes.class,
};
