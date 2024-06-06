import { CodeAction, CodeActionKind, Diagnostic, DiagnosticSeverity, Range } from "vscode-languageserver";

import { DiagnosticCode } from "../utils/diagnostics";
import { ConditionEntry as ConditionEntryV1 } from "./v1/Condition/ConditionEntry";
import { ConditionEntry as ConditionEntryV2 } from "./v2/Condition/ConditionEntry";
import { EventEntry as EventEntryV1 } from "./v1/Event/EventEntry";
import { EventEntry as EventEntryV2 } from "./v2/Event/EventEntry";
import { ObjectiveEntry as ObjectiveEntryV1 } from "./v1/Objective/ObjectiveEntry";
import { ObjectiveEntry as ObjectiveEntryV2 } from "./v2/Objective/ObjectiveEntry";
import { Option as OptionV1 } from "./v1/Conversation/Option/Option";
import { Option as OptionV2 } from "./v2/Conversation/Option/Option";
import { SemanticToken } from "../service/semanticTokens";
import { PackageV1 } from "./v1/Package";
import { PackageV2 } from "./v2/Package";
import { AST } from "./ast";
import { NodeV1 } from "./v1";
import { NodeV2 } from "./v2";

export type PackageV1Type = 'PackageV1';
export type PackageV2Type = 'PackageV2';
export type PackageTypes = PackageV1Type | PackageV2Type;

export type ConversationListType = 'ConversationList';
export type ConversationType = 'Conversation';
export type ConversationKeyType = 'ConversationKey';
export type ConversationQuesterType = 'ConversationQuester';
export type ConversationQuesterTranslationsType = 'ConversationQuesterTranslations';
export type ConversationFirstType = 'ConversationFirst';
export type ConversationStopType = 'ConversationStop';
export type ConversationFinalEventsType = 'ConversationFinalEvents';
export type ConversationInterceptorType = 'ConversationInterceptor';
export type ConversationNpcOptionType = 'ConversationNpcOption';
export type ConversationPlayerOptionType = 'ConversationPlayerOption';
export type ConversationOptionType = ConversationNpcOptionType | ConversationPlayerOptionType;
export type ConversationTextType = 'ConversationText';
export type ConversationConditionsType = 'ConversationConditions';
export type ConversationConditionType = 'ConversationCondition';
export type ConversationEventsType = 'ConversationEvents';
export type ConversationEventType = 'ConversationEvent';
export type ConversationPointersType = 'ConversationPointers';
export type ConversationPointerType = 'ConversationPointer';
export type ConversationTextTranslationsType = 'ConversationTextTranslations';
export type ConversationTypes = ConversationListType | ConversationType | ConversationKeyType | ConversationQuesterType | ConversationQuesterTranslationsType | ConversationFirstType | ConversationStopType | ConversationFinalEventsType | ConversationInterceptorType | ConversationOptionType | ConversationTextType | ConversationConditionsType | ConversationConditionType | ConversationEventsType | ConversationEventType | ConversationPointersType | ConversationPointerType | ConversationTextTranslationsType;

export type EventListType = 'EventList';
export type EventEntryType = 'EventEntry';
export type EventKeyType = 'EventKey';
export type EventKindType = 'EventKind';
export type EventArgumentsType = 'EventArguments';
export type EventArgumentType = 'EventArgument';
export type EventArgumentKeyType = 'EventArgumentKey';
export type EventArgumentValueArrayType = 'EventArgumentValueArray';
export type EventArgumentValueType = 'EventArgumentValue';
export type EventArgumentsListType = 'EventArgumentsList';
export type EventTypes = EventListType | EventEntryType | EventKeyType | EventKindType | EventArgumentsType | EventArgumentType | EventArgumentKeyType | EventArgumentValueArrayType | EventArgumentValueType;

export type ConditionListType = 'ConditionList';
export type ConditionEntryType = 'ConditionEntry';
export type ConditionKeyType = 'ConditionKey';
export type ConditionKindType = 'ConditionKind';
export type ConditionArgumentsType = 'ConditionArguments';
export type ConditionArgumentType = 'ConditionArgument';
export type ConditionArgumentKeyType = 'ConditionArgumentKey';
export type ConditionArgumentValueArrayType = 'ConditionArgumentValueArray';
export type ConditionArgumentValueType = 'ConditionArgumentValue';
export type ConditionTypes = ConditionListType | ConditionEntryType | ConditionKeyType | ConditionKindType | ConditionArgumentsType | ConditionArgumentType | ConditionArgumentKeyType | ConditionArgumentValueArrayType | ConditionArgumentValueType;

