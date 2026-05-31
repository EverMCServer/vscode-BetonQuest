# Diagnostics Reference

Complete reference of all diagnostic codes emitted by the LSP server.

## Diagnostic Code Ranges

| Range | Category | Description |
|---|---|---|
| `BQ-0001` – `BQ-0099` | General / YAML Structure | Invalid YAML keys, naming conventions |
| `BQ-0100` – `BQ-0199` | Value Validation | Incorrect value types, formats, content |
| `BQ-1001` – `BQ-1999` | Element Validation | Missing instructions, invalid element IDs |
| `BQ-2001` – `BQ-2999` | Argument Validation | Missing/invalid arguments, variable reference errors |
| `BQ-3001` – `BQ-3999` | Conversation Validation | Missing sections, incorrect pointers, first option errors |
| `BQ-4001` – `BQ-4002` | Cross-Package Validation | Cross-package/cross-conversation pointer errors |

---

## General / YAML Structure (`BQ-0001` – `BQ-0099`)

### BQ-0001 — YamlKeyUnknown

| Property | Value |
|---|---|
| **Severity** | Warning |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A YAML key is not recognized as a valid BetonQuest key |
| **Example** | `wrong_key: some_value` in a conditions file |
| **Fix** | Check the spelling of the YAML key. Valid keys depend on context: in conditions/events/objectives files the top-level keys are element IDs; in conversations they are `quester`, `first`, `stop`, `NPC_options`, `player_options`, etc. |

### BQ-0003 — YamlKeyAlternativeNaming

| Property | Value |
|---|---|
| **Severity** | Warning |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A YAML key uses a deprecated or alternative naming convention |
| **Example** | `condition: ...` instead of `conditions: ...` (plural) |
| **Fix** | Use the canonical plural form (`conditions`, `events`, `objectives`, `conversations`) |

---

## Value Validation (`BQ-0100` – `BQ-0199`)

### BQ-0100 — ValueFormatIncorrect

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A value's format does not match the expected format for its type |
| **Example** | An integer argument where a string is expected, or a malformed instruction string |
| **Fix** | Check the expected format for the argument or value (see element kind documentation for correct format) |

### BQ-0101 — ValueTypeIncorrect

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A YAML value has the wrong type (e.g., a string where a number is expected, or a map where a string is expected) |
| **Example** | `amount: "not-a-number"` when a number is expected |
| **Fix** | Use the correct YAML type: strings should be quoted, numbers unquoted, booleans as `true`/`false` |

### BQ-0102 — ValueContentIncorrect

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A value's content is semantically incorrect even though the format is valid |
| **Example** | An entity type that doesn't exist, or a material name that isn't recognized |
| **Fix** | Check the value against the known list of valid values (e.g., valid Bukkit entity types, materials, enchantments) |

### BQ-0103 — ValueContentEmpty

| Property | Value |
|---|---|
| **Severity** | Warning |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A required value is empty or whitespace-only |
| **Example** | `quester: ""` or `text: ""` |
| **Fix** | Provide a non-empty value |

### BQ-0113 — ValueBooleanIncorrect

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A value that should be a boolean string (`"true"` or `"false"`) is something else |
| **Example** | `stop: "yes"` instead of `stop: "true"` |
| **Fix** | Use `"true"` or `"false"` (as YAML strings, not YAML booleans) |

### BQ-0121 — ValueIdContainsSpace

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An element ID contains spaces |
| **Example** | `my event: "message Hello"` (space in the ID `my event`) |
| **Fix** | Remove spaces from the ID. Use underscores or camelCase: `my_event` or `myEvent` |

---

## Element Validation (`BQ-1001` – `BQ-1999`)

### BQ-1001 — ElementInstructionMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An event/condition/objective entry has no instruction (kind + arguments) after its ID |
| **Example** | `my_event:` (with no value after the colon in V1) |
| **Fix** | Add the instruction: `my_event: "message Hello!"` (V1) or `my_event: { kind: message, message: "Hello!" }` (V2) |

### BQ-1101 — ElementIdSyntax

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An element ID contains invalid characters |
| **Example** | `my-event!`: special characters in ID |
| **Fix** | Use only alphanumeric characters and underscores in element IDs |

### BQ-1102 — ElementIdEmpty

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An element ID is empty |
| **Example** | `"": "message Hello"` |
| **Fix** | Provide a non-empty ID name |

---

## Argument Validation (`BQ-2001` – `BQ-2999`)

