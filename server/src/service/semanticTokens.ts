import { SemanticTokens, SemanticTokensParams, HandlerResult, SemanticTokensBuilder } from "vscode-languageserver";
import { ASTs } from "../ast/ast";
import { AllDocuments } from "../utils/document";
import { legend, tokenTypeCondition, tokenTypeEnum, tokenTypeEvent, tokenTypeNumber, tokenTypeObjective, tokenTypeString } from "../semantics/legend";

export type SemanticToken = {
  offsetStart: number,
  offsetEnd: number,
  tokenType: string,
  tokenModifier?: string
};

export const semanticTokensHandler = (allDocuments: AllDocuments, asts: ASTs, params: SemanticTokensParams): HandlerResult<SemanticTokens | null, void> => {
  const ast = asts.getAstByDocumentUri(params.textDocument.uri);
  if (!ast) {
    return null;
  }

  const builder = new SemanticTokensBuilder();
  ast.getSemanticTokens(params.textDocument.uri).forEach(token => {
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