export type ObjectiveListType = 'ObjectiveList';
export type ObjectiveEntryType = 'ObjectiveEntry';
export type ObjectiveKeyType = 'ObjectiveKey';
export type ObjectiveKindType = 'ObjectiveKind';
export type ObjectiveArgumentsType = 'ObjectiveArguments';
export type ObjectiveArgumentType = 'ObjectiveArgument';
export type ObjectiveArgumentKeyType = 'ObjectiveArgumentKey';
export type ObjectiveArgumentValueArrayType = 'ObjectiveArgumentValueArray';
export type ObjectiveArgumentValueType = 'ObjectiveArgumentValue';
export type ObjectiveTypes = ObjectiveListType | ObjectiveEntryType | ObjectiveKeyType | ObjectiveKindType | ObjectiveArgumentsType | ObjectiveArgumentType | ObjectiveArgumentKeyType | ObjectiveArgumentValueArrayType | ObjectiveArgumentValueType;

export type ElementListType = EventListType | ConditionListType | ObjectiveListType;
export type ElementEntryType = EventEntryType | ConditionEntryType | ObjectiveEntryType;
export type ElementKeyType = EventKeyType | ConditionKeyType | ObjectiveKeyType;
export type ElementKindType = EventKindType | ConditionKindType | ObjectiveKindType;
export type ElementArgumentsType = EventArgumentsType | ConditionArgumentsType | ObjectiveArgumentsType;
export type ElementArgumentType = EventArgumentType | ConditionArgumentType | ObjectiveArgumentType;
export type ElementArgumentKeyType = EventArgumentKeyType | ConditionArgumentKeyType | ObjectiveArgumentKeyType;
export type ElementArgumentValueArrayType = EventArgumentValueArrayType | ConditionArgumentValueArrayType | ObjectiveArgumentValueArrayType;
export type ElementArgumentValueType = EventArgumentValueType | ConditionArgumentValueType | ObjectiveArgumentValueType;
export type ElementTypes = ElementListType | ElementEntryType | ElementKeyType | ElementKindType | ElementArgumentsType | ElementArgumentType | ElementArgumentKeyType | ElementArgumentValueArrayType | ElementArgumentValueType;

export type NodeType = PackageTypes | ConversationTypes | EventTypes | ConditionTypes | ObjectiveTypes;

export abstract class AbstractNode<T extends NodeType, N extends NodeV1 | NodeV2> {
  abstract readonly type: T;
  abstract readonly uri: string;
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  abstract readonly parent: N;
  protected children: N[] = [];
  protected diagnostics: Diagnostic[] = [];
  protected codeActions: CodeAction[] = [];
  protected semanticTokens: SemanticToken[] = [];

  addChild(child: N) {
    this.children.push(child);
  }

  getChild<Node extends N>(type: NodeType, additionalCheck?: (child: Node) => boolean) {
    return this.children.find<Node>((c): c is Node => c.type === type && (!additionalCheck || additionalCheck(c as Node)));
  }

  getChildren<Node extends N>(type: NodeType, additionalCheck?: (child: Node) => boolean) {
    return this.children.filter<Node>((c): c is Node => c.type === type && (!additionalCheck || additionalCheck(c as Node)));
  }

  /**
   * Get the root AST node
   */
  abstract getAst(): AST;

  addDiagnostic(offsets: [offsetStart?: number, offsetEnd?: number], message: string, severity: DiagnosticSeverity, code: DiagnosticCode, codeActions?: { title: string, text: string, range?: [offsetStart: number, offsetEnd: number] }[]) {
    if (offsets[0] === undefined || offsets[1] === undefined) {
      return;
    }
    const range = this.getRangeByOffset(offsets[0], offsets[1]);
    const diagnostic: Diagnostic = {
      range: range,
      message: message,
      severity: severity,
      source: 'BetonQuest',
      code: code
    };
    this.diagnostics.push(diagnostic);
    codeActions?.forEach(({ title, text, range: r }) => {
      this.codeActions.push({
        title: title,
        kind: CodeActionKind.QuickFix,
        diagnostics: [diagnostic],
        edit: {
          changes: {
            [this.uri]: [{
              range: r ? this.getRangeByOffset(r[0], r[1]) : range,
              newText: text
            }]
          }
        }
      });
    });
  }

  getDiagnostics() {
    return this.diagnostics;
  }

  getCodeActions() {
    return this.codeActions;
  }

  // Get range by offset.
  // This method must be overrided / hijacked by the top-level class.
  getRangeByOffset(offsetStart: number, offsetEnd: number): Range {
    return this.parent.getRangeByOffset(offsetStart, offsetEnd);
  }

  // Get target package's uri by package path.
  // This method must be overrided / hijacked by the top-level class.
  getPackageUri(targetPackagePath: string): string {
    return this.parent.getPackageUri(targetPackagePath);
  }
};