### BQ-2001 — ArgumentMandatoryMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A mandatory argument for an element kind is missing |
| **Example** | `give:` with no items argument (V2) |
| **Fix** | Add the required argument. Check the element kind's documentation for its mandatory arguments |

### BQ-2002 — ArgumentOptionalMissing

| Property | Value |
|---|---|
| **Severity** | Warning |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An optional argument that is commonly used is missing |
| **Example** | An event missing a `notify` argument |
| **Fix** | Consider adding the optional argument, or ignore the warning if intentional |

### BQ-2003 — ArgumentKeyIncorrect

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An argument key is not recognized for this element kind |
| **Example** | `wrong_arg: value` in an event where `wrong_arg` is not a valid argument |
| **Fix** | Check the valid argument keys for this element kind and correct the key name |

### BQ-2004 — ArgumentKeyMissingSemicolon

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An optional V1 argument is missing its trailing colon separator |
| **Example** | `give sword:1 taggedquest_item` (missing colon after `tagged`) |
| **Fix** | Add the colon: `give sword:1 tagged:quest_item` |

### BQ-2005 — ArgumentValueInvalid

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An argument's value is invalid for its type |
| **Example** | `amount: abc` where a number is expected |
| **Fix** | Provide a valid value matching the argument type |

### BQ-2006 — ArgumentValueMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | An argument key is present but has no value |
| **Example** | `items:` with nothing after it |
| **Fix** | Provide a value for the argument |

### BQ-2007 — ArgumentValueInvalidRegexp

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A regular expression argument value is not a valid regex |
| **Example** | `regex: "[invalid"` (unclosed bracket) |
| **Fix** | Correct the regular expression pattern |

### Variable-Related Argument Diagnostics (`BQ-2011` – `BQ-2025`)

These diagnostics apply to V2 only, validating `%variable%` references in argument values.

### BQ-2011 — ArgumentVariableObjectiveIdMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | `%objective%` variable used without an objective ID |
| **Example** | `%objective%` instead of `%objective.myObj%` |
| **Fix** | Specify the objective ID: `%objective.myObj.property%` |

### BQ-2012 — ArgumentVariableObjectiveIdNotFound

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | The objective ID referenced in a `%objective.id%` variable doesn't exist |
| **Example** | `%objective.nonexistent.progress%` |
| **Fix** | Use an existing objective ID, or create the objective first |

### BQ-2013 — ArgumentVariableObjectivePropertyNameMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | `%objective.id%` variable is missing the property name |
| **Example** | `%objective.myObj%` instead of `%objective.myObj.progress%` |
| **Fix** | Add the property name: `progress`, `state`, `left`, `amount`, `total` |

### BQ-2014 — ArgumentVariableObjectivePropertyNameInvalid

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | The property name in an `%objective%` variable is not valid |
| **Example** | `%objective.myObj.invalidProp%` |
| **Fix** | Use a valid property: `progress`, `state`, `left`, `amount`, `total` |

### BQ-2015 — ArgumentVariableConditionIdMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | `%condition%` variable used without a condition ID |
| **Example** | `%condition%` instead of `%condition.myCond%` |
| **Fix** | Specify the condition ID: `%condition.myCond%` |

### BQ-2016 — ArgumentVariableConditionIdNotFound

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | The condition ID in a `%condition.id%` variable doesn't exist |
| **Example** | `%condition.nonexistent%` |
| **Fix** | Use an existing condition ID |

### BQ-2017 — ArgumentVariableConditionLoopedReference

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | A condition's `%condition%` variable references itself (circular dependency) |
| **Example** | Inside condition `myCond`: `%condition.myCond%` |
| **Fix** | Reference a different condition |

### BQ-2018 — ArgumentVariablePointCategoryMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | `%point%` variable used without a category name |
| **Example** | `%point%` instead of `%point.reputation%` |
| **Fix** | Specify the point category: `%point.reputation.amount%` |

### BQ-2019 — ArgumentVariablePointCategoryNotFound

| Property | Value |
|---|---|
| **Severity** | Warning |
| **Trigger** | The point category referenced doesn't exist (not defined in any event with `kind: point`) |
| **Example** | `%point.unknown.amount%` |
| **Fix** | Use a defined point category, or define it first |

### BQ-2020 — ArgumentVariableGlobalPointCategoryMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | `%globalpoint%` variable used without a category name |
| **Fix** | Specify the global point category: `%globalpoint.reputation.amount%` |

### BQ-2021 — ArgumentVariableGlobalPointCategoryNotFound

