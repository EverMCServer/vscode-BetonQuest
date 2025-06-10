import { CompletionItem, CompletionItemKind, MarkupKind } from "vscode-languageserver";

import { ArgumentType } from "betonquest-utils/betonquest/Arguments";

import { ArgumentVariableKindType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentVariable } from "./ArgumentVariable";
import { ConditionArguments } from "../Condition/ConditionArguments";
import { EventArguments } from "../Event/EventArguments";
import { ObjectiveArguments } from "../Objective/ObjectiveArguments";
import { ConditionArgumentMandatory } from "../Condition/ConditionArgumentMandatory";
import { EventArgumentMandatory } from "../Event/EventArgumentMandatory";
import { ObjectiveArgumentMandatory } from "../Objective/ObjectiveArgumentMandatory";
import { ConditionArgumentOptional } from "../Condition/ConditionArgumentOptional";
import { EventArgumentOptional } from "../Event/EventArgumentOptional";
import { ObjectiveArgumentOptional } from "../Objective/ObjectiveArgumentOptional";
import { ArgumentValue } from "./ArgumentValue";
import { HoverInfo } from "../../../utils/hover";

export class ArgumentVariableKind extends AbstractNodeV2<ArgumentVariableKindType> {
  readonly type: ArgumentVariableKindType = 'ArgumentVariableKind';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentVariable;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentVariable,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;

