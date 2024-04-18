import { SemanticTokensLegend } from "vscode-languageserver";

// See https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide#standard-token-types-and-modifiers

export const tokenTypeCondition = 'enumMember';
export const tokenTypeEvent = 'function';
export const tokenTypeObjective = 'event';
export const tokenTypeString = 'string';
export const tokenTypeNumber = 'number';
export const tokenTypeEnum = 'enum';

export const tokenModifierElementProvided = 'documentation';

const tokenTypes = [
  // tokenTypeCondition,
  // tokenTypeEvent,
  // tokenTypeObjective,
  // tokenTypeString,
  // tokenTypeNumber,
  // tokenTypeEnum,

  'namespace',
  'class',
  'enum',
  'interface',
  'struct',
  'typeParameter',
  'type',
  'parameter',
  'variable',
  'property',
  'enumMember',
  'decorator',
  'event',
  'function',
  'method',
  'macro',
  'label',
  'comment',
  'string',
  'keyword',
  'number',
  'regexp',
  'operator',
];

const tokenModifiers = [
  // tokenModifierElementProvided
  
  'defaultLibrary',
  'declaration',
  'definition',
  'readonly',
  'static',
  'deprecated',
  'abstract',
  'async',
  'modification',
  'documentation',
];

export const legend: SemanticTokensLegend = {
  tokenTypes: tokenTypes,
  tokenModifiers: tokenModifiers
};