| Property | Value |
|---|---|
| **Severity** | Warning |
| **Trigger** | The global point category referenced doesn't exist |
| **Fix** | Use a defined global point category |

### BQ-2022 — ArgumentVariableTagNameMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | `%tag%` variable used without a tag name |
| **Fix** | Specify the tag name: `%tag.quest_started%` |

### BQ-2023 — ArgumentVariableTagNameNotFound

| Property | Value |
|---|---|
| **Severity** | Warning |
| **Trigger** | The tag name referenced doesn't exist |
| **Fix** | Use a defined tag name |

### BQ-2024 — ArgumentVariableGlobalTagNameMissing

| Property | Value |
|---|---|
| **Severity** | Error |
| **Trigger** | `%globaltag%` variable used without a tag name |
| **Fix** | Specify the tag name: `%globaltag.server_event%` |

### BQ-2025 — ArgumentVariableGlobalTagNameNotFound

| Property | Value |
|---|---|
| **Severity** | Warning |
| **Trigger** | The global tag name referenced doesn't exist |
| **Fix** | Use a defined global tag name |

### BQ-2102 — ArgumentBlockSelectorInvalid

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A block selector argument has invalid syntax |
| **Example** | `block: minecraft:` (incomplete) or `block: invalid_format` |
| **Fix** | Use correct block selector format: `namespace:material[state=value,...]` |

### BQ-2103 — ArgumentBlockSelectorCouldNotFindBlock

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | The material specified in a block selector doesn't exist in the Bukkit data |
| **Example** | `block: minecraft:nonexistent_block` |
| **Fix** | Use a valid Minecraft material name |

---

## Conversation Validation (`BQ-3001` – `BQ-3999`)

### BQ-3011 — ConversationMissingQuester

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A conversation file/section is missing the `quester` key |
| **Example** | A conversation YAML with no `quester:` entry |
| **Fix** | Add `quester: "NPC Name"` to the conversation |

### BQ-3012 — ConversationFirstIncorrect

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | The `first:` value references NPC option IDs that don't exist |
| **Example** | `first: nonexistent_option` |
| **Fix** | Ensure all option IDs in `first:` match defined NPC option keys |

### BQ-3021 — ConversationOptionPointerUndefined

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A `pointers:` value references an option ID that is not defined |
| **Example** | An NPC option's `pointers:` lists `player_response` but no `player_response` player option exists |
| **Fix** | Define the referenced option, or correct the pointer to an existing option ID |

---

## Cross-Package Validation (`BQ-4001` – `BQ-4002`)

### BQ-4001 — CrossPackageCrossConversationPackagePathIsEmpty

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A cross-package/cross-conversation pointer has an empty package path |
| **Example** | `.someOption` (dot prefix with no package name) |
| **Fix** | Specify the package name: `packageName.conversationName.optionId` |

### BQ-4002 — CrossPackageCrossConversationPointerInvalidCharacter

| Property | Value |
|---|---|
| **Severity** | Error |
| **Source file** | [diagnostics.ts](../server/src/utils/diagnostics.ts) |
| **Trigger** | A cross-package/cross-conversation pointer contains invalid characters |
| **Example** | `package.name!option` (invalid `!` character usage) |
| **Fix** | Use the correct format: dots to separate package.conversation.option levels |

---

## Adding a New Diagnostic

To add a new diagnostic code:

1. **Define the enum value** in [server/src/utils/diagnostics.ts](../server/src/utils/diagnostics.ts):
   ```typescript
   export enum DiagnosticCode {
     // ...
     MyNewDiagnostic = "BQ-XXXX",  // Choose next available number in appropriate range
   }
   ```

2. **Add the diagnostic** in the appropriate AST node's `getDiagnostics()` or `_init()` method:
   ```typescript
   this.diagnostics.push({
     code: DiagnosticCode.MyNewDiagnostic,
     range: this.offsetStart, // or specific child range
     severity: DiagnosticSeverity.Error, // or Warning/Information
     message: "Description of the problem",
   });
   ```

3. **Add a code action** (optional) in the node's `getCodeActions()` method to provide an automatic fix.

4. **Update this reference** with the new code's details.

---

## See Also

- [02-architecture.md](02-architecture.md) §2.4 — diagnostics system overview
- [08-ast-node-reference.md](08-ast-node-reference.md) — AST nodes that emit diagnostics
- [05-development-guide.md](05-development-guide.md) §1.6 — step-by-step guide for adding diagnostics

---

*Last updated: 2026-05-26*
