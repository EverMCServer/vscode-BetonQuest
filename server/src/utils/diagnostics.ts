/* eslint-disable @typescript-eslint/naming-convention */

export enum DiagnosticCode {
  /**
   * The yaml key is unknown.
   */
  YamlKeyUnknown = "BQ-0001",

  // /**
  //  * The yaml key syntax is incorrect, e.g. contains invalid characters.
  //  */
  // YamlKeySyntax = "BQ-0002",

  /**
   * The yaml key should use alternative naming, e.g. condition -> conditions.
   */
  YamlKeyAlternativeNaming = "BQ-0003",

  /**
   * The format of value is incorrect.
   */
  ValueFormatIncorrect = "BQ-0100",

  /**
   * The yaml value is incorrect.
   */
  ValueTypeIncorrect = "BQ-0101",

  /**
   * The content of value is incorrect.
   */
  ValueContentIncorrect = "BQ-0102",

  /**
   * The content of value should not be empty.
   */
  ValueContentEmpty = "BQ-0103",

  // /**
  //  * The yaml value is incorrect. Value should be a string.
  //  */
  // ValueStringIncorrect = "BQ-0111",

  // /**
  //  * The yaml value is incorrect. Value should be a text translation.
  //  */
  // ValueTranslationIncorrect = "BQ-0112",

  /**
   * The yaml value is incorrect. Value should be a true / false boolean string.
   */
  ValueBooleanIncorrect = "BQ-0113",

  /**
   * The yaml value is incorrect. ID should not contains space.
   */
  ValueIdContainsSpace = "BQ-0121",

  // /**
  //  * The translation key is duplicated with others.
  //  */
  // TranslationDuplicated = "BQ-0201",

  /**
   * The instruction is missing.
   */
  ElementInstructionMissing = "BQ-1001",

  /**
   * The arguments is missing.
   */
  ElementArgumentsMissing = "BQ-1002",

  /**
   * The Condition / Event / Objective / Item ID syntax is incorrect.
   */
  ElementIdSyntax = "BQ-1101",

  /**
   * The Condition / Event / Objective / Item ID syntax is empty.
   */
  ElementIdEmpty = "BQ-1102",

  /**
   * A mandatory argument is missing.
   */
  ArgumentMandatoryMissing = "BQ-2001",

  /**
   * A optional argument is missing.
   */
  ArgumentOptionalMissing = "BQ-2002",

  /**
   * The "quester" section is missing.
   */
  ConversationMissingQuester = "BQ-3011",

  /**
   * The value of "first" section is incorrect.
   */
  ConversationFirstIncorrect = "BQ-3012",

  /**
   * Invalid character founded in a cross-package or cross-conversation pointer.
   */
  CrossPackageCrossConversationPointerInvalidCharacter = "BQ-4001",
}
