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
  'class', // conditions / player_options
  'enum',
  'interface',
  'struct',
  'typeParameter',
  'type',
  'parameter',
  'variable', // %variables%
  'property',
  'enumMember', // items
  'decorator',
  'event', // objectives
  'function', // events / journals
  'method',
  'macro', // boolean / npc_options / condition/event/objective's kind
  'label', // minecraft / optional_key
  'comment',
  'string', // default
  'keyword', // tag / point
  'number', // number
  'regexp',
  'operator', // separator,:^!
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
