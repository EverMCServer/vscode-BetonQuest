import { CompletionItem, CompletionItemKind, Diagnostic, DiagnosticSeverity, SemanticTokenTypes } from "vscode-languageserver";

// eslint-disable-next-line @typescript-eslint/naming-convention
import MATERIAL_LIST from "betonquest-utils/bukkit/Data/MaterialList";

import { AddDiagnosticType, ArgumentBlockSelectorMaterialType, ArgumentBlockSelectorNamespaceType, ArgumentBlockSelectorStateType, ArgumentBlockSelectorType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentValue } from "./ArgumentValue";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";

export class ArgumentBlockSelector extends AbstractNodeV2<ArgumentBlockSelectorType> {
  readonly type: ArgumentBlockSelectorType = 'ArgumentBlockSelector';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentValue;

  readonly argumentStr: string;
  readonly namesapceStr: string = "";
  readonly materialStr: string;
  readonly stateStr: string = "";

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentValue,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;
    this.argumentStr = argumentStr;

    // Parse namespace and states: "namespace:material[state=value,...]"
    // Port from https://github.com/BetonQuest/BetonQuest/blob/1de35f2b45b63b7e8e6e1b1b9febe7570d1b5496/src/main/java/org/betonquest/betonquest/util/BlockSelector.java#L65

    this.materialStr = this.argumentStr;

    // State
    let posState = 0;
    if (this.materialStr.endsWith("]") && this.materialStr.includes("[")) {
      posState = this.materialStr.lastIndexOf("[");
      this.stateStr = this.materialStr.slice(posState + 1, -1);
      this.materialStr = this.materialStr.slice(0, posState);
      this.addChild(new ArgumentBlockSelectorNamespace(this.stateStr, [this.offsetStart + posState + 1, this.offsetEnd - 1], this));
      this.addSemanticTokens(
        {
          offsetStart: this.offsetStart + posState,
          offsetEnd: this.offsetStart + posState + 1,
          tokenType: SemanticTokenType.Bracket
        },
        {
          offsetStart: this.offsetEnd - 1,
          offsetEnd: this.offsetEnd,
          tokenType: SemanticTokenType.Bracket
        },
      );
    }

    // Namespace
    let posMaterial = 0;
    if (this.materialStr.includes(":")) {
      const posColon = this.materialStr.indexOf(":");
      this.namesapceStr = this.materialStr.slice(0, posColon);
      this.addChild(new ArgumentBlockSelectorNamespace(this.namesapceStr, [this.offsetStart, this.offsetStart + posColon], this));
      posMaterial = posColon + 1;
      this.materialStr = this.materialStr.slice(posMaterial);
    } else {
      // Create empty namespace for Completion promption
      this.addChild(new ArgumentBlockSelectorNamespace("", [this.offsetStart, this.offsetStart], this));
    }

    // Material
    this.addChild(new ArgumentBlockSelectorMaterial(this.materialStr, [this.offsetStart + posMaterial, this.offsetStart + posMaterial + this.materialStr.length], this));
  }

  initDiagnosticsAndCodeActions(addDiagnostic: AddDiagnosticType): void {
    // Check ending "[...]"
    const posBracket = this.argumentStr.search("\\[");
    if (posBracket > 0) {
      const s = this.argumentStr.slice(posBracket);
      if (!this.argumentStr.endsWith(']')) {
        addDiagnostic(
          [this.offsetEnd, this.offsetEnd],
          `Missing tailing "]"`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentValueInvalid,
          [{
            title: `Append "]"`,
            text: "]",
          }]
        );
        return;
      }
    }

  }
}

export class ArgumentBlockSelectorNamespace extends AbstractNodeV2<ArgumentBlockSelectorNamespaceType> {
  readonly type: ArgumentBlockSelectorNamespaceType = 'ArgumentBlockSelectorNamespace';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentBlockSelector;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentBlockSelector,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;
    this.argumentStr = argumentStr;
  }

  getCompletions(offset: number, documentUri?: string): CompletionItem[] {
    const completions: CompletionItem[] = [];
    if (this.parent.materialStr.length > 0) {
      completions.push({
        label: "minecraft",
      });
    } else {
      completions.push({
        label: "minecraft",
        insertText: "minecraft:", // Extra ":" to prompt the Materials
      });
    }
    return completions;
  }

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    return [{
      content: "Block Selector: namespace\n\n(optional) The material namespace. If left out then it will be assumed to be 'minecraft'. Can be a [regex](https://betonquest.org/2.2/Documentation/Scripting/Data-Formats/#regex-regular-expressions).",
      offset: [this.offsetStart, this.offsetEnd]
    }];
  }
}