    this.argumentStr = argumentStr;
  }

  // key -> [title, details]
  private kindDescriptions: Map<string, [string, string]> = new Map([
    ['objective', ["Objective Property Variable", "Get a property of an Objective.\n\n\n\n```text\n%objective.kill_zombies.left%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#objective-property-variable"]],
    ['condition', ["Condition Variable", "Get current status of a Condition. It returns `true` or `false`.\n\n\n\nIf append with `.papiMode`, it returns `yes` or `no` instead. You can translate the papiMode's result by changing the values of `condition_variable_met` and `condition_variable_not_met` in the *messages.yml* config.\n\n\n\n```text\n%condition.myCondition%\n%condition.myCondition.papiMode%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#condition-variable"]],
    ['point', ["Point Variable", "Get the amount of points you have in some category or amount of points you need to have to reach a number.\n\n\n\nThe first argument is the name of a category and the second argument is either `.amount` or `.left:x`, where `x` is a number.\n\n\n\n```text\n%point.reputation.amount%\n%point.reputation.left:15%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#point-variable"]],
    ['globalpoint', ["Global Point Variable", "Get the amount of global points in some category or the amount of points needed to reach a number.\n\n\n\nThe first argument is the name of a category and the second argument is either `.amount` or `.left:x`, where x is a number.\n\n\n\n```text\n%globalpoint.global_knownusers.amount%\n%globalpoint.global_knownusers.left:100%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#global-point-variable"]],
    ['tag', ["Tag Variable", "Get whether the player has a tag or not. The variable will return `true` or `false` by default.\n\n\n\nIf append with `.papiMode`, it returns `yes` or `no` instead. You can translate the papiMode's result by changing the values of `condition_variable_met` and `condition_variable_not_met` in the *messages.yml* config.\n\n\n\n```text\n%tag.test%\n%tag.test.papiMode%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#tag-variable"]],
    ['globaltag', ["Global Tag Variable", "Get whether a global tag is set or not. The variable will return `true` or `false` by default.\n\n\n\nIf append with `.papiMode`, it returns `yes` or `no` instead. You can translate the papiMode's result by changing the values of `condition_variable_met` and `condition_variable_not_met` in the *messages.yml* config.\n\n\n\n```text\n%globaltag.test%\n%globaltag.test.papiMode%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#global-tag-variable"]],
    ['eval', ["Eval Variable", "This variable allows you to resolve an expression containing variables, and the result will then be interpreted again as a variable.\n\n\n\nYou need to escape the `%` inside eval with a backslash `\\` to prevent it from being interpreted as a delimiter. You can nest multiple evals, but this leads you to an escape hell. If you do so, you need to add one escape level with each nesting level, this means normally you write `\\%` and in the next level you need to write `\\\\\\%`.\n\n\n\n```text\n%eval.player.\\%objective.variableStore.displayType\\%%\n%eval.player.\\%eval.objective.\\\\\\%objective.otherStore.targetStore\\\\\\%.displayType\\%%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#eval-variable"]],
    ['item', ["Item Variable", "Get different properties of a specific QuestItem. The first argument is the name of the item (as defined in the items section).\n\n\n\nThe `.amount` argument displays the number of items in the players inventory and backpack, the `.left:x` gives the difference to the `x` value (when the amount is higher than the value it will be negative). The name argument simply gives the defined name or an empty String, when not set and `.lore:x` displays the lore row with index `x` (starting with 0). Both `.name` and `.lore` supports the `.raw` subargument to get the text without formatting.\n\n\n\n```text\n%item.stick.amount%\n%item.stick.left:32%\n%item.epic_sword.name%\n%item.epic_sword.lore:0.raw%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#item-variable"]],
    ['itemdurability', ["Item Durability Variable", "Get the durability of an item.\n\n\n\nThe first argument is the slot. An optional argument is `relative` which will display the durability of the item relative to the maximum from 0 to 1, where 1 is the maximum. You can specify the amount of digits with the argument `digits:x`, where `x` is a whole number. This default is 2 digits. Additionally, you get the output in percent (with symbol '%' included).\n\n\n\n```text\n%itemdurability.HAND%\n%itemdurability.CHEST.relative%\n%itemdurability.CHEST.relative.percent%\n%itemdurability.HEAD.relative.digits:5%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#item-durability-variable"]],
    ['location', ["Location Variable", "Get the player's location with a specified format.\n\n\n\nThe first argument is the format. The second optional argument is the decimal places the number will be.\n\n\n\nIf you did not specified the format, the variables will resolve to a [Unified Location Formatting](https://betonquest.org/2.2/Documentation/Scripting/Data-Formats/#unified-location-formating) with yaw and pitch.\n\n\n\n```text\n%location%           # -> 325;121;814;myWorldName;12;6\n%location.xyz%       # -> 325 121 814\n%location.x%         # -> 325\n%location.y%         # -> 121\n%location.z%         # -> 814\n%location.yaw%       # -> 12\n%location.pitch%     # -> 6\n%location.world%     # -> myWorldName\n%location.ulfShort%  # -> 325;121;814;myWorldName\n%location.ulfLong%   # -> 325;121;814;myWorldName;12;6\n\n%location.x.2%       # -> 325.16\n%location.ulfLong.5% # -> 325.54268;121.32186;814.45824;myWorldName;12.0;6.0\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#location-variable"]],
    ['math', ["Math Variable", "Perform a math calculation and get the result.\n\n\n\nThe variable always starts with `math.calc:`, followed by the calculation which should be calculated. Supported operations are `+`, `-`, `*`, `/`, `^` and `\\%`.\n\n\n\nYou can use `( )` and `[ ]` braces and also calculate absolute values with `| |`. But be careful, don't use absolute values in the command event as it splits the commands at every `|` and don't nest them without parenthesis (`|4*|3-5||` wont work, but `|4*(|3-5|)|` does).\n\n\n\nAdditionally, you can use the round operator `~` to round everything left of it to the number of decimal digits given on the right. So `4+0.35~1` will produce `4.4` and `4.2~0` will produce `4`.\n\n\n\n```text\n%math.calc:100*(15-point.reputation.amount)%\n%math.calc:objective.kill_zombies.left/objective.kill_zombies.total*100~2%\n%math.calc:-{ph.myplugin_stragee+placeholder}%\n%math.calc:64\%32%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#math-variable"]],
    ['npc', ["NPC Name Variable", "When the player is in a conversation, this variable will contain the questers name in the player's quest language. If the player is not in a conversation, the variable is empty.\n\n\n\n```text\n%npc%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#npc-name-variable"]],
    ['player', ["Player Name Variable", "Get the name of the player.\n\n\n\n`%player.display%` will use the display name used in chat and %player.uuid% will display the UUID of the player.\n\n\n\n```text\n%player%\n%player.name%\n%player.display%\n%player.uuid%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#player-name-variable"]],
    ['randomnumber', ["Random Number Variable", "Generate a random number ranging from the first value to the second.\n\n\n\nThe first argument is `whole` or `decimal`, the second and third arguments are numbers or variables, seperated by a `~`.\n\n\n\nLike the `math` variable you can round the decimal value by using the argument `decimal~x`, where `x` is the maximal amount of decimal places. Variables can be quoted with `{}` instead of `%%`. Note that the first value is returned when it is higher than the second.\n\n\n\n```text\n%randomnumber.whole.0~10%\n%randomnumber.whole.-70~70%\n%randomnumber.decimal~3.3.112~100%\n%randomnumber.decimal~1.0~{location.y}%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#random-number-variable"]],
    ['version', ["Version Variable", "Get the version of the plugin. You can optionally add the name of the plugin as an argument to display version of another plugin.\n\n\n\n```text\n%version.Citizens%\n```\n\n\n\nhttps://betonquest.org/2.2/Documentation/Scripting/Building-Blocks/Variables-List/#version-variable"]],
  ]);

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    let desc = this.kindDescriptions.get(this.argumentStr);
    if (desc) {
      return [{
        content: desc[0] + "\n\n\n\n" + desc[1],
        offset: [this.offsetStart, this.offsetEnd]
      }];
    }
    return [];
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completionItems: CompletionItem[] = [];

    // Prompt built-in variable kinds
    [
      "objective",
      "condition",
      "point",
      "globalpoint",
      "tag",
      "globaltag",
      "eval",
      "item",
      "itemdurability",
      "location",
      "math",
      "npc",
      "player",
      "randomnumber",
      "version",
    ].map(kind => {
      const desc = this.kindDescriptions.get(kind);
      if (desc) {
        completionItems.push({
          label: kind,
          kind: CompletionItemKind.Variable,
          detail: desc[0],
          documentation: {
            kind: "markdown",
            value: desc[1]
          },
          insertText: kind
        });
      } else {
        completionItems.push({
          label: kind,
          kind: CompletionItemKind.Variable,
          detail: "built-in",
          insertText: kind
        });
      }
    });

    return completionItems;
  }
}