export class ArgumentBlockSelectorMaterial extends AbstractNodeV2<ArgumentBlockSelectorMaterialType> {
  readonly type: ArgumentBlockSelectorMaterialType = 'ArgumentBlockSelectorMaterial';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentBlockSelector;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentBlockSelector,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;
    this.argumentStr = argumentStr;
  }

  initDiagnosticsAndCodeActions(addDiagnostic: AddDiagnosticType): void {

    // Check RegExp
    let regex: RegExp;
    try {
      regex = new RegExp(`^${this.argumentStr}$`, 'igm');
    } catch (e) {
      if (e instanceof SyntaxError) {
        addDiagnostic(
          [this.offsetStart, this.offsetEnd],
          `Invalid Regular Expression pattern. Please refer to https://betonquest.org/2.2/Documentation/Scripting/Data-Formats/#regex-regular-expressions`,
          DiagnosticSeverity.Error,
          DiagnosticCode.ArgumentValueInvalidRegexp,
        );
        return;
      }
      throw e;
    }

    // Try it on vanilla blocks
    if (!this.parent.namesapceStr || this.parent.namesapceStr === "minecraft") {
      if (MATERIAL_LIST.find(e => e.getBukkitId().match(regex))) {
        return;
      }
      addDiagnostic(
        [this.offsetStart, this.offsetEnd],
        `Could not find such Minecraft material, or it is not a block.`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ArgumentBlockSelectorCouldNotFindBlock,
      );
      return;
    }

    return;
  }

  getCompletions(offset: number, documentUri?: string | undefined): CompletionItem[] {
    const completions: CompletionItem[] = [];
    if (!this.parent.namesapceStr || this.parent.namesapceStr.toLowerCase() === "minecraft") {
      completions.push(...MATERIAL_LIST.map(e => ({
        label: e.getBukkitId(),
        kind: CompletionItemKind.EnumMember,
        detail: "Block ID",
        documentation: "Bukkit Block ID",
      })));
    }
    return completions;
  }

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    return [{
      content: "Block Selector: material\n\nThe material the block is made of. All materials can be found in [Spigots Javadocs](https://hub.spigotmc.org/javadocs/spigot/org/bukkit/Material.html). It can be a [regex](https://betonquest.org/2.2/Documentation/Scripting/Data-Formats/#regex-regular-expressions). If the regex ends with square brackets you have to add another pair of empty square brackets even if you don't want to use the state argument (`[regex][]`)",
      offset: [this.offsetStart, this.offsetEnd]
    }];
  }

}

export class ArgumentBlockSelectorState extends AbstractNodeV2<ArgumentBlockSelectorStateType> {
  readonly type: ArgumentBlockSelectorStateType = 'ArgumentBlockSelectorState';
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: ArgumentBlockSelector;

  readonly argumentStr: string;

  constructor(
    argumentStr: string,
    offsets: [offsetStart: number, offsetEnd: number],
    parent: ArgumentBlockSelector,
  ) {
    super();
    this.offsetStart = offsets[0];
    this.offsetEnd = offsets[1];
    this.parent = parent;
    this.argumentStr = argumentStr;
  }

  initDiagnosticsAndCodeActions(addDiagnostic: AddDiagnosticType): void {
    // TODO check format
  }

  getHoverInfo(offset: number, documentUri?: string): HoverInfo[] {
    return [{
      content: "Block Selector: (optional) The block states can be provided in a comma separated `key=value` list surrounded by square brackets. You can look up states in the Minecraft [wiki](https://minecraft.wiki/w/Block_states). Any states left out will be ignored when matching. Values can be a [regex](https://betonquest.org/2.2/Documentation/Scripting/Data-Formats/#regex-regular-expressions).",
      offset: [this.offsetStart, this.offsetEnd]
    }];
  }
}
